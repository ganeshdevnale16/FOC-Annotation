export const CONTROL_SUMMARY = {
  controlTested: "Custodian-to-Internal-Ledger position & cash reconciliation",
  files:
    "internal_ledger.csv (book of record, 100 rows); custodian_statement.csv (custodian data, 100 rows)",
  matchingKey:
    "Securities: TradeID + Account + SecurityID. Cash rows: TradeID + Account.",
  objective:
    "Verify the AI tool ingests both 100-row sources, matches records correctly, flags every seeded exception, classifies each into the right exception type, and does not raise false positives on the ~90 clean records.",
  datasetComposition:
    "84 clean trades + 8 trades seeded with exceptions + 10 cash rows (2 seeded with a break) = 100 rows per file.",
  exceptionTypesTested:
    "5 types: Quantity Break, Price Break, Missing at Custodian, Missing at Internal, Cash Balance Break.",
  recallTarget: "100% (10 / 10 seeded exceptions correctly flagged)",
  precisionTarget:
    "≥ 90% (at most 1 false positive across the 84 clean trades + 8 clean cash rows)",
  toleranceCalibration:
    "Price breaks are ~2% off; tolerance threshold should be in the 0.1–0.5% range so they are caught, not treated as rounding.",
  criticalPassCriteria:
    "All 4 Critical exceptions (Types 3 & 4 - missing trades) and both cash balance breaks (Type 5) must be caught; any miss is an automatic control-effectiveness failure.",
};
