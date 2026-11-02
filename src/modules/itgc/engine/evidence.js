// Builds annotated evidence screenshots: the real uploaded image / PDF page, or a
// faithful render of the spreadsheet / SAP SE16 screen / text file, with the
// parameter and the tested value boxed (green = PASS, red = FAIL) and an
// annotation panel describing source, policy, actual value and conclusion.
import { OPS, RES_LABEL, loadImage } from "./util";

const GREEN = "#16a34a", RED = "#dc2626", INDIGO = "#6366f1", AMBER = "#d97706";
const FONT = "Arial, Helvetica, sans-serif";

function box(g, b, color, label, scale = 1) {
  if (!b) return;
  const pad = 4 * scale;
  g.lineWidth = 3 * scale;
  g.strokeStyle = color;
  g.strokeRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
  if (label) {
    g.font = `bold ${Math.round(11 * scale)}px ${FONT}`;
    const tw = g.measureText(label).width + 10 * scale;
    const th = 16 * scale;
    let ly = b.y - pad - th - 2 * scale;
    if (ly < 0) ly = b.y + b.h + pad + 2 * scale;
    g.fillStyle = color;
    g.fillRect(b.x - pad, ly, tw, th);
    g.fillStyle = "#fff";
    g.fillText(label, b.x - pad + 5 * scale, ly + th - 4.5 * scale);
  }
}

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.round(w);
  c.height = Math.round(h);
  return c;
}

/* ---------- renders of tabular sources ---------- */
function renderGrid(src, row, x, sapStyle) {
  const { aoa, header, cols, sheet } = src.table;
  const hd = header >= 0 ? aoa[header] : aoa[0];
  const colIdx = [cols.h, cols.p, cols.v, cols.s].filter((c) => c != null && c >= 0);
  const extra = hd.map((_, i) => i).filter((i) => !colIdx.includes(i)).slice(0, Math.max(0, 5 - colIdx.length));
  const show = [...colIdx, ...extra].sort((a, b) => a - b);
  const widths = show.map((ci) => {
    const len = Math.max(String(hd[ci] ?? "").length, ...aoa.slice(Math.max(0, row.ri - 4), row.ri + 5).map((r) => String(r?.[ci] ?? "").length));
    return Math.min(330, Math.max(70, len * 7.6 + 24));
  });
  const rowNoW = sapStyle ? 0 : 46;
  const W = Math.max(820, rowNoW + widths.reduce((a, b) => a + b, 0) + 20);
  const top = sapStyle ? 92 : 64;
  const RH = 28;
  const first = Math.max(header + 1, row.ri - 3);
  const list = [];
  for (let i = first; i < Math.min(aoa.length, first + 8); i++) list.push(i);
  const H = top + RH * (list.length + 1) + 34;
  const c = canvas(W, H);
  const g = c.getContext("2d");
  g.fillStyle = "#fff";
  g.fillRect(0, 0, W, H);

  if (sapStyle) {
    g.fillStyle = "#0a6ed1";
    g.fillRect(0, 0, W, 34);
    g.fillStyle = "#fff";
    g.font = `bold 14px ${FONT}`;
    g.fillText(`Data Browser: Table ${src.sap?.table || "PAHI"}   Select Entries   ${(src.sap?.screenCount ?? src.rows.length).toLocaleString()}`, 14, 22);
    g.fillStyle = "#eef3f8";
    g.fillRect(0, 34, W, 30);
    g.fillStyle = "#32363a";
    g.font = `12px ${FONT}`;
    g.fillText(`System: ${src.sap?.sid || ""}   Client: ${src.sap?.client || ""}   User: ${src.sap?.user || ""}   Transaction: SE16`, 14, 54);
    g.fillStyle = "#dfe7ef";
    g.fillRect(0, 64, W, 28);
  } else {
    g.fillStyle = "#107c41";
    g.fillRect(0, 0, W, 30);
    g.fillStyle = "#fff";
    g.font = `bold 13px ${FONT}`;
    g.fillText(`${src.name}  ›  ${sheet || "Sheet1"}`, 12, 20);
    g.fillStyle = "#f3f3f3";
    g.fillRect(0, 30, W, 34);
    g.fillStyle = "#666";
    g.font = `12px ${FONT}`;
    let cx = rowNoW;
    show.forEach((ci, k) => {
      g.fillText(String.fromCharCode(65 + (ci % 26)), cx + widths[k] / 2 - 4, 52);
      cx += widths[k];
    });
  }
  // header row
  const hy = top;
  g.fillStyle = sapStyle ? "#dfe7ef" : "#e9eef5";
  g.fillRect(0, hy, W, RH);
  g.fillStyle = "#1e293b";
  g.font = `bold 12.5px ${FONT}`;
  let cx = rowNoW + 8;
  if (!sapStyle) g.fillText(String(header + 1), 10, hy + 18);
  show.forEach((ci, k) => {
    g.fillText(String(hd[ci] ?? ""), cx, hy + 18);
    cx += widths[k];
  });
  let pBox = null, vBox = null;
  list.forEach((ri, k) => {
    const y = top + RH * (k + 1);
    const hit = ri === row.ri;
    g.fillStyle = hit ? "#fef9c3" : k % 2 ? "#fafbfc" : "#fff";
    g.fillRect(0, y, W, RH);
    g.strokeStyle = "#e5e7eb";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, y + RH);
    g.lineTo(W, y + RH);
    g.stroke();
    if (!sapStyle) {
      g.fillStyle = "#f3f3f3";
      g.fillRect(0, y, rowNoW, RH);
      g.fillStyle = "#555";
      g.font = `12px ${FONT}`;
      g.fillText(String(ri + 1), 10, y + 18);
    }
    let x0 = rowNoW + 8;
    show.forEach((ci, j) => {
      const val = String(aoa[ri]?.[ci] ?? "");
      g.fillStyle = "#1e293b";
      g.font = `13px ${FONT}`;
      g.fillText(val.length > 44 ? val.slice(0, 43) + "…" : val, x0, y + 19);
      if (hit && ci === src.table.cols.p) pBox = { x: x0, y: y + 5, w: g.measureText(val).width, h: 18 };
      if (hit && ci === src.table.cols.v) vBox = { x: x0, y: y + 5, w: Math.max(14, g.measureText(val).width), h: 18 };
      x0 += widths[j];
    });
  });
  g.fillStyle = "#94a3b8";
  g.font = `11px ${FONT}`;
  g.fillText(sapStyle ? "Screen rendered from the SAP extract retrieved by the agent" : `Rendered from ${src.name}, sheet "${sheet}" – row numbers match the file`, 10, H - 12);
  const ok = x.res === "p";
  box(g, pBox, INDIGO, "PARAMETER");
  box(g, vBox, ok ? GREEN : RED, ok ? "VALUE ✓ PASS" : "VALUE ✗ FAIL");
  return c;
}

