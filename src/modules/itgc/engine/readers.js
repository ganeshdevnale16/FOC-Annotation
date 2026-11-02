// File readers: any policy file -> text, any evidence file -> parameter rows
// (with exact locations so the evidence can be annotated on the real file).
import * as XLSX from "xlsx";
import mammoth from "mammoth/mammoth.browser.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { PARAM_RE } from "./policy";
import { fileToDataUrl, loadImage, norm } from "./util";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ext = (n) => (n.split(".").pop() || "").toLowerCase();
export const isImage = (f) => f.type?.startsWith("image/") || /^(png|jpe?g|gif|bmp|webp|tiff?)$/.test(ext(f.name));
const LABELS = /^(value|current|current value|setting|param(eter)?|name|default|=|:|-|\|)$/i;
const STATUS = /^(a|i|active|inactive|yes|no|true|false|enabled|disabled)$/i;

/* ---------------- text-line parsing ---------------- */
export function parseLine(text) {
  const t = String(text).replace(/[|¦│]/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return null;
  const m = t.match(PARAM_RE);
  if (m) {
    const before = t.slice(0, m.index).trim().split(" ");
    const tokens = t.slice(m.index + m[0].length).replace(/^[\s:=,;]+/, "").split(" ").filter(Boolean);
    const vi = tokens.findIndex((x) => !LABELS.test(x));
    if (vi < 0) return null;
    const last = tokens[tokens.length - 1];
    return {
      p: m[1].replace(/[.,;:]+$/, ""),
      v: tokens[vi].replace(/[,;]+$/, ""),
      s: tokens.length > vi + 1 && STATUS.test(last) ? last : "",
      host: before.length && /[_\-.]|\d/.test(before[before.length - 1]) ? before[before.length - 1] : "",
    };
  }
  const kv = t.match(/^([A-Za-z][\w ()/\-*.]{2,70}?)\s*[:=]\s*(\S.{0,40})$/);
  if (kv && !/^(https?|date|page|printed|time)$/i.test(kv[1].trim())) {
    const v = kv[2].trim().split(" ")[0];
    return { p: kv[1].trim(), v, s: "", host: "" };
  }
  return null;
}

/* ---------------- policy files ---------------- */
export async function readPolicyFile(file, onProgress) {
  const e = ext(file.name);
  if (e === "docx") return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  if (e === "pdf") {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const out = [];
    for (let i = 1; i <= pdf.numPages; i++) out.push(...(await pdfLines(pdf, i)).map((l) => l.text));
    const txt = out.join("\n");
    if (txt.trim().length > 20) return txt;
    onProgress?.("Scanned PDF detected, running OCR…");
    const pages = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) pages.push((await renderPdfPage(pdf, i)).url);
    const texts = [];
    for (const u of pages) texts.push((await ocr(u, onProgress)).text);
    return texts.join("\n");
  }
  if (/^(xlsx|xls|xlsm|csv)$/.test(e)) {
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    return wb.SheetNames.map((n) => XLSX.utils.sheet_to_csv(wb.Sheets[n], { FS: " " })).join("\n");
  }
  if (isImage(file)) return (await ocr(await fileToDataUrl(file), onProgress)).text;
  if (e === "doc") throw new Error("Old .doc format is not supported – please save it as .docx or PDF.");
  return await file.text();
}

/* ---------------- OCR ---------------- */
let workerP = null;
let progressCb = null;
async function getWorker() {
  if (!workerP) {
    workerP = (async () => {
      const { createWorker } = await import("tesseract.js");
      return createWorker("eng", 1, {
        logger: (m) => m.status === "recognizing text" && progressCb?.(`Reading text from image… ${Math.round(m.progress * 100)}%`),
      });
    })();
  }
  return workerP;
}
export async function ocr(url, onProgress) {
  progressCb = onProgress;
  const w = await getWorker();
  const { data } = await w.recognize(url);
  const lines = (data.lines || []).map((l) => ({
    text: l.text.trim(),
    words: (l.words || []).map((w) => ({ text: w.text, b: w.bbox })),
  }));
  return { text: data.text || lines.map((l) => l.text).join("\n"), lines };
}

