// // REC-01 - Custody Reconciliations & Break Management (Meridian Global
// // Custody Services Ltd, fictional). The control objective, risk and control
// // description as captured from the user at the start of the chat.
// export const CONTROL_CONTEXT = {
//   objective:
//     "Client cash and securities held are completely and accurately recorded; differences with counterparties are identified, investigated and resolved timely.",
//   risk:
//     "Undetected or unresolved differences between internal books and custodian/depository/nostro records lead to loss of client assets, misstated client statements or regulatory breach (e.g. client asset rules).",
//   description:
//     "Daily, each in-scope cash and position reconciliation is performed by T+1 12:00 against statements received directly via SWIFT and reviewed by an independent Team Lead by T+1 17:00. Every break is logged in BMS within 1 BD, an RCA is documented within 3 BD, and breaks are resolved within SLA (cash 3 BD, position 5 BD) or escalated; breaks >= USD 1m are escalated to the Head of Custody Operations within 1 BD.",
// };


// REC-01 - Custody Reconciliations & Break Management (Global Custody
// Services Ltd, fictional). The control objective, risk and control
// description as captured from the user at the start of the chat.
export const CONTROL_CONTEXT = {
  objective:
    "Client cash and securities held are completely and accurately recorded; differences with counterparties are identified, investigated and resolved timely.",
  risk:
    "Undetected or unresolved differences between internal books and custodian/depository/nostro records lead to loss of client assets, misstated client statements or regulatory breach (e.g. client asset rules).",
  description:
    "Daily, each in-scope cash and position reconciliation is performed by T+1 12:00 against statements received directly via SWIFT and reviewed by an independent Team Lead by T+1 17:00. Every break is logged in the ticketing system within 1 Business Day, an RCA is documented within 3 Business Days, and breaks are resolved within SLA (cash 3 Business Days, position 5 Business Days) or escalated; breaks >= USD 1m are escalated to the Head of Custody Operations within 1 Business Day.",
};
