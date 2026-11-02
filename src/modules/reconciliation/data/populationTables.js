// // Tables produced from the population-file upload step: the IPE completeness/accuracy
// // check (P1-P5), an illustrative break-level testing table (every break in the
// // reconciliations, full attribute column set), and a supplementary full-population
// // analytics table for the one attribute (A4, break logged in BMS) that can be tested
// // deterministically across all 125 recons / 164 breaks without sample evidence. The
// // full A4/A5 sweep across all 33 breaks in the selected sample happens later, in the
// // evidence step.

// export const POPULATION_COMPLETENESS = {
//   title: "Population Completeness & Accuracy",
//   note: "R1 inventory, R2 recon population, R3 break output and R4 BMS extract agree end-to-end.",
//   columns: [
//     { key: "ref", label: "Ref" },
//     { key: "check", label: "Check" },
//     { key: "valueA", label: "Value A" },
//     { key: "sourceA", label: "Source A" },
//     { key: "valueB", label: "Value B" },
//     { key: "sourceB", label: "Source B" },
//     { key: "difference", label: "Difference" },
//     { key: "result", label: "Result", type: "badge" },
//     { key: "note", label: "Agent Note" },
//   ],
//   rows: [
//     { ref: "P1", check: "Expected instances (streams x business days) vs recon tool population", valueA: 125, sourceA: "R1 inventory (5) x calendar (25)", valueB: 125, sourceB: "R2 population", difference: 0, result: "Agrees", note: "Agrees - no missing or extra instances" },
//     { ref: "P2", check: "R2 rows vs IPE report 'Rows returned'", valueA: 125, sourceA: "R2", valueB: 125, sourceB: "IPE_R2 PDF", difference: 0, result: "Agrees", note: "Report parameters cover all streams and dates" },
//     { ref: "P3", check: "Break count per population vs recon tool break output", valueA: 164, sourceA: "R2 BREAK_COUNT total", valueB: 164, sourceB: "R3 rows", difference: 0, result: "Agrees", note: "Agrees" },
//     { ref: "P4", check: "Recon tool breaks vs BMS records", valueA: 164, sourceA: "R3 rows", valueB: 161, sourceB: "R4 rows", difference: 3, result: "Difference", note: "Difference = breaks not logged in BMS - tested under A4" },
//     { ref: "P5", check: "BMS records traced to recon output", valueA: 161, sourceA: "R4 rows", valueB: 161, sourceB: "R4 matched to R3", difference: 0, result: "Agrees", note: "All BMS records trace to a recon break (no orphan entries)" },
//   ],
// };

// export const BREAK_LEVEL_TESTING = {
//   title: "Break-level Testing - every break in the reconciliations",
//   note: "Illustrative break-level findings from the full-population A4 sweep, tested against A4-A7.",
//   columns: [
//     { key: "reconId", label: "Recon ID", mono: true },
//     { key: "item", label: "Item ref (recon tool)" },
//     { key: "reconType", label: "Recon type" },
//     { key: "breakType", label: "Break type" },
//     { key: "amountRecon", label: "Amount per recon (USD)", align: "right" },
//     { key: "bmsId", label: "BMS break ID" },
//     { key: "amountBms", label: "Amount per BMS (USD)", align: "right" },
//     { key: "identified", label: "Identified" },
//     { key: "logged", label: "Logged" },
//     { key: "bdToLog", label: "BD to log" },
//     { key: "rcaCategory", label: "RCA category" },
//     { key: "rcaNarrative", label: "RCA narrative", minWidth: 200 },
//     { key: "rcaDate", label: "RCA date" },
//     { key: "bdToRca", label: "BD to RCA" },
//     { key: "rcaAssessment", label: "RCA assessment (agent)", minWidth: 180 },
//     { key: "status", label: "Status" },
//     { key: "resolved", label: "Resolved" },
//     { key: "escalated", label: "Escalated" },
//     { key: "ageBd", label: "Age BD (to resolve / extract)" },
//     { key: "a4", label: "A4 Logged", type: "badge", align: "center" },
//     { key: "a5", label: "A5 Accurate", type: "badge", align: "center" },
//     { key: "a6", label: "A6 RCA", type: "badge", align: "center" },
//     { key: "a7", label: "A7 Closed per SLA", type: "badge", align: "center" },
//     { key: "overall", label: "Overall", type: "badge", align: "center" },
//     { key: "rationale", label: "Agent rationale", minWidth: 220 },
//     { key: "evidenceRef", label: "Evidence reference", minWidth: 220 },
//     { key: "confidence", label: "Confidence" },
//     { key: "reviewerOverride", label: "Reviewer override" },
//     { key: "reviewerComment", label: "Reviewer comment" },
//   ],
//   rows: [
//     {
//       reconId: "REC-C-EUR-20260804", item: "C-EUR-0804-01", reconType: "Cash", breakType: "Unmatched receipt",
//       amountRecon: 851049.05, bmsId: "(not in BMS)", amountBms: null,
//       identified: "2026-08-05", logged: "", bdToLog: "", rcaCategory: "", rcaNarrative: "", rcaDate: "", bdToRca: "",
//       rcaAssessment: "", status: "", resolved: "", escalated: "", ageBd: "",
//       a4: "Exception", a5: "N/A", a6: "N/A", a7: "N/A", overall: "Exception",
//       rationale: "Break in recon output has no BMS record",
//       evidenceRef: "R3 C-EUR-0804-01; SIGNOFF_REC-C-EUR-20260804.pdf; R4 search by ITEM_REF/amount",
//       confidence: "High", reviewerOverride: "", reviewerComment: "",
//     },
//     {
//       reconId: "REC-P-HKSC-20260804", item: "P-HKSC-0804-01", reconType: "Position", breakType: "Corporate action entitlement",
//       amountRecon: 729542.73, bmsId: "(not in BMS)", amountBms: null,
//       identified: "2026-08-05", logged: "", bdToLog: "", rcaCategory: "", rcaNarrative: "", rcaDate: "", bdToRca: "",
//       rcaAssessment: "", status: "", resolved: "", escalated: "", ageBd: "",
//       a4: "Exception", a5: "N/A", a6: "N/A", a7: "N/A", overall: "Exception",
//       rationale: "Break in recon output has no BMS record",
//       evidenceRef: "R3 P-HKSC-0804-01; SIGNOFF_REC-P-HKSC-20260804.pdf; R4 search by ITEM_REF/amount",
//       confidence: "High", reviewerOverride: "", reviewerComment: "",
//     },
//   ],
// };

