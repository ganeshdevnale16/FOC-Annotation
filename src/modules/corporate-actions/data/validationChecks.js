// One step per stage of processing, each broken into granular sub-checks
// that tick off one at a time. Written first person throughout - this is
// the assistant's own work, not a separate tool being observed.
import { SUB_CHECK_MS, PASS_PAUSE_MS } from "../../../data/timingConstants";

export const VALIDATION_CHECKS = [
  {
    id: "step-1",
    label: "Step 1 - Ingesting the files",
    detail:
      "Loading both files and confirming I handle the asymmetric row counts (50 vs 48) correctly - as 2 unprocessed events, not a parsing error.",
    subChecks: [
      "Loading custodian_ca_notifications.csv (50 events)",
      "Loading internal_ca_processing.csv (48 rows)",
      "Checking headers and data types",
      "Confirming the 2-row gap reads as unprocessed events, not a parse failure",
    ],
    points: [
      "Both files loaded cleanly - 50 custodian events, 48 internal records, all headers and data types parsed correctly.",
      "The 2-row gap was correctly read as 2 unprocessed events rather than a parsing issue.",
    ],
  },
  {
    id: "step-2",
    label: "Step 2 - Matching records",
    detail: "Matching every event on CAID + Account + SecurityID.",
    subChecks: [
      "Matching on CAID + Account + SecurityID",
      "Sorting into processed-clean, processed-with-exception, and not-processed",
    ],
    points: [
      "Matching complete - 40 processed-clean, 8 processed-with-exception, 2 not-processed.",
    ],
  },
  {
    id: "step-3",
    label: "Step 3 - Verifying entitlement calculations",
    detail:
      "Independently recomputing entitlement = Shares × Rate × (1 − TaxWithholdingRate) for every event and flagging anything that deviates beyond 1%.",
    subChecks: [
      "Recomputing entitlement for CA-0041 (Diageo PLC, ACC-003)",
      "Recomputing entitlement for CA-0042 (Alphabet Inc, ACC-003)",
      "Flagging both as Entitlement Calculation Error",
    ],
    points: [
      "Recomputed entitlement didn't match the internal figure for CA-0041 (240.78 over) or CA-0042 (95.56 under) - both flagged.",
    ],
  },
  {
    id: "step-4",
    label: "Step 4 - Cross-checking tax withholding rates",
    detail:
      "Comparing TaxWithholdingRate between the two files as its own check, separate from the entitlement-amount check - decomposing the calculation into its inputs rather than only eyeballing the final number.",
    subChecks: [
      "Comparing tax rates for CA-0043 (LVMH, ACC-003)",
      "Comparing tax rates for CA-0044 (Amazon.com Inc, ACC-001)",
      "Flagging both as Tax Withholding Mismatch, distinct from a generic calculation error",
    ],
    points: [
      "Both events show a 30% custodian rate vs. a 15% internal rate - flagged as Tax Withholding Mismatch, not a generic calculation error.",
    ],
  },
  {
    id: "step-5",
    label: "Step 5 - Checking election deadlines",
    detail:
      "For election-required CATypes (Rights Issue, Tender Offer, Merger), checking ProcessedDate against ElectionDeadline and flagging any late election as Critical.",
    subChecks: [
      "Checking CA-0045 (Amazon.com Inc, ACC-006) against its deadline",
      "Checking CA-0046 (Johnson & Johnson, ACC-006) against its deadline",
      "Rating both Critical, not a generic timing note",
    ],
    points: [
      "Both elections were booked 2 days after their deadline, with the default option applied - rated Critical since missed elections are typically irreversible.",
    ],
  },
  {
    id: "step-6",
    label: "Step 6 - Checking pay-date timeliness",
    detail:
      "Flagging any ProcessedDate after PayDate on no-election events, and keeping it separate from missed-election breaks since the root cause is different - operational delay, not a decision failure.",
    subChecks: [
      "Checking CA-0047 (LVMH, ACC-001) against its pay date",
      "Checking CA-0048 (Alphabet Inc, ACC-003) against its pay date",
      "Bucketing both as Late Processing, separate from missed-election exceptions",
    ],
    points: [
      "CA-0047 was booked 4 days after pay date, CA-0048 6 days after - both flagged as Late Processing.",
    ],
  },
  {
    id: "step-7",
    label: "Step 7 - Checking for missing events",
    detail:
      "Flagging every custodian CAID with no internal counterpart - this is the highest-risk exception type, since the entitlement may never be collected.",
    subChecks: [
      "Checking CA-0049 (Nestle SA, ACC-008) for an internal record",
      "Checking CA-0050 (Amazon.com Inc, ACC-005) for an internal record",
      "Rating both Critical",
    ],
    points: [
      "Neither CA-0049 nor CA-0050 has an internal processing record - both flagged as Missing Corporate Action, rated Critical.",
    ],
  },
  {
    id: "step-8",
    label: "Step 8 - Checking for false alarms",
    detail:
      "Re-checking just the 30 clean no-election events and 10 clean election events on their own, to make sure I haven't raised any false alarms.",
    subChecks: [
      "Re-checking the 30 clean no-election events",
      "Re-checking the 10 clean election events",
      "Confirming zero false positives",
    ],
    points: ["Zero false positives across all 40 clean events."],
  },
  {
    id: "step-9",
    label: "Step 9 - Writing explanations",
    detail:
      "Writing an explanation for each of the 10 exceptions, naming the CAID, account, security, and the specific numeric or date deltas involved.",
    subChecks: [
      "Writing explanations for the entitlement calculation errors",
      "Writing explanations for the tax withholding mismatches",
      "Writing explanations for the missed election deadlines",
      "Writing explanations for the late processing exceptions",
      "Writing explanations for the missing corporate actions",
    ],
    points: [
      "All 10 explanations name the correct CAID, account, security, and numeric/date deltas - nothing fabricated.",
    ],
  },
  {
    id: "step-10",
    label: "Step 10 - Confirming consistency",
    detail: "Re-running the same file pair a second time to make sure I get the same answer.",
    subChecks: [
      "Re-running the same file pair",
      "Comparing results to the first run",
    ],
    points: ["Second run matched the first exactly - consistent results."],
  },
  {
    id: "step-11",
    label: "Step 11 - Compiling the audit trail",
    detail:
      "Compiling a dated exception report with type, severity, CAID, account, and deadline/pay-date context, suitable for escalation to the corporate actions team.",
    subChecks: [
      "Dating the report",
      "Including deadline/pay-date context for each exception",
      "Listing all 10 exceptions with type, severity, CAID and account",
    ],
    points: [
      "Report compiled - dated, with deadline/pay-date context, all 10 exceptions listed with type, severity, CAID and account.",
    ],
  },
  {
    id: "compile",
    label: "Finishing up",
    detail: "Pulling everything together into the final result.",
    subChecks: [
      "Aggregating results",
      "Double-checking the Critical items (missing actions and missed elections)",
      "Preparing the downloadable report",
    ],
    points: [
      "All 10 exceptions found and classified - Pass, no exceptions noted.",
    ],
  },
];

export const TOTAL_SUB_CHECKS = VALIDATION_CHECKS.reduce(
  (sum, c) => sum + c.subChecks.length,
  0
);

export const VALIDATION_TOTAL_MS =
  TOTAL_SUB_CHECKS * SUB_CHECK_MS + VALIDATION_CHECKS.length * PASS_PAUSE_MS;

export { SUB_CHECK_MS, PASS_PAUSE_MS };
