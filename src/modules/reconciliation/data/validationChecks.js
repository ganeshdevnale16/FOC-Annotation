// Two check-sets, one per file-processing step in the REC-01 flow. The
// "selected sample" step in between (config.jsx) runs no processing of its
// own - it just receives the sample you choose, so there's no check-set for it.
//
// Framing note: this is my own testing work, written first person throughout
// ("I'm matching...", "I'm testing..."). I am the agent auditing the
// human-run reconciliation control against attributes A1-A7 - I am not the
// one performing the reconciliation itself, and I don't draw the sample -
// that's your call.
import { SUB_CHECK_MS, PASS_PAUSE_MS } from "../../../data/timingConstants";

export const POPULATION_CHECKS = [
  {
    id: "pop-1",
    label: "Step 1 - Ingesting the population files",
    detail:
      "Loading the reconciliation inventory, the recon population, the recon-tool break output and the ticketing system extract.",
    subChecks: [
      "Loading R1 - reconciliation inventory (5 streams)",
      "Loading R2 - recon population, 2026-08-03 to 2026-09-04",
      "Loading R3 - recon-tool break output",
      "Loading R4 - ticketing system break log extract (2026-09-25)",
      "Checking headers, dates and record counts across all four files",
    ],
    points: [
      "All four population files loaded cleanly - R1 (5 streams), R2 (125 recons), R3 (164 breaks), R4 (161 ticketing system records).",
    ],
  },
  {
    id: "pop-2",
    label: "Step 2 - P1/P2: Expected instances vs recon population",
    detail:
      "Cross-checking the expected instance count (5 streams x 25 business days) against the recon tool's own population, and against the IPE report's stated row count.",
    subChecks: [
      "Computing 5 streams x 25 business days = 125 expected instances",
      "Comparing to R2's 125 population rows",
      "Comparing R2's row count to the IPE_R2 report's 'Rows returned'",
    ],
    points: [
      "P1 - 125 expected vs 125 in R2. Agrees, no missing or extra instances.",
      "P2 - R2's 125 rows agree with the IPE_R2 report. Report parameters cover all streams and dates.",
    ],
  },
  {
    id: "pop-3",
    label: "Step 3 - P3/P4/P5: Break population reconciles to the ticketing system",
    detail:
      "Reconciling the recon tool's own break count to R3, then R3 to the ticketing system extract (R4), then confirming every ticketing system record traces back to a recon break.",
    subChecks: [
      "Comparing R2's BREAK_COUNT total (164) to R3's row count",
      "Matching all 164 R3 breaks against R4 on ITEM_REF + amount",
      "Tracing all 161 R4 records back to an R3 break",
    ],
    points: [
      "P3 - 164 vs 164. Agrees.",
      "P4 - 164 R3 breaks vs 161 R4 records. Difference of 3 - three breaks with no matching ticketing system record.",
      "P5 - all 161 ticketing system records trace to a recon break. No orphan entries.",
    ],
  },
  {
    id: "pop-4",
    label: "Step 4 - Full-population sweep on A4",
    detail:
      "Since A4 (break logged in the ticketing system, completeness) is fully deterministic from R3 vs R4, I'm testing it across every break in the population, explaining the P4 difference.",
    subChecks: [
      "Flagging every R3 break with no ITEM_REF/amount match in R4",
      "Confirming REC-C-EUR-20260803 / C-EUR-0803-01 has no ticketing system record",
      "Confirming REC-C-EUR-20260804 / C-EUR-0804-01 has no ticketing system record",
      "Confirming REC-P-HKSC-20260804 / P-HKSC-0804-01 has no ticketing system record",
    ],
    points: [
      "3 breaks across the population have no ticketing system record - the same 3 driving the P4 difference.",
    ],
  },
  {
    id: "pop-5",
    label: "Finishing up",
    detail: "Compiling the completeness & accuracy check, the break-level findings and the full-population sweep.",
    subChecks: [
      "Assembling the Population Completeness & Accuracy table (P1-P5)",
      "Assembling the break-level findings",
      "Assembling the supplementary full-population analytics",
    ],
    points: [
      "Population testing complete - P1, P2, P3 and P5 agree; P4's difference of 3 is fully explained by the full-population A4 sweep.",
    ],
  },
];