// export const FULL_POPULATION_ANALYTICS = {
//   title: "Supplementary - Full-population analytics (all 125 recons, all breaks)",
//   note: "All 125 recons / 164 breaks, swept for the one attribute (A4) that a full population sweep can test without sample evidence.",
//   columns: [
//     { key: "reconId", label: "Recon ID" },
//     { key: "item", label: "Item" },
//     { key: "level", label: "Level" },
//     { key: "attribute", label: "Attribute(s)" },
//     { key: "rationale", label: "Agent rationale" },
//     { key: "evidenceRef", label: "Evidence" },
//   ],
//   rows: [
//     { reconId: "REC-C-EUR-20260803", item: "C-EUR-0803-01", level: "Break", attribute: "A4", rationale: "Break in recon output has no BMS record", evidenceRef: "R3 C-EUR-0803-01; SIGNOFF_REC-C-EUR-20260803.pdf; R4 search by ITEM_REF/amount" },
//   ],
// };





// Tables produced from the population-file upload step: the IPE completeness/accuracy
// check (P1-P5), an illustrative break-level testing table (every break in the
// reconciliations, full attribute column set), and a supplementary full-population
// analytics table for the one attribute (A4, break logged in the ticketing
// system) that can be tested
// deterministically across all 125 recons / 164 breaks without sample evidence. The
// full A4/A5 sweep across all 33 breaks in the selected sample happens later, in the
// evidence step.

export const POPULATION_COMPLETENESS = {
  title: "Population Completeness & Accuracy",
  note: "R1 inventory, R2 recon population, R3 break output and R4 ticketing system extract agree end-to-end.",
  columns: [
    { key: "ref", label: "Ref" },
    { key: "check", label: "Check" },
    { key: "valueA", label: "Value A" },
    { key: "sourceA", label: "Source A" },
    { key: "valueB", label: "Value B" },
    { key: "sourceB", label: "Source B" },
    { key: "difference", label: "Difference" },
    { key: "result", label: "Result", type: "badge" },
    { key: "note", label: "Agent Note" },
  ],
  rows: [
    { ref: "P1", check: "Expected instances (streams x business days) vs recon tool population", valueA: 125, sourceA: "R1 inventory (5) x calendar (25)", valueB: 125, sourceB: "R2 population", difference: 0, result: "Agrees", note: "Agrees - no missing or extra instances" },
    { ref: "P2", check: "R2 rows vs IPE report 'Rows returned'", valueA: 125, sourceA: "R2", valueB: 125, sourceB: "IPE_R2 PDF", difference: 0, result: "Agrees", note: "Report parameters cover all streams and dates" },
    { ref: "P3", check: "Break count per population vs recon tool break output", valueA: 164, sourceA: "R2 BREAK_COUNT total", valueB: 164, sourceB: "R3 rows", difference: 0, result: "Agrees", note: "Agrees" },
    { ref: "P4", check: "Recon tool breaks vs ticketing system records", valueA: 164, sourceA: "R3 rows", valueB: 161, sourceB: "R4 rows", difference: 3, result: "Difference", note: "Difference = breaks not logged in the ticketing system - tested under A4" },
    { ref: "P5", check: "Ticketing system records traced to recon output", valueA: 161, sourceA: "R4 rows", valueB: 161, sourceB: "R4 matched to R3", difference: 0, result: "Agrees", note: "All ticketing system records trace to a recon break (no orphan entries)" },
  ],
};

