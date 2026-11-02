# Agentic Controls Testing – ITGC (SAP Password Configuration)

Same stack and UI as `Agentic-control-test-main`: React 19 + Vite 8 + Tailwind 4, lucide-react,
ExcelJS + file-saver (Excel download), SheetJS (reading extracts). Added: mammoth (.docx) and
pdf.js (.pdf) to read policy documents.

## Run
```bash
cd Frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Flow
1. **Policy document** – upload .docx / .pdf / .txt (or "Use demo policy"). The agent extracts every
   measurable requirement and maps it to the SAP profile parameter (A1..An). Behavioural rules are
   listed as "Manual test".
2. **Evidence source** – *Connect to SAP* (agent pulls table PAHI itself) or *Upload an extract*
   (Excel/CSV + the record count shown in SE16 + optional screenshots). A sample extract can be
   downloaded from the chat to try the manual path.
3. **Agent testing** – live checklist (pause/resume) with Pass / Exception / Note per step and a
   time-stamped activity log: connection, extraction, C&A (IPE), sample tie-out, attribute testing,
   evidence annotation.
4. **Results & report** – conclusion, KPIs, results per attribute with procedure / observation /
   conclusion narratives and annotated evidence, exceptions written as condition / criteria / cause /
   effect / recommendation. Downloads: full report (Print / Save as PDF) and Excel workpaper
   (Summary, Test Attributes, Testing, Exceptions, IPE C&A, Evidence images, Audit Trail,
   Processing Log, Population).

## Where things live
| Path | What |
|---|---|
| `src/Chatbot.jsx` | Conversation flow (stages: policy → source → testing → done) and Q&A |
| `src/engine/policyParser.js` | Policy text → test attributes |
| `src/engine/testEngine.js` | C&A, sample, per-instance tests, narratives, exceptions, conclusion |
| `src/engine/sapConnector.js` | **Simulated** SAP connector (PAHI, 2 instances) |
| `src/engine/fileReaders.js` | .docx / .pdf / .txt policy and Excel/CSV extract readers |
| `src/engine/evidenceAnnotator.js` | SE16-style annotated evidence images |
| `src/modules/itgc-password/data/` | Control context, demo policy, SAP parameter knowledge base |
| `src/components/` | Navbar, ModuleMenu, Sidebar, ProcessChecklist, ResultsDashboard, ReportView… |
| `src/utils/exportExcel.js` | Excel workpaper |

## Connecting a real SAP system
The SAP option currently returns simulated data. To go live, replace `generatePahiExtract()`,
`screenRecordCount()` and `requery()` in `src/engine/sapConnector.js` with calls to a backend that
reads PAHI via RFC_READ_TABLE (or OData) using a read-only service account, returning rows in the
same shape: `{ host, system, date, state, param, value }`. Never call SAP directly from the browser.

## Testing logic notes
- Every application server instance is tested; an attribute fails if any instance fails.
- A value of 0 for expiry / lock / idle / auto-logout parameters disables the check and is an exception.
- Parameters missing from the active population are exceptions (kernel default must be confirmed in RZ11).
- In manual mode, checks that need system access are marked "Not performed", not "Agreed".
