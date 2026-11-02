import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { OPS_ASCII, loadImage } from "./util";

const ascii = (s) => String(s ?? "").replace(/≥/g, ">=").replace(/≤/g, "<=").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, "-").replace(/…/g, "...").replace(/✓/g, "").replace(/✗/g, "");
const RC = { p: [[220, 252, 231], [22, 101, 52]], f: [[254, 226, 226], [153, 27, 27]], n: [[255, 237, 213], [154, 52, 18]] };

export async function downloadPdf(R) {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 40;
  const CW = W - L * 2;
  let y = 40;
  const need = (h) => {
    if (y + h > H - 50) {
      doc.addPage();
      y = 50;
    }
  };
  const heading = (t) => {
    need(40);
    y += 14;
    doc.setFillColor(99, 102, 241);
    doc.rect(L, y - 11, 3, 15, "F");
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(30, 41, 59).text(ascii(t), L + 10, y);
    y += 12;
  };
  const textBlock = (t, size = 10, color = [71, 85, 105], bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size).setTextColor(...color);
    const lines = doc.splitTextToSize(ascii(t), CW);
    need(lines.length * size * 1.35);
    doc.text(lines, L, y);
    y += lines.length * size * 1.35 + 4;
  };
  const tbl = (head, body, opts = {}) => {
    autoTable(doc, {
      startY: y, head: [head.map(ascii)], body: body.map((r) => r.map((c) => (typeof c === "object" && c ? { content: ascii(c.t), styles: c.styles } : ascii(c)))),
      margin: { left: L, right: L }, styles: { fontSize: 8.5, cellPadding: 4, textColor: [51, 65, 85], lineColor: [226, 232, 240], lineWidth: 0.5, overflow: "linebreak" },
      headStyles: { fillColor: [241, 245, 249], textColor: [100, 116, 139], fontStyle: "bold" }, alternateRowStyles: { fillColor: [250, 251, 252] },
      ...opts,
    });
    y = doc.lastAutoTable.finalY + 10;
  };
  const badge = (res, label) => ({ t: label, styles: { fillColor: RC[res][0], textColor: RC[res][1], fontStyle: "bold" } });

  // header
  try {
    const logo = await loadImage(import.meta.env.BASE_URL + "DeloitteLogo.png");
    const lh = 34;
    doc.addImage(logo, "PNG", L, y, (logo.naturalWidth / logo.naturalHeight) * lh, lh);
  } catch {
    doc.setFont("helvetica", "bold").setFontSize(20).text("Deloitte", L, y + 24);
  }
  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(100, 116, 139).text("IT GENERAL CONTROLS", W - L, y + 14, { align: "right" }).text("TEST REPORT", W - L, y + 25, { align: "right" });
  y += 44;
  doc.setDrawColor(99, 102, 241).setLineWidth(2).line(L, y, W - L, y);
  y += 28;
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(30, 41, 59);
  const tl = doc.splitTextToSize(ascii(R.title), CW);
  doc.text(tl, L, y);
  y += tl.length * 20;
  textBlock(`${R.system} - ${R.date}`, 10, [100, 116, 139]);
  tbl(["Field", "Detail"], [
    ["Report reference", R.id], ["Policy document", R.policyName], ["System / evidence source", `${R.system} (${R.sourceLabel})`],
    ["Evidence files", R.files.join(", ")], ["Population", `${R.ca.active.toLocaleString()} active of ${R.ca.total.toLocaleString()} entries`],
    ["Performed by", "Agentic Controls Testing"], ["Reviewer sign-off", "Pending"],
  ], { columnStyles: { 0: { cellWidth: 150, fontStyle: "bold" } } });

  heading("Executive summary");
  const bad = R.exceptions.length > 0;
  doc.setFont("helvetica", "normal").setFontSize(10);
  const cl = doc.splitTextToSize(ascii(R.conclusion), CW - 24);
  const bh = 34 + cl.length * 13;
  need(bh + 6);
  doc.setFillColor(...(bad ? [254, 242, 242] : [240, 253, 244])).setDrawColor(...(bad ? [254, 202, 202] : [187, 247, 208])).roundedRect(L, y, CW, bh, 6, 6, "FD");
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...(bad ? [153, 27, 27] : [22, 101, 52])).text(bad ? `Exceptions noted (${R.exceptions.length})` : "No exceptions noted", L + 12, y + 20);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(51, 65, 85).text(cl, L + 12, y + 36);
  y += bh + 10;
  tbl(["Attributes tested", "Passed", "Failed", "Not found", "Population vs system"], [[String(R.N), badge("p", String(R.p)), badge(R.f ? "f" : "p", String(R.f)), badge(R.n ? "n" : "p", String(R.n)), R.ca.expected == null ? "Not supplied" : R.ca.ca ? "Agreed" : "Differs"]]);

  heading("1. Scope and approach");
  textBlock(`The agent read the policy "${R.policyName}", identified ${R.N} measurable requirement(s) and mapped each to a system setting. Evidence was obtained from ${R.sourceLabel}. The population was checked for completeness and accuracy, every requirement was tested against the policy threshold, and each result is supported by an annotated screenshot in section 6 (green box = PASS, red box = FAIL).`);

  heading("2. Policy requirements identified");
  tbl(["#", "Requirement (policy text)", "Setting", "Rule", "Severity"], R.results.map((r) => [r.no, r.src, r.key, `${OPS_ASCII[r.op]} ${r.val}`, r.sev]), { columnStyles: { 0: { cellWidth: 22 }, 2: { cellWidth: 140 }, 3: { cellWidth: 50 }, 4: { cellWidth: 55 } } });
  if (R.unmapped.length) {
    textBlock("Policy statements that are not measurable from system settings (manual testing required):", 9.5, [30, 41, 59], true);
    R.unmapped.forEach((u) => textBlock("- " + u, 9));
  }

  heading("3. Completeness and accuracy of the population");
  const sOk = R.ca.sample.every((s) => s.ok);
  tbl(["Check", "Result", "Detail"], [
    ["Record count agrees to system", R.ca.expected == null ? badge("n", "N/A") : badge(R.ca.ca ? "p" : "f", R.ca.ca ? "AGREED" : "DIFFERS"), R.ca.expected == null ? "No system record count supplied" : `Evidence ${R.ca.active.toLocaleString()} vs system ${R.ca.expected.toLocaleString()}`],
    ["Only active entries tested", badge("p", "OK"), `${R.ca.total - R.ca.active} inactive / superseded entries excluded`],
    [`Random sample re-performed (${R.ca.sample.length})`, badge(sOk ? "p" : "f", sOk ? "AGREED" : "DIFFERS"), R.ca.sample.map((s) => `${s.r.p} = ${s.r.v} (${typeof s.r.n === "number" ? "row " + s.r.n : s.r.n})`).join("; ")],
  ], { columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 65 } } });

  heading("4. Test results");
  tbl(["#", "Requirement", "Setting", "Policy", "Actual", "Result", "Evidence location"], R.results.map((r) => [r.no, r.d, r.key, `${OPS_ASCII[r.op]} ${r.val}`, String(r.actual), badge(r.res, r.label), r.where || "-"]), { columnStyles: { 0: { cellWidth: 20 }, 3: { cellWidth: 42 }, 4: { cellWidth: 45 }, 5: { cellWidth: 55 } } });

  heading("5. Exceptions and recommended actions");
  if (R.exceptions.length)
    tbl(["Ref", "Exception", "Gap", "Severity", "Recommended action", "Owner"], R.exceptions.map((e) => [e.ref, `${e.title}\n${e.key}`, e.gap, badge(e.sev === "High" ? "f" : "n", e.sev.toUpperCase()), e.action, e.owner]), { columnStyles: { 0: { cellWidth: 34 }, 3: { cellWidth: 52 }, 5: { cellWidth: 60 } } });
  else textBlock("No exceptions noted.");

  heading("6. Annotated evidence");
  textBlock("Blue box = setting tested; green box = value passes the policy; red box = value fails the policy.", 9, [100, 116, 139]);
  for (const e of R.evidence) {
    const im = await loadImage(e.img.url);
    const w = CW;
    const hgt = (im.naturalHeight / im.naturalWidth) * w;
    const maxH = H - 110;
    const fw = hgt > maxH ? (maxH / hgt) * w : w;
    const fh = Math.min(hgt, maxH);
    need(fh + 30);
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(30, 41, 59).text(ascii(`6.${e.no} ${e.title}`), L, y + 10);
    doc.setTextColor(...RC[e.res][1]).text(e.res === "p" ? "PASS" : "FAIL", W - L, y + 10, { align: "right" });
    y += 18;
    doc.addImage(e.img.url, "PNG", L, y, fw, fh, undefined, "FAST");
    y += fh + 16;
  }
  if (!R.evidence.length) textBlock("No setting was located in the evidence, so no annotated screenshot could be produced.");

  if (R.refs.length) {
    heading("7. Reference screenshots supplied");
    for (const s of R.refs) {
      const im = await loadImage(s.url);
      const hgt = Math.min((im.naturalHeight / im.naturalWidth) * CW, H - 110);
      const fw = (hgt / ((im.naturalHeight / im.naturalWidth) * CW)) * CW;
      need(hgt + 26);
      textBlock(s.name, 9, [100, 116, 139]);
      const fmt = /png/i.test(s.url.slice(0, 30)) ? "PNG" : "JPEG";
      doc.addImage(s.url, fmt, L, y, fw, hgt, undefined, "FAST");
      y += hgt + 14;
    }
  }

  need(80);
  y += 30;
  doc.setDrawColor(148, 163, 184).setLineWidth(0.6).line(L, y, L + CW / 2 - 20, y).line(L + CW / 2 + 20, y, W - L, y);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100, 116, 139);
  doc.text(["Prepared by: Agentic Controls Testing", R.date], L, y + 14);
  doc.text(["Reviewed by: ______________________", "Date: ______________"], L + CW / 2 + 20, y + 14);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(148, 163, 184);
    doc.text(`${R.id} - AI-assisted results, review by a qualified tester required`, L, H - 22);
    doc.text(`Page ${i} of ${pages}`, W - L, H - 22, { align: "right" });
  }
  doc.save(`${R.id}_ITGC_Test_Report.pdf`);
}
