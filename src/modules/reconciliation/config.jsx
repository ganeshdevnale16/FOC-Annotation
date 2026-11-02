import { CONTROL_CONTEXT } from "./data/context";
import { CONTROL_ATTRIBUTES } from "./data/attributes";
import { POPULATION_CHECKS, EVIDENCE_CHECKS } from "./data/validationChecks";
import {
  POPULATION_COMPLETENESS,
  BREAK_LEVEL_TESTING,
  FULL_POPULATION_ANALYTICS,
} from "./data/populationTables";
import { SAMPLE_LEVEL_TESTING } from "./data/sampleTesting";

// The control objective/risk/description/test-attributes used to be
// gathered one at a time via chat questions. They're now known context for
// this test, so they're shown up front as a summary table (below the welcome
// intro) instead - the chat-driven flow starts directly at the population
// file upload.
const TEST_ATTRIBUTES_LIST = CONTROL_ATTRIBUTES.rows
  .filter((r) => /^A[1-7]$/.test(r.attr))
  .map((r) => r.attribute);

export const reconciliationModule = {
  id: "reconciliation",
  menu: {
    title: "AI Reconciliation Control Testing",
    tagline: "Custodian-to-internal-ledger position & cash reconciliation",
    badge: "Reconciliation",
    accent: "#0891b2",
  },
  welcome: {
    assistantName: "Reconciliation control testing assistant",
    intro: (
      <>
        I test Global Custody Services daily cash and position
        reconciliation control (REC-01) the way an auditor would - checking
        timeliness, independent review, break logging, RCA quality and SLA
        closure against the evidence you give me, and rolling each finding up
        to a pass/exception verdict.
      </>
    ),
    // Shown below the intro, above the flow's first question - the fixed
    // context for this test, so it doesn't need to be asked for in chat.
    summaryTable: {
      title: "Control Summary",
      columns: [
        { key: "field", label: "Field", minWidth: 150 },
        { key: "detail", label: "Detail", minWidth: 420 },
      ],
      rows: [
        { field: "Control ID", detail: "REC-01" },
        { field: "Control objective", detail: CONTROL_CONTEXT.objective },
        { field: "Risk", detail: CONTROL_CONTEXT.risk },
        { field: "Control description", detail: CONTROL_CONTEXT.description },
        {
          field: "Test Attributes",
          detail: (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {TEST_ATTRIBUTES_LIST.map((a, i) => (
                <li key={i} style={{ marginBottom: i === TEST_ATTRIBUTES_LIST.length - 1 ? 0 : 4 }}>
                  {a}
                </li>
              ))}
            </ol>
          ),
        },
      ],
    },
    closing: (
      <>
        Let's get started - please upload the population file(s): the
        reconciliation inventory, the recon population, the recon-tool break
        output and the ticketing system extract, and I'll test completeness
        and accuracy end to end.
      </>
    ),
  },
  // A linear, chat-driven flow: two file-upload steps that each run a
  // processing animation and land a set of output tables, plus a plain
  // in-between step for the user's selected sample (no processing there).
  flow: [
    {
      id: "population",
      kind: "file",
      progressLabel: "Population testing",
      question:
        "Next, please upload the population file(s) - the reconciliation inventory, the recon population, the recon-tool break output and the ticketing system extract - and I'll test completeness and accuracy end to end.",
      checks: POPULATION_CHECKS,
      runningLabel: "Testing population completeness and accuracy...",
      tables: [POPULATION_COMPLETENESS, BREAK_LEVEL_TESTING, FULL_POPULATION_ANALYTICS],
      exportTab: "IPE",
      tablesIntro:
        "Population testing is done - here's the completeness & accuracy check, the break-level findings, and the supplementary full-population analytics.",
    },
    {
      id: "sample",
      kind: "ask-file-or-text",
      progressLabel: "Selected sample",
      question:
        "Now, please upload your selected sample - the reconciliations you've chosen for testing. Files or the whole folder both work.",
      capturedNote:
        "I'm not running any processing on this upload - I'll test every break within your selection once you send over the supporting evidence in the next step.",
    },
    {
      id: "evidence",
      kind: "file",
      progressLabel: "Evidence testing",
      question:
        "Last step - upload the evidence for your selected sample: sign-off reports, counterparty statements, RCA documentation and escalation emails. Files or the whole folder both work - I'll test every attribute and roll up a verdict for each one.",
      checks: EVIDENCE_CHECKS,
      runningLabel: "Testing sample evidence against A1-A7...",
      tables: [SAMPLE_LEVEL_TESTING],
      exportTab: "Testing",
      tablesIntro:
        "Sample testing is done - here's the attribute-by-attribute result for all 25 selected reconciliations.",
      final: true,
    },
  ],
  messages: {
    wrongKindNudge_ask: "I just need your answer in the chat to move on.",
    wrongKindNudge_file: "I need a file upload for this step - attach it and send.",
    afterFlowNudge:
      "Testing is complete - download the report above, or start a new chat to run another test.",
  },
  excel: {
    fileName: "REC-01_Custody_Reconciliation_Control_Report.xlsx",
    ipeSheetName: "IPE",
    testingSheetName: "Testing",
    auditSheetName: "Audit Trail",
  },
  // Flat list of every procedure across both processing steps, for the
  // shared Audit Trail sheet builder.
  validationChecks: [...POPULATION_CHECKS, ...EVIDENCE_CHECKS],
};
