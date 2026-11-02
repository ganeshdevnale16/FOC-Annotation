import { OPS, RES_LABEL } from "./util";
import { recommendation } from "./policy";

export function buildReportModel(S) {
  const M = S.meta;
  const ts = M.ts;
  const N = S.results.length;
  const p = S.results.filter((x) => x.res === "p").length;
  const f = S.results.filter((x) => x.res === "f").length;
  const n = S.results.filter((x) => x.res === "n").length;
  const exceptions = [];
  S.results.forEach((x, i) => {
    if (x.res === "p") return;
    const failing = x.inst.filter((k) => k.res === "f");
    exceptions.push({
      ref: `EX-${String(exceptions.length + 1).padStart(2, "0")}`,
      attrNo: i + 1,
      title: x.a.d,
      key: x.a.key,
      type: x.res === "f" ? "Configuration not compliant" : "Setting not found in evidence",
      gap: x.res === "f"
        ? failing.map((k) => `${k.r.host ? k.r.host + ": " : ""}configured ${k.act}${k.note ? " (" + k.note + ")" : ""}`).join("; ") + `; policy requires ${OPS[x.a.op]} ${x.a.val}`
        : `No value for this requirement was found in the evidence; policy requires ${OPS[x.a.op]} ${x.a.val}`,
      sev: x.a.sev,
      action: recommendation(x),
      owner: "SAP Basis / Security",
      res: x.res,
    });
  });
  if (M.ca.ca === false)
    exceptions.push({
      ref: `EX-${String(exceptions.length + 1).padStart(2, "0")}`, attrNo: "-", title: "Population completeness", key: "Record count",
      type: "Completeness & accuracy", gap: `Evidence contains ${M.ca.active} active records but the system shows ${M.ca.expected}`,
      sev: "High", action: "Re-extract the full population from the system, reconcile the difference and re-test.", owner: "Control owner", res: "f",
    });
  const badSample = M.ca.sample.filter((s) => !s.ok);
  if (badSample.length)
    exceptions.push({
      ref: `EX-${String(exceptions.length + 1).padStart(2, "0")}`, attrNo: "-", title: "Sample tie-out", key: "Accuracy",
      type: "Completeness & accuracy", gap: `${badSample.length} sampled record(s) did not agree to the source`,
      sev: "Medium", action: "Investigate the differences between the extract and the source and re-extract.", owner: "Control owner", res: "f",
    });
  const hi = exceptions.filter((e) => e.sev === "High").length;
  const id = "ITGC-" + ts.toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(ts.getHours()).padStart(2, "0") + String(ts.getMinutes()).padStart(2, "0");
  const date = ts.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const evidence = [];
  S.results.forEach((x, i) =>
    x.inst.forEach((k, j) => k.img && evidence.push({ no: `${i + 1}${x.inst.length > 1 ? "." + (j + 1) : ""}`, title: x.a.d, key: x.a.key, res: k.res, act: k.act, img: k.img, file: S.sources.find((s) => s.id === k.r.src)?.name || "" }))
  );
  return {
    id, date, ts,
    title: `${S.controlName || "IT General Controls"} – Test Results`,
    policyName: S.policyName,
    system: M.system,
    sourceLabel: M.sourceLabel,
    files: S.sources.map((s) => s.name),
    ca: M.ca,
    N, p, f, n, hi,
    exceptions,
    results: S.results.map((x, i) => ({
      no: i + 1, d: x.a.d, key: x.a.key, rule: `${OPS[x.a.op]} ${x.a.val}`, op: x.a.op, val: x.a.val,
      actual: x.inst.length ? x.act : "not found", res: x.res, label: RES_LABEL[x.res], sev: x.a.sev, src: x.a.src,
      where: x.inst.map((k) => `${S.sources.find((s) => s.id === k.r.src)?.name || ""} ${typeof k.r.n === "number" ? "row/line " + k.r.n : k.r.n}`).join("; "),
    })),
    evidence,
    refs: S.shots,
    unmapped: S.unmapped,
    conclusion: exceptions.length
      ? `Exceptions noted: ${f} of ${N} attributes failed${n ? `, ${n} not evidenced` : ""}${hi ? ` (${hi} high severity)` : ""}. The control is not operating effectively as designed until the exceptions are remediated.`
      : `No exceptions noted. All ${N} attributes comply with the policy and the population was complete and accurate.`,
  };
}