export const EVIDENCE_CHECKS = [
  {
    id: "ev-1",
    label: "Step 1 - Ingesting the evidence",
    detail:
      "Loading the sign-off reports, counterparty statements, RCA documentation and escalation emails for your 25 selected reconciliations.",
    subChecks: [
      "Loading 25 reconciliation sign-off PDFs",
      "Loading 25 counterparty statement PDFs",
      "Loading RCA narratives and escalation emails from the ticketing system/R4/R5",
      "Matching each evidence file to its selected recon ID",
    ],
    points: [
      "All evidence for the 25 selected reconciliations loaded and matched to the correct recon ID.",
    ],
  },
  {
    id: "ev-2",
    label: "Step 2 - Testing A1: Timeliness",
    detail: "Checking COMPLETED_AT against the T+1 12:00 deadline for each selected reconciliation.",
    subChecks: [
      "Comparing COMPLETED_AT to the T+1 12:00 SLA for all 25 recons",
      "Flagging REC-C-EUR-20260825 - completed after the 12:00 deadline",
    ],
    points: [
      "24 of 25 completed on time. 1 exception - REC-C-EUR-20260825, completed 2026-08-26 14:22 after the 12:00 due time.",
    ],
  },
  {
    id: "ev-3",
    label: "Step 3 - Testing A2: Independent review",
    detail: "Confirming a reviewer is present, is not the preparer, and reviewed by T+1 17:00.",
    subChecks: [
      "Checking reviewer != preparer for all 25 recons",
      "Checking REVIEWED_AT against the T+1 17:00 SLA",
      "Flagging REC-C-EUR-20260818 - reviewed by the preparer",
    ],
    points: [
      "24 of 25 independently reviewed on time. 1 exception - REC-C-EUR-20260818, reviewed by the preparer (Clara Jensen), not an independent reviewer.",
    ],
  },
  {
    id: "ev-4",
    label: "Step 4 - Testing A3: Inputs complete & accurate",
    detail:
      "Comparing the external balance used in each recon to the counterparty statement, and the sign-off break count to the recon tool's own output.",
    subChecks: [
      "Comparing external balance per recon to the statement PDF for all 25",
      "Comparing sign-off break count to R3 for all 25",
      "Flagging REC-P-ICSD-20260811 - balance mismatch against the statement",
    ],
    points: [
      "24 of 25 inputs agree. 1 exception - REC-P-ICSD-20260811, recon balance 3,897,417,092.22 vs statement 3,897,667,092.22 (diff -250,000.00).",
    ],
  },
  {
    id: "ev-5",
    label: "Step 5 - Testing A4/A5 across your selected sample's breaks",
    detail:
      "Testing every break belonging to your 25 selected reconciliations against A4 (logged) and A5 (logged accurately), cross-referenced against sign-off evidence.",
    subChecks: [
      "Locating all breaks in R3 belonging to your selected recons",
      "Testing A4 - logged in the ticketing system, within 1 Business Day of identification",
      "Testing A5 - ticketing system amount within USD 1 of recon output, break type agrees",
      "Cross-checking findings against sign-off PDFs and escalation emails",
    ],
    points: [
      "33 breaks found across your 25 selected reconciliations.",
      "A4/A5 tested for all 33 - 2 breaks with no ticketing system record (A4) and 1 with an amount mismatch (A5) flagged for further review.",
    ],
  },
  {
    id: "ev-6",
    label: "Step 6 - Assessing A6: RCA adequacy",
    detail:
      "Running the RCA rubric pre-screen, then an LLM judgement, on every logged break's RCA narrative - checking it states what happened, why, and the corrective action, within 3 Business Days.",
    subChecks: [
      "Rubric pre-screen for RCA category and narrative length",
      "LLM judgement on RCA quality for all logged breaks",
      "Flagging generic or missing RCA narratives",
    ],
    points: [
      "3 RCA exceptions found - a missing RCA (REC-C-EUR-20260903), a generic 'Resolved' narrative (REC-C-USD-20260810), and one documented 7 Business Days after identification against a 3 Business Day SLA (REC-P-HKSC-20260805).",
    ],
  },
  {
    id: "ev-7",
    label: "Step 7 - Testing A7: Closure per SLA",
    detail:
      "Checking each break's resolution date (or, if still open, its age) against the cash/position SLA and the escalation rules.",
    subChecks: [
      "Checking resolved breaks against the cash (3 Business Days) / position (5 Business Days) SLA",
      "Checking open breaks' age and escalation status against the extract date",
      "Confirming the >= USD 1m breaks were escalated within 1 Business Day",
    ],
    points: [
      "4 SLA exceptions found - 2 cash breaks closed 8 Business Days after identification, and 1 position break still open 25 Business Days after identification with no escalation.",
    ],
  },
  {
    id: "ev-8",
    label: "Step 8 - Rolling up sample results",
    detail:
      "Rolling every recon- and break-level result up to one Overall verdict per selected reconciliation - a sample item fails if any of its breaks fails an attribute.",
    subChecks: [
      "Rolling up A1-A7 for all 25 selected reconciliations",
      "Cross-checking rollups against the break-level findings",
      "Assigning Pass / Exception per reconciliation",
    ],
    points: [
      "12 of 25 selected reconciliations pass all seven attributes; 13 carry at least one exception.",
    ],
  },
  {
    id: "compile-ev",
    label: "Finishing up",
    detail: "Compiling the sample-level testing table and preparing the two-tab report.",
    subChecks: [
      "Assembling the Sample-level Testing table",
      "Double-checking every Overall verdict against its evidence reference",
      "Preparing the downloadable report",
    ],
  },
];

export { SUB_CHECK_MS, PASS_PAUSE_MS };
