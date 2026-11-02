import {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, Packer, PageNumber, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from "docx";
import { dataUrlToBytes, saveBlob, loadImage } from "./util";

const C = { tx: "1E293B", mu: "64748B", ac: "6366F1", ok: "166534", okb: "DCFCE7", bad: "991B1B", badb: "FEE2E2", amb: "FFEDD5", amf: "9A3412", hd: "F1F5F9", bd: "CBD5E1" };
const resColor = (r) => (r === "p" ? [C.okb, C.ok] : r === "f" ? [C.badb, C.bad] : [C.amb, C.amf]);
const border = { style: BorderStyle.SINGLE, size: 4, color: C.bd };
const borders = { top: border, bottom: border, left: border, right: border };

const txt = (t, o = {}) => new TextRun({ text: String(t ?? ""), font: "Calibri", size: o.size || 20, bold: o.bold, color: o.color || C.tx, italics: o.italics });
const para = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120 }, alignment: o.align, children: Array.isArray(t) ? t : [txt(t, o)] });
const h = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, border: { left: { style: BorderStyle.SINGLE, size: 24, color: C.ac, space: 8 } }, children: [txt(t, { bold: true, size: 26 })] });

function cell(content, o = {}) {
  return new TableCell({
    borders,
    width: o.w ? { size: o.w, type: WidthType.PERCENTAGE } : undefined,
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({ children: [txt(content, { bold: o.bold, color: o.color, size: o.size || 18 })] })],
  });
}
function table(head, rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: head.map((t, i) => cell(t, { bold: true, fill: C.hd, w: widths?.[i], color: C.mu })) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => (c && typeof c === "object" && "t" in c ? cell(c.t, { ...c, w: widths?.[i] }) : cell(c, { w: widths?.[i] }))) })),
    ],
  });
}
const badge = (res, label) => {
  const [fill, color] = resColor(res);
  return { t: label, fill, color, bold: true };
};

async function img(url, maxW = 600) {
  const im = await loadImage(url);
  const s = Math.min(1, maxW / im.naturalWidth);
  return new ImageRun({ type: "png", data: dataUrlToBytes(url), transformation: { width: Math.round(im.naturalWidth * s), height: Math.round(im.naturalHeight * s) } });
}
async function logoRun() {
  try {
    const r = await fetch(import.meta.env.BASE_URL + "DeloitteLogo.png");
    const buf = new Uint8Array(await r.arrayBuffer());
    const im = await loadImage(import.meta.env.BASE_URL + "DeloitteLogo.png");
    const hgt = 40;
    return new ImageRun({ type: "png", data: buf, transformation: { width: Math.round((im.naturalWidth / im.naturalHeight) * hgt), height: hgt } });
  } catch {
    return txt("Deloitte", { bold: true, size: 32 });
  }
}

