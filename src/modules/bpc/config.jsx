import { CONTROL_SUMMARY } from "./data/controlSummary";
import { DEFAULT_CONTROL_ATTRIBUTES } from "./data/controlAttributes";
import { RESULTS_TABLE } from "./data/resultsTable";
import { VALIDATION_CHECKS } from "./data/validationChecks";

const SUMMARY_FIELDS = [
  { label: "Process Template", key: "processTemplate" },
  { label: "Global Reference", key: "globalReference" },
  { label: "CAR Template Type", key: "carTemplateType" },
  { label: "Control Group", key: "controlGroup" },
  { label: "Control Class", key: "controlClass" },
  { label: "Control Objective", key: "controlObjective" },
  { label: "Who Performs", key: "whoPerforms" },
  { label: "When Performed", key: "whenPerformed" },
  { label: "Control Frequency", key: "controlFrequency" },
  { label: "Nature of Control", key: "natureOfControl" },
  { label: "Risk Categorization", key: "riskCategorization" },
  { label: "Type of Control", key: "typeOfControl" },
  { label: "IPE Applicable", key: "ipeApplicable" },
  { label: "Review Control", key: "isReviewControl" },
  { label: "SOD Control", key: "isSodControl" },
];

const RESULT_COLUMNS = [
  { key: "testProcedureNo", label: "Test Procedure No.", width: 90 },
  { key: "typeOfProcedure", label: "Type of Procedure", width: 150 },
  { key: "consideredSatisfiedIf", label: "Considered Satisfied if", width: 200, minWidth: 200 },
  { key: "attributes", label: "Attributes", width: 120 },
  { key: "evidenceName", label: "Evidence Name", width: 160, mono: true },
  { key: "comment", label: "Comment", type: "comment", minWidth: 270 },
  { key: "conclusion", label: "Conclusion", type: "badge" },
  { key: "exception", label: "Exception", width: 150 },
];

const EXCEL_COLUMNS = [
  { key: "testProcedureNo", header: "Test Procedure No", width: 18 },
  { key: "typeOfProcedure", header: "Type of Procedure", width: 28 },
  { key: "consideredSatisfiedIf", header: "Considered Satisfied If", width: 60 },
  { key: "attributes", header: "Attributes", width: 15 },
  { key: "evidenceName", header: "Evidence Name", width: 30 },
  { key: "comment", header: "Comment", width: 80, type: "comment" },
  { key: "conclusion", header: "Conclusion", width: 14 },
  { key: "exception", header: "Exception", width: 26 },
];

export const bpcModule = {
  id: "bpc",
  menu: {
    title: "BPC Control Testing",
    tagline: "Order-to-Cash CECL allowance control (O2C-5.5-ITM)",
    badge: "ICoFR & ABAC",
    accent: "#6366f1",
  },
  welcome: {
    assistantName: "Business Process Control Testing assistant",
    intro:
      "Please import the required input file to begin the control assessment and validation process.",
    importLabel: "Import Input File",
    processingLabel: "Processing input file",
  },
  controlSummary: {
    heading: "I've read the input file. Here's a summary of the control:",
    fields: SUMMARY_FIELDS,
    data: CONTROL_SUMMARY,
  },
  attributesStep: {
    itemLabel: "control attribute",
    attributes: DEFAULT_CONTROL_ATTRIBUTES,
  },
  messages: {
    afterAttributes: (
      <>
        Now please upload the supporting evidence documents for validation and
        control testing.
        <br />
        <br />
        <strong>You can attach the files</strong> using the paperclip button.
      </>
    ),
    beforeImportNudge: "Please import the input file first to begin the assessment.",
    beforeEvidenceNudge:
      "Please upload the required evidence file to proceed with the assessment.",
    checksRunningLabel: "Running control tests and validating evidence...",
  },
  validationChecks: VALIDATION_CHECKS,
  resultsTable: {
    intro: "Control testing complete. Here are the validated results:",
    columns: RESULT_COLUMNS,
    rows: RESULTS_TABLE,
  },
  excel: {
    fileName: "BPC_Control_Testing_Report.xlsx",
    mainSheetName: "Control Testing",
    auditSheetName: "Audit Trail",
    columns: EXCEL_COLUMNS,
  },
};