/* ---------------- PDF helpers ---------------- */
async function pdfLines(pdf, pageNo, viewport) {
  const page = await pdf.getPage(pageNo);
  const vp = viewport || page.getViewport({ scale: 1.6 });
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((it) => it.str && it.str.trim())
    .map((it) => {
      const [x, y] = vp.convertToViewportPoint(it.transform[4], it.transform[5]);
      const h = Math.abs(it.transform[3]) * vp.scale || 10;
      return { text: it.str, x, y: y - h, w: it.width * vp.scale, h: h * 1.15 };
    });
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  const lines = [];
  for (const it of items) {
    const ln = lines.find((l) => Math.abs(l.y - it.y) < it.h * 0.5);
    if (ln) ln.items.push(it);
    else lines.push({ y: it.y, items: [it] });
  }
  return lines.map((l) => {
    l.items.sort((a, b) => a.x - b.x);
    // split pdf items into words with estimated boxes
    const words = [];
    l.items.forEach((it) => {
      const parts = it.text.split(/(\s+)/);
      const cw = it.w / Math.max(1, it.text.length);
      let off = 0;
      parts.forEach((p) => {
        if (p.trim()) words.push({ text: p, b: { x0: it.x + off * cw, y0: it.y, x1: it.x + (off + p.length) * cw, y1: it.y + it.h } });
        off += p.length;
      });
    });
    return { text: l.items.map((i) => i.text).join(" "), words };
  });
}
async function renderPdfPage(pdf, pageNo) {
  const page = await pdf.getPage(pageNo);
  const vp = page.getViewport({ scale: 1.6 });
  const c = document.createElement("canvas");
  c.width = vp.width;
  c.height = vp.height;
  const g = c.getContext("2d");
  g.fillStyle = "#fff";
  g.fillRect(0, 0, c.width, c.height);
  await page.render({ canvasContext: g, viewport: vp }).promise;
  return { url: c.toDataURL("image/png"), w: c.width, h: c.height, vp };
}

// locate parameter + value words on an OCR / PDF line
function locate(line, row) {
  const words = line.words || [];
  const np = norm(row.p);
  const first = norm(row.p.split(/\s+/)[0]);
  const pw = words.filter((w) => {
    const t = norm(w.text);
    return t && (np.includes(t) || t.includes(first)) && t.length > 1;
  });
  const vw = words.find((w) => norm(w.text).replace(/[,;]+$/, "") === norm(row.v) && !pw.includes(w)) ||
    [...words].reverse().find((w) => norm(w.text).includes(norm(row.v)));
  const box = (ws) => {
    if (!ws.length) return null;
    const x0 = Math.min(...ws.map((w) => w.b.x0)), y0 = Math.min(...ws.map((w) => w.b.y0));
    const x1 = Math.max(...ws.map((w) => w.b.x1)), y1 = Math.max(...ws.map((w) => w.b.y1));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };
  const all = box(words);
  return { p: box(pw), v: vw ? box([vw]) : null, line: all };
}

function rowsFromLines(lines, srcId, extra = {}) {
  const rows = [];
  lines.forEach((ln, i) => {
    const r = parseLine(ln.text);
    if (r) rows.push({ ...r, n: i + 1, src: srcId, raw: ln.text, ...extra, boxes: ln.words ? locate(ln, r) : null });
  });
  return rows;
}