export async function downloadDocx(R) {
  const body = [];
  body.push(new Paragraph({ children: [await logoRun()], border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: C.ac, space: 6 } }, spacing: { after: 200 } }));
  body.push(para([txt("IT GENERAL CONTROLS · TEST REPORT", { size: 16, bold: true, color: C.mu })], { after: 60 }));
  body.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 80 }, children: [txt(R.title, { bold: true, size: 40 })] }));
  body.push(para(`${R.system} · ${R.date}`, { color: C.mu }));
  body.push(table(["Field", "Detail"], [
    ["Report reference", R.id], ["Policy document", R.policyName], ["System / evidence source", `${R.system} (${R.sourceLabel})`],
    ["Evidence files", R.files.join(", ")], ["Population", `${R.ca.active.toLocaleString()} active of ${R.ca.total.toLocaleString()} entries`],
    ["Performed by", "Agentic Controls Testing"], ["Reviewer sign-off", "Pending"],
  ], [30, 70]));

  body.push(h("Executive summary"));
  const [fill, color] = R.exceptions.length ? [C.badb, C.bad] : [C.okb, C.ok];
  body.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [new TableCell({ borders, shading: { type: ShadingType.CLEAR, color: "auto", fill }, margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: [para([txt(R.exceptions.length ? `Exceptions noted (${R.exceptions.length})` : "No exceptions noted", { bold: true, size: 26, color })], { after: 60 }), para(R.conclusion, { after: 0 })] })] })] }));
  body.push(para(""));
  body.push(table(["Attributes tested", "Passed", "Failed", "Not found", "Population vs system"], [[String(R.N), badge("p", String(R.p)), badge(R.f ? "f" : "p", String(R.f)), badge(R.n ? "n" : "p", String(R.n)), R.ca.expected == null ? "Not supplied" : R.ca.ca ? "Agreed" : "Differs"]]));

  body.push(h("1. Scope and approach"));
  body.push(para(`The agent read the policy "${R.policyName}", identified ${R.N} measurable requirement(s) and mapped each to a system setting. Evidence was obtained from ${R.sourceLabel}. The population was checked for completeness and accuracy, every requirement was tested against the policy threshold, and each result is supported by an annotated screenshot in section 6 (green box = PASS, red box = FAIL).`));

  body.push(h("2. Policy requirements identified"));
  body.push(table(["#", "Requirement (policy text)", "Setting", "Rule", "Severity"], R.results.map((r) => [String(r.no), r.src, r.key, r.rule, r.sev]), [6, 46, 26, 10, 12]));
  if (R.unmapped.length) {
    body.push(para("Policy statements that are not measurable from system settings (manual testing required):", { bold: true, after: 60 }));
    R.unmapped.forEach((u) => body.push(new Paragraph({ bullet: { level: 0 }, children: [txt(u, { size: 18 })] })));
  }

  body.push(h("3. Completeness and accuracy of the population"));
  body.push(table(["Check", "Result", "Detail"], [
    ["Record count agrees to system", R.ca.expected == null ? badge("n", "N/A") : badge(R.ca.ca ? "p" : "f", R.ca.ca ? "AGREED" : "DIFFERS"), R.ca.expected == null ? "No system record count supplied" : `Evidence ${R.ca.active.toLocaleString()} vs system ${R.ca.expected.toLocaleString()}`],
    ["Only active entries tested", badge("p", "OK"), `${R.ca.total - R.ca.active} inactive / superseded entries excluded`],
    [`Random sample re-performed (${R.ca.sample.length})`, badge(R.ca.sample.every((s) => s.ok) ? "p" : "f", R.ca.sample.every((s) => s.ok) ? "AGREED" : "DIFFERS"), R.ca.sample.map((s) => `${s.r.p} = ${s.r.v} (${typeof s.r.n === "number" ? "row " + s.r.n : s.r.n})`).join("; ")],
  ], [30, 14, 56]));

  body.push(h("4. Test results"));
  body.push(table(["#", "Requirement", "Setting", "Policy", "Actual", "Conclusion", "Evidence location"], R.results.map((r) => [String(r.no), r.d, r.key, r.rule, String(r.actual), badge(r.res, r.label), r.where || "–"]), [5, 22, 22, 9, 10, 11, 21]));

  body.push(h("5. Exceptions and recommended actions"));
  if (R.exceptions.length)
    body.push(table(["Ref", "Exception", "Gap", "Severity", "Recommended action", "Owner"], R.exceptions.map((e) => [e.ref, `${e.title}\n${e.key}`, e.gap, badge(e.sev === "High" ? "f" : "n", e.sev.toUpperCase()), e.action, e.owner]), [8, 20, 24, 10, 26, 12]));
  else body.push(para("No exceptions noted."));

  body.push(h("6. Annotated evidence"));
  body.push(para("Each screenshot shows the setting (blue box) and the tested value (green = PASS, red = FAIL) with an annotation panel describing source, policy, actual value and conclusion.", { color: C.mu, size: 18 }));
  for (const e of R.evidence) {
    const [, col] = resColor(e.res);
    body.push(para([txt(`6.${e.no} ${e.title} `, { bold: true }), txt(`[${e.res === "p" ? "PASS" : "FAIL"}]`, { bold: true, color: col }), txt(`  ${e.key} · actual ${e.act} · ${e.file}`, { color: C.mu, size: 18 })], { after: 60 }));
    body.push(new Paragraph({ spacing: { after: 240 }, children: [await img(e.img.url)] }));
  }
  if (!R.evidence.length) body.push(para("No setting was located in the evidence, so no annotated screenshot could be produced."));

  if (R.refs.length) {
    body.push(h("7. Reference screenshots supplied"));
    for (const s of R.refs) {
      body.push(para(s.name, { color: C.mu, size: 18, after: 60 }));
      body.push(new Paragraph({ spacing: { after: 200 }, children: [await img(s.url)] }));
    }
  }

  body.push(h("Sign-off"));
  body.push(table(["Prepared by", "Reviewed by"], [[`Agentic Controls Testing\n${R.date}`, "Name: ____________________\nDate: ____________"]], [50, 50]));

  const doc = new Document({
    creator: "Agentic Controls Testing",
    title: R.title,
    styles: { default: { document: { run: { font: "Calibri", size: 20 } } } },
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [txt(`${R.id} · AI-assisted results – review by a qualified tester required · Page `, { size: 16, color: C.mu }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.mu })] })] }) },
      children: body,
    }],
  });
  saveBlob(await Packer.toBlob(doc), `${R.id}_ITGC_Test_Report.docx`);
}
