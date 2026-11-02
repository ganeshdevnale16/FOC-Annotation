// The 10 exceptions the AI tool is expected to detect, with the evidence
// used to explain each one. Values are taken directly from the uploaded
// internal_ledger and custodian_statement files.
export const EXCEPTIONS = [
  {
    id: "T0085",
    account: "ACC-005",
    securityName: "Tesla Inc",
    type: "Quantity Break",
    severity: "HIGH",
    evidence: [
      { label: "Internal Quantity", value: "300 sh" },
      { label: "Custodian Quantity", value: "250 sh" },
      { label: "Difference", value: "50 shares" },
    ],
  },
  {
    id: "T0086",
    account: "ACC-005",
    securityName: "Tesla Inc",
    type: "Quantity Break",
    severity: "HIGH",
    evidence: [
      { label: "Internal Quantity", value: "200 sh" },
      { label: "Custodian Quantity", value: "150 sh" },
      { label: "Difference", value: "50 shares" },
    ],
  },
  {
    id: "T0087",
    account: "ACC-009",
    securityName: "Diageo PLC",
    type: "Price Break",
    severity: "HIGH",
    evidence: [
      { label: "Internal Price", value: "346.17 GBP" },
      { label: "Custodian Price", value: "339.25 GBP" },
      { label: "Difference", value: "6.92 GBP (~2.0%)" },
    ],
  },
  {
    id: "T0088",
    account: "ACC-005",
    securityName: "Microsoft Corp",
    type: "Price Break",
    severity: "HIGH",
    evidence: [
      { label: "Internal Price", value: "298.68 USD" },
      { label: "Custodian Price", value: "292.71 USD" },
      { label: "Difference", value: "5.97 USD (~2.0%)" },
    ],
  },
  {
    id: "T0089",
    account: "ACC-010",
    securityName: "Microsoft Corp",
    type: "Missing at Custodian",
    severity: "CRITICAL",
    evidence: [
      { label: "Internal Quantity", value: "200 sh @ 185.93 USD" },
      { label: "Custodian Record", value: "Not found" },
      { label: "Likely Cause", value: "Settlement not received" },
    ],
  },
  {
    id: "T0090",
    account: "ACC-010",
    securityName: "NVIDIA Corp",
    type: "Missing at Custodian",
    severity: "CRITICAL",
    evidence: [
      { label: "Internal Quantity", value: "300 sh @ 75.51 USD" },
      { label: "Custodian Record", value: "Not found" },
      { label: "Likely Cause", value: "Settlement not received" },
    ],
  },
  {
    id: "T0091",
    account: "ACC-005",
    securityName: "Amazon.com Inc",
    type: "Missing at Internal",
    severity: "CRITICAL",
    evidence: [
      { label: "Custodian Quantity", value: "100 sh @ 360.22 USD" },
      { label: "Internal Record", value: "Not found" },
      { label: "Likely Cause", value: "Trade not yet booked internally" },
    ],
  },
  {
    id: "T0092",
    account: "ACC-009",
    securityName: "Johnson & Johnson",
    type: "Missing at Internal",
    severity: "CRITICAL",
    evidence: [
      { label: "Custodian Quantity", value: "300 sh @ 365.33 USD" },
      { label: "Internal Record", value: "Not found" },
      { label: "Likely Cause", value: "Trade not yet booked internally" },
    ],
  },
  {
    id: "CB-006",
    account: "ACC-006",
    securityName: "USD Cash Balance",
    type: "Cash Balance Break",
    severity: "HIGH",
    evidence: [
      { label: "Internal Cash", value: "373,889.42 USD" },
      { label: "Custodian Cash", value: "373,014.17 USD" },
      { label: "Difference", value: "875.25 USD" },
    ],
  },
  {
    id: "CB-007",
    account: "ACC-007",
    securityName: "USD Cash Balance",
    type: "Cash Balance Break",
    severity: "HIGH",
    evidence: [
      { label: "Internal Cash", value: "278,205.13 USD" },
      { label: "Custodian Cash", value: "274,104.38 USD" },
      { label: "Difference", value: "4,100.75 USD" },
    ],
  },
];

export const EXCEPTION_BREAKDOWN = [
  { type: "Quantity Break", count: 2, severity: "HIGH" },
  { type: "Price Break", count: 2, severity: "HIGH" },
  { type: "Missing at Custodian", count: 2, severity: "CRITICAL" },
  { type: "Missing at Internal", count: 2, severity: "CRITICAL" },
  { type: "Cash Balance Break", count: 2, severity: "HIGH" },
];

export const RECONCILIATION_SUMMARY = {
  controlResult: "PASS",
  metrics: {
    recall: "100%",
    precision: "100%",
    exceptions: "10",
    falsePositives: "0",
  },
  summaryPoints: [
    "100 Internal Records",
    "100 Custodian Records",
    "84 Clean Trades",
    "4 Value Breaks",
    "4 Missing Records",
    "8 Clean Cash Rows",
    "2 Cash Breaks",
  ],
  testValidation: [
    "All 4 critical exceptions detected",
    "Both cash breaks detected",
    "Precision threshold satisfied",
    "Correct exception classification",
    "No false positives",
    "Regression consistent",
  ],
};
