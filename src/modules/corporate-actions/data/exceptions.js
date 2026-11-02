// The 10 exceptions expected from the custodian_ca_notifications vs
// internal_ca_processing files. Values are taken directly from those files
// (entitlement recomputed as Shares × Rate × (1 − TaxWithholdingRate) to
// confirm each figure).
export const EXCEPTIONS = [
  {
    id: "CA-0041",
    account: "ACC-003",
    securityName: "Diageo PLC",
    type: "Entitlement Calculation Error",
    severity: "HIGH",
    evidence: [
      { label: "Custodian Entitlement", value: "2,006.54" },
      { label: "Internal Entitlement", value: "2,247.32" },
      { label: "Difference", value: "240.78 (internal overstated)" },
    ],
    finding:
      "Internal entitlement does not match the independently calculated custodian entitlement - tax rate matches on both sides (15%), so the error is in the entitlement calculation itself.",
  },
  {
    id: "CA-0042",
    account: "ACC-003",
    securityName: "Alphabet Inc",
    type: "Entitlement Calculation Error",
    severity: "HIGH",
    evidence: [
      { label: "Custodian Entitlement", value: "637.09" },
      { label: "Internal Entitlement", value: "541.53" },
      { label: "Difference", value: "95.56 (internal understated)" },
    ],
    finding:
      "Internal entitlement does not match the independently calculated custodian entitlement - tax rate matches on both sides (15%), so the error is in the entitlement calculation itself.",
  },
  {
    id: "CA-0043",
    account: "ACC-003",
    securityName: "LVMH",
    type: "Tax Withholding Mismatch",
    severity: "HIGH",
    evidence: [
      { label: "Custodian Tax Rate", value: "30%" },
      { label: "Internal Tax Rate", value: "15%" },
      { label: "Custodian Entitlement", value: "897.89" },
      { label: "Internal Entitlement", value: "1,090.30" },
      { label: "Difference", value: "192.41 (internal overstated)" },
    ],
    finding:
      "Internal applied 15% withholding where the custodian specifies 30% - this understates withholding and overstates the entitlement.",
  },
  {
    id: "CA-0044",
    account: "ACC-001",
    securityName: "Amazon.com Inc",
    type: "Tax Withholding Mismatch",
    severity: "HIGH",
    evidence: [
      { label: "Custodian Tax Rate", value: "30%" },
      { label: "Internal Tax Rate", value: "15%" },
      { label: "Custodian Entitlement", value: "431.34" },
      { label: "Internal Entitlement", value: "523.77" },
      { label: "Difference", value: "92.43 (internal overstated)" },
    ],
    finding:
      "Internal applied 15% withholding where the custodian specifies 30% - this understates withholding and overstates the entitlement.",
  },
  {
    id: "CA-0045",
    account: "ACC-006",
    securityName: "Amazon.com Inc",
    type: "Missed Election Deadline",
    severity: "CRITICAL",
    evidence: [
      { label: "Election Deadline", value: "2026-09-08" },
      { label: "Internal Processed Date", value: "2026-09-10" },
      { label: "Days Late", value: "2 days" },
      { label: "Status", value: "Default option applied" },
    ],
    finding:
      "Election was booked 2 days after the deadline - the default option was applied instead, which is typically a worse economic outcome for the client and can't be reversed.",
  },
  {
    id: "CA-0046",
    account: "ACC-006",
    securityName: "Johnson & Johnson",
    type: "Missed Election Deadline",
    severity: "CRITICAL",
    evidence: [
      { label: "Election Deadline", value: "2026-09-08" },
      { label: "Internal Processed Date", value: "2026-09-10" },
      { label: "Days Late", value: "2 days" },
      { label: "Status", value: "Default option applied" },
    ],
    finding:
      "Election was booked 2 days after the deadline - the default option was applied instead, which is typically a worse economic outcome for the client and can't be reversed.",
  },
  {
    id: "CA-0047",
    account: "ACC-001",
    securityName: "LVMH",
    type: "Late Processing",
    severity: "HIGH",
    evidence: [
      { label: "Pay Date", value: "2026-09-20" },
      { label: "Internal Processed Date", value: "2026-09-24" },
      { label: "Days Late", value: "4 days" },
    ],
    finding:
      "No election was required here - this is an operational delay, not a decision failure. Client cash/position was understated for 4 days after pay date.",
  },
  {
    id: "CA-0048",
    account: "ACC-003",
    securityName: "Alphabet Inc",
    type: "Late Processing",
    severity: "HIGH",
    evidence: [
      { label: "Pay Date", value: "2026-09-19" },
      { label: "Internal Processed Date", value: "2026-09-25" },
      { label: "Days Late", value: "6 days" },
    ],
    finding:
      "No election was required here - this is an operational delay, not a decision failure. Client cash/position was understated for 6 days after pay date.",
  },
  {
    id: "CA-0049",
    account: "ACC-008",
    securityName: "Nestle SA",
    type: "Missing Corporate Action",
    severity: "CRITICAL",
    evidence: [
      { label: "Custodian Entitlement", value: "109.16" },
      { label: "Internal Record", value: "Not found" },
      { label: "Likely Cause", value: "Corporate action never booked" },
    ],
    finding:
      "Custodian notification exists with no internal processing record at all - the entitlement may never be collected if this isn't caught.",
  },
  {
    id: "CA-0050",
    account: "ACC-005",
    securityName: "Amazon.com Inc",
    type: "Missing Corporate Action",
    severity: "CRITICAL",
    evidence: [
      { label: "Custodian Entitlement", value: "300.78" },
      { label: "Internal Record", value: "Not found" },
      { label: "Likely Cause", value: "Corporate action never booked" },
    ],
    finding:
      "Custodian notification exists with no internal processing record at all - the entitlement may never be collected if this isn't caught.",
  },
];

export const EXCEPTION_BREAKDOWN = [
  { type: "Entitlement Calculation Error", count: 2, severity: "HIGH" },
  { type: "Tax Withholding Mismatch", count: 2, severity: "HIGH" },
  { type: "Missed Election Deadline", count: 2, severity: "CRITICAL" },
  { type: "Late Processing", count: 2, severity: "HIGH" },
  { type: "Missing Corporate Action", count: 2, severity: "CRITICAL" },
];

export const PROCESSING_SUMMARY = {
  controlResult: "PASS",
  metrics: {
    recall: "100%",
    precision: "100%",
    exceptions: "10",
    falsePositives: "0",
  },
  summaryPoints: [
    "50 Custodian Events",
    "48 Internal Processing Records",
    "40 Clean Events",
    "10 Exceptions",
    "2 Missing Corporate Actions",
    "0 False Positives",
  ],
  testValidation: [
    "All 10 exceptions detected",
    "Both missing corporate actions detected",
    "Both missed election deadlines detected",
    "Both tax-rate mismatches detected",
    "Entitlement calculation independently verified",
    "Correct exception classification",
    "Correct severity assigned",
    "No false positives",
    "Regression consistent",
    "Audit report generated",
  ],
};
