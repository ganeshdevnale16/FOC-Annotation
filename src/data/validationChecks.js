// One validation step per test procedure, each broken into granular sub-checks.
// `subChecks` tick off one at a time; `points` are the findings surfaced
// once every sub-check in that procedure has passed.

// How long each individual sub-check takes to run (ms).
export const SUB_CHECK_MS = 1700;

// How long a finished procedure stays on screen (showing its Pass + findings)
// before the next procedure takes over (ms).
export const PASS_PAUSE_MS = 2000;

// export const VALIDATION_CHECKS = [
//   {
//     id: "tp-1",
//     label: "Test procedure 1 (TOC-1)",
//     attributes: "1, 2, 3, 4",
//     detail:
//       "Verifying persuasive evidence that the country credit committee reviewed the allowance for doubtful debts across all required considerations.",
//     subChecks: [
//       "Locating evidence: LCCMaterial, Email",
//       "Checking current total allowance was considered",
//       "Checking current calculation of general allowance",
//       "Checking size and aging of receivables",
//       "Checking recent experience with customers",
//       "Checking changes in market conditions this quarter",
//       "Checking significant amounts written off in prior period",
//       "Checking hindsight review of previous allowances",
//       "Cross-referencing FAGL_104 allowance rate proposal",
//     ],
//     points: [
//       "The control has been performed by designated management; appropriate supporting documents are available for each control step.",
//     ],
//   },
//   {
//     id: "tp-2",
//     label: "Test procedure 2 (TOC-5)",
//     attributes: "1, 2",
//     detail:
//       "Verifying that system calculations are in line with the allowance rates agreed by the LCC.",
//     subChecks: [
//       "Locating evidence: LCCMaterial, LCCAtendeelist",
//       "Extracting agreed allowance rates from LCC minutes",
//       "Extracting system rates from FAGL_104 output",
//       "Re-performing aging bucket calculations",
//       "Reconciling calculated vs. system allowance",
//     ],
//     points: [
//       "System calculations are in line with the allowance rates agreed by the LCC.",
//     ],
//   },
//   {
//     id: "tp-3",
//     label: "Test procedure 3 (TOC-2)",
//     attributes: "3",
//     detail:
//       "Verifying that the review was concluded prior to the reporting of quarter end data to the Group.",
//     subChecks: [
//       "Locating evidence: LCCMaterial, LCCmail, reportingtable",
//       "Identifying date of LCC review conclusion",
//       "Identifying Group reporting submission date",
//       "Comparing review date against reporting deadline",
//     ],
//     points: [
//       "The review of allowance for doubtful debts was concluded prior to the reporting of quarter end data to the Group.",
//     ],
//   },
//   {
//     id: "tp-4",
//     label: "Test procedure 4 (TOC-3)",
//     attributes: "4",
//     detail:
//       "Verifying that the conclusion from the review of allowance for doubtful debts was recorded.",
//     subChecks: [
//       "Locating evidence: LCCMaterial, EmailMemorandum",
//       "Locating recorded conclusion in the memorandum",
//       "Confirming conclusion is attributable to the FAO FO Manager",
//       "Checking conclusion covers the quarter under review",
//     ],
//     points: [
//       "The conclusion from the review of allowance for doubtful debts was recorded.",
//     ],
//   },
//   {
//     id: "tp-5",
//     label: "Test procedure 5 (TOC-4)",
//     attributes: "5",
//     detail:
//       "Verifying that the CHO/FAO FO Manager or approved delegate respecting SOD rules confirmed the conclusion of the review.",
//     subChecks: [
//       "Locating evidence: LCCMaterial, LCCAtendeelist",
//       "Identifying the confirming approver",
//       "Validating approver authority against SOD rules",
//       "Confirming approval is dated within the review period",
//     ],
//     points: [
//       "The CHO/FAO FO Manager or approved delegate respecting SOD rules has confirmed the conclusion of the review of allowance for doubtful debts.",
//     ],
//   },
//   {
//     id: "tp-6",
//     label: "Test procedure 6 (TOC-6)",
//     attributes: "6, 7",
//     detail:
//       "Verifying the reliability of the report used by the Control Owner through the IPE evidence maintained.",
//     subChecks: [
//       "Locating evidence: LCCMaterial",
//       "Checking data/report completeness and accuracy (IPE)",
//       "Checking manual intervention agrees to source data (IPE)",
//       "Confirming IPE verification was timely at control execution",
//       "Confirming IPE evidence is retained on file",
//     ],
//     points: [
//       "IPE evidence is available and sufficient to suggest that the reliability of the report used by the Control Owner in the control execution was validated timely and as described in the Attribute.",
//     ],
//   },
//   {
//     id: "tp-7",
//     label: "Test procedure 7 (TOC-7)",
//     attributes: "8, 9",
//     detail:
//       "Determining whether the LCC membership was reviewed/approved by the Head CCRM in accordance with CFTR-CP-05 §2.1.1.3.",
//     subChecks: [
//       "Locating evidence: CreditRiskPolicy, AtendeeApprovalmail",
//       "Confirming member names and titles provided annually",
//       "Checking Head CCRM review and approval",
//       "Checking local representation from each Business",
//       "Checking GBS Finance Front Office Manager is a member",
//       "Checking Treasury representation, where available",
//     ],
//     points: [
//       "The LCC membership was reviewed/approved by Head CCRM and complies with the guidance in section 2.1.1.3 of Corporate Regulation CFTR-CP-05, Credit Risk Policy.",
//     ],
//   },
//   {
//     id: "compile",
//     label: "Compiling test results",
//     detail: "Consolidating conclusions and exceptions across all procedures.",
//     subChecks: [
//       "Aggregating procedure conclusions",
//       "Checking for exceptions raised",
//       "Preparing downloadable report",
//     ],
//     points: ["All 7 procedures concluded - Pass, no exceptions noted."],
//   },
// ];

