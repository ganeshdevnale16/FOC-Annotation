// The pass/fail criteria for the AI reconciliation tool, per the test plan.
export const DEFAULT_CONTROL_ATTRIBUTES = [
  {
    no: "1",
    text: "Recall = 100% - all 10 seeded exceptions are correctly flagged.",
  },
  {
    no: "2",
    text: "Precision ≥ 90% - at most 1 false positive across the 92 clean records (84 clean trades + 8 clean cash rows).",
  },
  {
    no: "3",
    text: "Each flagged item is tagged with the correct one of the 5 exception types, not a generic \"break / no break\" flag.",
  },
  {
    no: "4",
    text: "Tolerance threshold (commonly 0.1–0.5%) correctly catches ~2% price breaks rather than treating them as immaterial rounding.",
  },
  {
    no: "5",
    text: "Missing-trade exceptions (Types 3 and 4) are rated Critical/highest severity, consistent with settlement risk.",
  },
  {
    no: "6",
    text: "Quantity, price and cash balance breaks (Types 1, 2 and 5) are rated High severity.",
  },
  {
    no: "7",
    text: "Root-cause narratives cite the correct TradeID/Account and numeric deltas for each exception, with no fabricated causes.",
  },
  {
    no: "8",
    text: "Re-running the same 100x100 file pair produces identical results (idempotency).",
  },
  {
    no: "9",
    text: "A timestamped, exportable exception report is produced, listing all 10 items with type, severity, and account.",
  },
];