function renderText(src, row, x) {
  const lines = src.lines;
  const i0 = Math.max(0, row.n - 4);
  const list = lines.slice(i0, i0 + 8);
  const W = 860, LH = 26, top = 44;
  const c = canvas(W, top + list.length * LH + 34);
  const g = c.getContext("2d");
  g.fillStyle = "#fff";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#334155";
  g.fillRect(0, 0, W, 32);
  g.fillStyle = "#fff";
  g.font = `bold 13px ${FONT}`;
  g.fillText(src.name, 12, 21);
  let pBox = null, vBox = null;
  list.forEach((t, k) => {
    const y = top + k * LH;
    const ln = i0 + k + 1;
    const hit = ln === row.n;
    if (hit) {
      g.fillStyle = "#fef9c3";
      g.fillRect(0, y - 2, W, LH);
    }
    g.fillStyle = "#94a3b8";
    g.font = `12px Consolas, monospace`;
    g.fillText(String(ln).padStart(4), 8, y + 16);
    g.fillStyle = "#1e293b";
    g.font = `13px Consolas, monospace`;
    const txt = t.length > 100 ? t.slice(0, 99) + "…" : t;
    g.fillText(txt, 56, y + 16);
    if (hit) {
      const pi = txt.indexOf(row.p);
      const vi = txt.indexOf(String(row.v), pi >= 0 ? pi + row.p.length : 0);
      const m = (s) => g.measureText(s).width;
      if (pi >= 0) pBox = { x: 56 + m(txt.slice(0, pi)), y: y + 3, w: m(row.p), h: 17 };
      if (vi >= 0) vBox = { x: 56 + m(txt.slice(0, vi)), y: y + 3, w: Math.max(12, m(String(row.v))), h: 17 };
    }
  });
  g.fillStyle = "#94a3b8";
  g.font = `11px ${FONT}`;
  g.fillText(`Rendered from ${src.name} – line numbers match the file`, 10, c.height - 10);
  const ok = x.res === "p";
  box(g, pBox, INDIGO, "PARAMETER");
  box(g, vBox, ok ? GREEN : RED, ok ? "VALUE ✓ PASS" : "VALUE ✗ FAIL");
  return c;
}

