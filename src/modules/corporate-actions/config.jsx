import { VALIDATION_CHECKS } from "./data/validationChecks";
import {
  EXCEPTIONS,
  EXCEPTION_BREAKDOWN,
  PROCESSING_SUMMARY,
} from "./data/exceptions";

export const corporateActionsModule = {
  id: "corporate-actions",
  menu: {
    title: "AI Corporate Actions Processing Control",
    tagline: "Custodian notification vs. internal booking - entitlements, tax, elections",
    badge: "Corporate Actions",
    accent: "#c2410c",
  },
  welcome: {
    assistantName: "AI Corporate Actions Processing assistant",
    intro: (
      <>
        I check corporate action entitlements - dividends, splits, rights
        issues, mergers and tender offers - against what was booked
        internally. I recompute each entitlement, cross-check tax
        withholding, confirm elections were made before their deadline, and
        confirm nothing was processed late or missed entirely.
        <br />
        <br />
        Please upload the <strong>custodian notification</strong> and{" "}
        <strong>internal processing</strong> files to begin.
      </>
    ),
  },
  messages: {
    beforeFilesNudge:
      "Please upload the custodian notification and internal processing files to begin.",
    afterResultsNudge:
      "Results are already shown above - download the report, or upload a new pair of files to run another test.",
    checksRunningLabel: "Verifying entitlements, tax rates and deadlines...",
  },
  validationChecks: VALIDATION_CHECKS,
  dashboard: {
    title: "AI Corporate Actions Processing Control Test",
    subtitle: "Custodian Notification vs. Internal Booking",
    summaryLabel: "Processing Summary",
    summary: PROCESSING_SUMMARY,
    breakdown: EXCEPTION_BREAKDOWN,
    exceptions: EXCEPTIONS,
  },
  excel: {
    fileName: "AI_Corporate_Actions_Control_Report.xlsx",
    summarySheetName: "Summary",
    exceptionsSheetName: "Exceptions",
    auditSheetName: "Audit Trail",
  },
};