/* ---------------- spreadsheets ---------------- */
function tableFromAoa(aoa, sheet, srcId) {
  let h = -1;
  for (let i = 0; i < Math.min(15, aoa.length); i++) {
    const r = aoa[i].map((c) => String(c).toLowerCase());
    if (r.some((c) => /param|name|key|attribute|setting|field|control/.test(c)) && r.some((c) => /val|current|config|setting/.test(c))) {
      h = i;
      break;
    }
  }
  const hd = h >= 0 ? aoa[h].map((c) => String(c)) : [];
  const f = (re, not = -1) => hd.findIndex((c, i) => i !== not && re.test(c));
  let pc = f(/param|name|key|attribute|field|control/i);
  let vc = f(/current|value|setting|config/i, pc);
  const sc = f(/status|state|active/i);
  const hc = f(/host|server|instance|system|sid/i);
  if (pc < 0 || vc < 0) {
    // no header: find the column that holds parameter-looking text, value is next column
    const counts = {};
    aoa.slice(0, 200).forEach((r) => r.forEach((c, i) => PARAM_RE.test(String(c)) && (counts[i] = (counts[i] || 0) + 1)));
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    pc = best ? +best[0] : 0;
    vc = pc + 1;
  }
  const rows = aoa
    .slice(h + 1)
    .map((r, i) => ({
      n: h + i + 2, ri: h + i + 1,
      host: hc >= 0 ? String(r[hc] ?? "").trim() : "",
      p: String(r[pc] ?? "").trim(),
      v: typeof r[vc] === "number" ? r[vc] : String(r[vc] ?? "").trim(),
      s: sc >= 0 ? String(r[sc] ?? "").trim() : "",
      src: srcId,
    }))
    .filter((r) => r.p);
  return { rows, table: { aoa, header: h, sheet, cols: { p: pc, v: vc, s: sc, h: hc } } };
}

/* ---------------- evidence files ---------------- */
let SEQ = 0;
export async function readEvidenceFile(file, onProgress) {
  const e = ext(file.name);
  const id = "src" + ++SEQ;
  if (/^(xlsx|xls|xlsm|csv|ods)$/.test(e)) {
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    let best = null;
    for (const sn of wb.SheetNames) {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: "", raw: true });
      if (!aoa.length) continue;
      const t = tableFromAoa(aoa, sn, id);
      if (!best || t.rows.length > best.rows.length) best = t;
    }
    if (!best) best = { rows: [], table: { aoa: [], header: -1, sheet: "", cols: {} } };
    return { id, name: file.name, kind: "table", ...best };
  }
  if (e === "pdf") {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const rows = [];
    const pages = [];
    let scanned = true;
    for (let i = 1; i <= Math.min(pdf.numPages, 40); i++) {
      onProgress?.(`Reading PDF page ${i} of ${pdf.numPages}…`);
      const lines = await pdfLines(pdf, i);
      if (lines.length > 2) scanned = false;
      const pr = rowsFromLines(lines, id, { page: i - 1 });
      if (pr.length || i <= 2) pages[i - 1] = await renderPdfPage(pdf, i);
      rows.push(...pr.map((r) => ({ ...r, n: `p${i} line ${r.n}` })));
    }
    if (scanned) {
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const pg = pages[i - 1] || (await renderPdfPage(pdf, i));
        pages[i - 1] = pg;
        const o = await ocr(pg.url, onProgress);
        rows.push(...rowsFromLines(o.lines, id, { page: i - 1 }).map((r) => ({ ...r, n: `p${i} line ${r.n}` })));
      }
    }
    return { id, name: file.name, kind: "pdf", rows, pages: pages.map((p) => p && { url: p.url, w: p.w, h: p.h }) };
  }
  if (isImage(file)) {
    const url = await fileToDataUrl(file);
    const img = await loadImage(url);
    const o = await ocr(url, onProgress);
    return { id, name: file.name, kind: "image", rows: rowsFromLines(o.lines, id), image: { url, w: img.naturalWidth, h: img.naturalHeight } };
  }
  let text;
  if (e === "docx") text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  else text = await file.text();
  const lines = text.split(/\r?\n/);
  const rows = rowsFromLines(lines.map((t) => ({ text: t })), id);
  return { id, name: file.name, kind: "text", rows, lines };
}