async function renderImage(url, w, h, row, x) {
  const img = await loadImage(url);
  const s = Math.min(1, 1600 / w);
  const c = canvas(w * s, h * s);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0, c.width, c.height);
  const sc = (b) => b && { x: b.x * s, y: b.y * s, w: b.w * s, h: b.h * s };
  const k = Math.max(1, c.width / 900);
  const ok = x.res === "p";
  const b = row.boxes || {};
  if (b.line && !b.p && !b.v) box(g, sc(b.line), ok ? GREEN : RED, ok ? "✓ PASS" : "✗ FAIL", k);
  box(g, sc(b.p), INDIGO, "PARAMETER", k);
  box(g, sc(b.v), ok ? GREEN : RED, ok ? "VALUE ✓ PASS" : "VALUE ✗ FAIL", k);
  return c;
}

function withPanel(base, x, inst, src, meta, idx) {
  const W = Math.max(base.width, 820);
  const k = W / 820;
  const PH = 150 * k;
  const c = canvas(W, base.height + PH);
  const g = c.getContext("2d");
  g.fillStyle = "#fff";
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(base, (W - base.width) / 2, 0);
  g.strokeStyle = "#e2e8f0";
  g.lineWidth = 1;
  g.strokeRect(0.5, 0.5, W - 1, base.height - 1);
  const ok = inst.res === "p";
  const col = ok ? GREEN : RED;
  const y0 = base.height + 8 * k;
  g.fillStyle = "#f8fafc";
  g.fillRect(8 * k, y0, W - 16 * k, PH - 16 * k);
  g.strokeStyle = INDIGO;
  g.lineWidth = 2 * k;
  g.strokeRect(8 * k, y0, W - 16 * k, PH - 16 * k);
  // stamp
  const sw = 120 * k, sh = 44 * k, sx = W - sw - 24 * k, sy = y0 + 16 * k;
  g.strokeStyle = col;
  g.lineWidth = 3 * k;
  g.strokeRect(sx, sy, sw, sh);
  g.fillStyle = col;
  g.font = `bold ${Math.round(22 * k)}px ${FONT}`;
  g.fillText(ok ? "✓ PASS" : "✗ FAIL", sx + 14 * k, sy + 30 * k);

  g.fillStyle = "#1e293b";
  g.font = `bold ${Math.round(13 * k)}px ${FONT}`;
  g.fillText(`EVIDENCE ANNOTATION · Attribute ${idx}: ${x.a.d}`.slice(0, 95), 20 * k, y0 + 22 * k);
  const r = inst.r;
  const where = src.kind === "pdf" ? `page ${(r.page ?? 0) + 1}, ${String(r.n).replace(/^p\d+ /, "")}` : src.kind === "image" ? `text line ${r.n}` : src.kind === "text" ? `line ${r.n}` : `row ${r.n}`;
  const lines = [
    [`Source: ${src.name}${src.table?.sheet ? " › " + src.table.sheet : ""}, ${where}${r.host ? "   |   Host: " + r.host : ""}`, "#475569", false],
    [`Policy: ${x.a.key} ${OPS[x.a.op]} ${x.a.val}   |   Actual: ${inst.act}   |   Result: ${RES_LABEL[inst.res]}${inst.note ? " (" + inst.note + ")" : ""}`, col, true],
    [`Population: ${meta.ca.active.toLocaleString()} active of ${meta.ca.total.toLocaleString()} entries${meta.ca.expected != null ? `   |   System count: ${meta.ca.expected.toLocaleString()} (${meta.ca.ca ? "agreed" : "MISMATCH"})` : ""}`, "#475569", false],
    [`Policy source: “${x.a.src.slice(0, 90)}${x.a.src.length > 90 ? "…" : ""}”`, "#64748b", false],
    [`Tested by Agentic Controls Testing on ${meta.ts.toLocaleString()}`, "#94a3b8", false],
  ];
  lines.forEach(([t, color, bold], i) => {
    g.fillStyle = color;
    g.font = `${bold ? "bold " : ""}${Math.round(12 * k)}px ${FONT}`;
    g.fillText(t.slice(0, 120), 20 * k, y0 + (44 + i * 19) * k);
  });
  return c;
}

export async function buildEvidence(x, inst, src, meta, idx) {
  let base;
  if (src.kind === "sap") base = renderGrid(src, inst.r, inst, true);
  else if (src.kind === "table") base = renderGrid(src, inst.r, inst, false);
  else if (src.kind === "text") base = renderText(src, inst.r, inst);
  else if (src.kind === "image") base = await renderImage(src.image.url, src.image.w, src.image.h, inst.r, inst);
  else if (src.kind === "pdf") {
    const pg = src.pages[inst.r.page ?? 0];
    base = await renderImage(pg.url, pg.w, pg.h, inst.r, inst);
  }
  const c = withPanel(base, x, inst, src, meta, idx);
  return { url: c.toDataURL("image/png"), w: c.width, h: c.height };
}

export async function imageInfo(url) {
  const img = await loadImage(url);
  return { url, w: img.naturalWidth, h: img.naturalHeight };
}
export { GREEN, RED, AMBER };
