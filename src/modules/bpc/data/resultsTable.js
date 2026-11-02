export const RESULTS_TABLE = [
  {
    testProcedureNo: "1",
    typeOfProcedure: "Examination or Inspection",
    consideredSatisfiedIf:
      "The control has been performed by designated management  ; appropriate supporting documents are available for each control step.",
    attributes: "1, 2, 3, 4",
    evidenceName: "LCCMaterial Email",
    comment: {
      type: "points",
      value: [
        "Verified persuasive evidence that the country credit committee has:",
        "1. Considered current total allowance",
        "2. Considered current calculation of general allowance for doubtful debts",
        "3. Considered current size and aging of receivables",
        "4. Considered relevant recent experience with customers",
        "5. Considered changes in market conditions affecting specific customer circumstances or other changes in the quarter impacting the allowance",
        "6. Reviewed significant amounts written off in the previous period",
        "7. Performed hindsight review of the sufficiency of previous allowances",
      ],
    },
    conclusion: "Pass",
    exception: "No exceptions noted",
  },
  {
    testProcedureNo: "2",
    typeOfProcedure: "Re-performance",
    consideredSatisfiedIf:
      "System calculations are in line with the allowance rates agreed by the LCC",
    attributes: "1, 2",
    evidenceName: "LCCMaterial LCCAtendeelist",
    comment: {
      type: "points",
      value: [
        "Ensured that the system's calculations were consistent with the allowance rates agreed upon by the LCC.",
      ],
    },
    conclusion: "Pass",
    exception: "No exceptions noted",
  },
  {
    testProcedureNo: "3",
    typeOfProcedure: "Examination or Inspection",
    consideredSatisfiedIf:
      "The review of allowance for doubtful debts was concluded prior to the reporting of quarter end data to the Group",
    attributes: "3",
    evidenceName: "LCCMaterial LCCmail reportingtable",
    comment: {
      type: "text",
      value: [
        "Verified that the review of allowance for doubtful debts was concluded prior to the reporting of quarter end data to the Group.",
      ],
    },
    conclusion: "Pass",
    exception: "No exceptions noted",
  },
  {
    testProcedureNo: "4",
    typeOfProcedure: "Examination or Inspection",
    consideredSatisfiedIf:
      "The conclusion from the review of allowance for doubtful debts was recorded",
    attributes: "4",
    evidenceName: "LCCMaterial EmailMemorandum",
    comment: {
      type: "points",
      value: [
        "The conclusion from the review of allowance for doubtful debts was recorded.",
      ],
    },
    conclusion: "Pass",
    exception: "No exceptions noted",
  },
  {
    testProcedureNo: "5",
    typeOfProcedure: "Examination or Inspection",
    consideredSatisfiedIf:
      "The CHO/FAO FO Manage or approved delegate respecting SOD rules has confirmed the conclusion of the review of allowance for doubtful debts ",
    attributes: "5",
    evidenceName: "LCCMaterial LCCAtendeelist",
    comment: {
      type: "text",
      value: [
        "Country CFO confirms the conclusion of the review of the allowance for doubtful accounts.",
      ],
    },
    conclusion: "Pass",
    exception: "No exceptions noted",
  },
  {
    testProcedureNo: "6",
    typeOfProcedure: "Examination or Inspection",
    consideredSatisfiedIf:
      "TIPE evidence is available and sufficient to suggest that the reliability of the report used by the Control Owner in the control execution was validated timely and as described in the Attribute.",
    attributes: "6, 7",
    evidenceName: "LCCMaterial",
    comment: {
      type: "text",
      value: [
        "I confirmed that the Evidence exists the  control owner verifies accuracy and completeness of the data/report used in executing the control.  IPE evidence is maintained to support the control owner’s verification process at the time the control is being executed.",
      ],
    },
    conclusion: "Pass",
    exception: "No exceptions noted",
  },
  {
    testProcedureNo: "7",
    typeOfProcedure: "Examination or Inspection",
    consideredSatisfiedIf:
      "TThe LCC membership was reviewed/approved by Head CCRM and complies with the guidance in section 2.1.1.3 of Corporate Regulation CFTR-CP-05, Credit Risk Policy. ",
    attributes: "8, 9",
    evidenceName: " CreditRiskPolicy AtendeeApprovalmail",
    comment: {
      type: "text",
      value: [
        "I confirmed that the  evidence exists that supports the timely validation check, and the output still agrees to the original source.",
      ],
    },
    conclusion: "Pass",
    exception: "No exceptions noted",
  },
];