// Total sub-checks across every procedure, and the overall run time.


export const VALIDATION_CHECKS = [
  {
    id: "tp-1",
    label: "Test procedure 1 (TOC-1)",
    attributes: "1, 2, 3, 4",
    detail:
      "Verifying persuasive evidence that the country credit committee considered the current total allowance, current calculation of general allowance for doubtful debts, current size and aging of receivables, relevant recent experience with customers, changes in market conditions affecting specific customer circumstances or other changes in the quarter impacting the allowance, significant amounts written off in the previous period, and performed a hindsight review of the sufficiency of previous allowances.",
    subChecks: [
      "Locating relevant CECL Excel and LCC/email evidence",
      "Checking evidence that the current total allowance was considered",
      "Checking evidence that the current calculation of general allowance for doubtful debts was considered",
      "Checking evidence that the current size and aging of receivables was considered",
      "Checking evidence that relevant recent experience with customers was considered",
      "Checking evidence that changes in market conditions affecting specific customer circumstances or other changes in the quarter were considered",
      "Checking evidence that significant amounts written off in the previous period were considered",
      "Checking evidence of a hindsight review of the sufficiency of previous allowances",
      "Cross-referencing CECL evidence with FAGL_104 allowance information where available",
    ],
    points: [
      "The control has been performed by designated management; appropriate supporting documents are available for each control step.",
    ],
  },

  {
    id: "tp-2",
    label: "Test procedure 2 (TOC-5)",
    attributes: "1, 2",
    detail:
      "With the assistance of the process owner and IS staff, verifying persuasive evidence that system calculations are in line with the allowance rates agreed by the LCC.",
    subChecks: [
      "Locating CECL Sceenshots, LCC materials, and relevant emails",
      "Identifying allowance rates agreed by the LCC",
      "Identifying allowance rates shown in the CECL or FAGL_104 evidence",
      "Comparing the agreed allowance rates with the rates shown in the available evidence",
      "Determining whether the evidence supports consistency between the agreed rates and system rates",
    ],
    points: [
      "System calculations are in line with the allowance rates agreed by the LCC. Hence, verified.",
    ],
  },

  {
    id: "tp-3",
    label: "Test procedure 3 (TOC-2)",
    attributes: "3",
    detail:
      "Verifying persuasive evidence that the review of allowance for doubtful debts was concluded prior to the reporting of quarter end data to the Group.",
    subChecks: [
      "Locating LCC emails or other evidence showing the date of the allowance review",
      "Identifying the date on which the review was concluded",
      "Identifying the Group reporting submission date where available",
      "Determining whether the review conclusion occurred before Group reporting",
    ],
    points: [
      "The review of allowance for doubtful debts was concluded prior to the reporting of quarter end data to the Group.",
    ],
  },

  {
    id: "tp-4",
    label: "Test procedure 4 (TOC-3)",
    attributes: "4",
    detail:
      "Verifying persuasive evidence that the conclusion from the review of allowance for doubtful debts was recorded.",
    subChecks: [
      "Locating the recorded conclusion in emails, or CECL evidence",
      "Identifying the conclusion of the allowance for doubtful debts review",
      "Verifying that the conclusion relates to the period under review",
      "Determining whether the review conclusion was formally recorded",
    ],
    points: [
      "The conclusion from the review of allowance for doubtful debts was recorded. Hence, verified.",
    ],
  },

  {
    id: "tp-5",
    label: "Test procedure 5 (TOC-4)",
    attributes: "5",
    detail:
      "Verifying persuasive evidence that the CHO/FAO FO Manager or approved delegate respecting SOD rules confirmed the conclusion of the review of allowance for doubtful debts.",
    subChecks: [
      "Locating approval or confirmation evidence in emails, CECL screenshots, or LCC materials",
      "Identifying the person who confirmed the review conclusion",
      "Determining whether the person is the CHO/FAO FO Manager or an approved delegate",
      "Checking for evidence of compliance with SOD requirements where available",
      "Determining whether the identified approver confirmed the review conclusion",
    ],
    points: [
      "The CHO/FAO FO Manager or approved delegate respecting SOD rules has confirmed the conclusion of the review of allowance for doubtful debts.",
    ],
  },

  {
    id: "tp-6",
    label: "Test procedure 6 (TOC-6)",
    attributes: "6, 7",
    detail:
      "Verifying that the control owner/control performers use a reliable report by reviewing the IPE evidence that must be maintained by the Control Owner.",
    subChecks: [
      "Locating CECL screenshots and available IPE evidence",
      "Identifying the report used by the Control Owner or control performers",
      "Checking whether the available evidence supports the reliability of the report",
      "Checking whether IPE validation evidence is available",
      "Checking whether the validation was performed timely as described in the Attribute",
      "Checking whether the IPE evidence is maintained by the Control Owner",
    ],
    points: [
      "IPE evidence is available and sufficient to suggest that the reliability of the report used by the Control Owner in the control execution was validated timely and as described in the Attribute. Hence, verified.",
    ],
  },

  {
    id: "tp-7",
    label: "Test procedure 7 (TOC-7)",
    attributes: "8, 9",
    detail:
      "Determining whether the LCC membership was reviewed and approved by the Head CCRM and is in accordance with section 2.1.1.3 of Corporate Regulation CFTR-CP-05, Credit Risk Policy. Specifically, the members must include local representatives from each Business, the GBS Finance Front Office Manager, and a representative from Treasury, where available.",
    subChecks: [
      "Locating LCC membership approval evidence and relevant emails",
      "Identifying the LCC members and their roles",
      "Checking evidence of Head CCRM review and approval",
      "Checking representation from each Business",
      "Checking that the GBS Finance Front Office Manager is a member",
      "Checking Treasury representation where available",
      "Comparing the available evidence against section 2.1.1.3 of Corporate Regulation CFTR-CP-05",
    ],
    points: [
      "The LCC membership was reviewed/approved by Head CCRM and complies with the guidance in section 2.1.1.3 of Corporate Regulation CFTR-CP-05, Credit Risk Policy. Hence, verified.",
    ],
  },

  {
    id: "compile",
    label: "Compiling test results",
    detail:
      "Consolidating evidence-based conclusions and exceptions across all test procedures.",
    subChecks: [
      "Aggregating evidence findings from all procedures",
      "Checking for exceptions or contradictory evidence",
      "Identifying procedures with insufficient evidence",
      "Preparing the overall control testing conclusion",
      "Preparing downloadable validation report",
    ],
    points: [
      "All 7 procedures have been evaluated based on the provided evidence. The overall conclusion should reflect the evidence-supported results and any exceptions or insufficient evidence identified.",
    ],
  },
];


export const TOTAL_SUB_CHECKS = VALIDATION_CHECKS.reduce(
  (sum, c) => sum + c.subChecks.length,
  0
);

export const VALIDATION_TOTAL_MS =
  TOTAL_SUB_CHECKS * SUB_CHECK_MS + VALIDATION_CHECKS.length * PASS_PAUSE_MS;
