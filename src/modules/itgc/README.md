# Agentic ITGC Control Testing module

Flow: policy document → choose evidence source (SAP or manual upload) → completeness & accuracy →
attribute testing → annotated evidence → report (preview, Word .docx, PDF) with exceptions.

* Policy: .docx, .pdf (text or scanned), .txt/.md, Excel/CSV, images (OCR), or pasted text.
* Evidence (manual): Excel/CSV extracts (any sheet / header layout), PDF, Word/text exports,
  screenshots (OCR – the real image is annotated with PASS/FAIL boxes).
* SAP: set `VITE_SAP_GATEWAY_URL` (see `.env.example`); otherwise a demo connector is used.

Files
- `ItgcAgent.jsx` – chat agent UI + flow
- `components/ui.jsx` – bubbles, source picker, SAP form, checklist, report preview
- `engine/policy.js` – policy → test attributes (knowledge base + generic rules)
- `engine/readers.js` – file readers (xlsx, csv, pdf, docx, txt, images via tesseract.js)
- `engine/sap.js` – SAP gateway / demo connector
- `engine/testing.js` – population, matching, PASS/FAIL, completeness & sample tie-out
- `engine/evidence.js` – annotated screenshots
- `engine/report.js`, `exportDocx.js`, `exportPdf.js` – report model and downloads