export const BREAK_LEVEL_TESTING = {
  title: "Break-level Testing - every break in the reconciliations",
  note: "Illustrative break-level findings from the full-population A4 sweep, tested against A4-A7.",
  columns: [
    { key: "reconId", label: "Recon ID", mono: true },
    { key: "item", label: "Item ref (recon tool)" },
    { key: "reconType", label: "Recon type" },
    { key: "breakType", label: "Break type" },
    { key: "amountRecon", label: "Amount per recon (USD)", align: "right" },
    { key: "bmsId", label: "Ticketing system break ID" },
    { key: "amountBms", label: "Amount per ticketing system (USD)", align: "right" },
    { key: "identified", label: "Identified" },
    { key: "logged", label: "Logged" },
    { key: "bdToLog", label: "Business Days to log" },
    { key: "rcaCategory", label: "RCA category" },
    { key: "rcaNarrative", label: "RCA narrative", minWidth: 200 },
    { key: "rcaDate", label: "RCA date" },
    { key: "bdToRca", label: "Business Days to RCA" },
    { key: "rcaAssessment", label: "RCA assessment (agent)", minWidth: 180 },
    { key: "status", label: "Status" },
    { key: "resolved", label: "Resolved" },
    { key: "escalated", label: "Escalated" },
    { key: "ageBd", label: "Age (Business Days to resolve / extract)" },
    { key: "a4", label: "A4 Logged", type: "badge", align: "center" },
    { key: "a5", label: "A5 Accurate", type: "badge", align: "center" },
    { key: "a6", label: "A6 RCA", type: "badge", align: "center" },
    { key: "a7", label: "A7 Closed per SLA", type: "badge", align: "center" },
    { key: "overall", label: "Overall", type: "badge", align: "center" },
    { key: "rationale", label: "Agent rationale", minWidth: 220 },
    { key: "evidenceRef", label: "Evidence reference", minWidth: 220 },
    { key: "confidence", label: "Confidence" },
    { key: "reviewerOverride", label: "Reviewer override" },
    { key: "reviewerComment", label: "Reviewer comment" },
  ],
  rows: [
    {
      reconId: "REC-C-EUR-20260804", item: "C-EUR-0804-01", reconType: "Cash", breakType: "Unmatched receipt",
      amountRecon: 851049.05, bmsId: "(not in ticketing system)", amountBms: null,
      identified: "2026-08-05", logged: "", bdToLog: "", rcaCategory: "", rcaNarrative: "", rcaDate: "", bdToRca: "",
      rcaAssessment: "", status: "", resolved: "", escalated: "", ageBd: "",
      a4: "Exception", a5: "N/A", a6: "N/A", a7: "N/A", overall: "Exception",
      rationale: "Break in recon output has no ticketing system record",
      evidenceRef: "R3 C-EUR-0804-01; SIGNOFF_REC-C-EUR-20260804.pdf; R4 search by ITEM_REF/amount",
      confidence: "High", reviewerOverride: "", reviewerComment: "",
    },
    {
      reconId: "REC-P-HKSC-20260804", item: "P-HKSC-0804-01", reconType: "Position", breakType: "Corporate action entitlement",
      amountRecon: 729542.73, bmsId: "(not in ticketing system)", amountBms: null,
      identified: "2026-08-05", logged: "", bdToLog: "", rcaCategory: "", rcaNarrative: "", rcaDate: "", bdToRca: "",
      rcaAssessment: "", status: "", resolved: "", escalated: "", ageBd: "",
      a4: "Exception", a5: "N/A", a6: "N/A", a7: "N/A", overall: "Exception",
      rationale: "Break in recon output has no ticketing system record",
      evidenceRef: "R3 P-HKSC-0804-01; SIGNOFF_REC-P-HKSC-20260804.pdf; R4 search by ITEM_REF/amount",
      confidence: "High", reviewerOverride: "", reviewerComment: "",
    },
  ],
};

export const FULL_POPULATION_ANALYTICS = {
  title: "Supplementary - Full-population analytics (all 125 recons, all breaks)",
  note: "All 125 recons / 164 breaks, swept for the one attribute (A4) that a full population sweep can test without sample evidence.",
  columns: [
    { key: "reconId", label: "Recon ID" },
    { key: "item", label: "Item" },
    { key: "level", label: "Level" },
    { key: "attribute", label: "Attribute(s)" },
    { key: "rationale", label: "Agent rationale" },
    { key: "evidenceRef", label: "Evidence" },
  ],
  rows: [
    { reconId: "REC-C-EUR-20260803", item: "C-EUR-0803-01", level: "Break", attribute: "A4", rationale: "Break in recon output has no ticketing system record", evidenceRef: "R3 C-EUR-0803-01; SIGNOFF_REC-C-EUR-20260803.pdf; R4 search by ITEM_REF/amount" },
  ],
};
