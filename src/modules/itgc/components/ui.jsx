import { useState } from "react";
import { Bot, CheckCircle2, Database, Download, FileText, FileUp, Server, User, X } from "lucide-react";
import SpinnerIcon from "../../../components/icons/SpinnerIcon";
import { OPS, RES_LABEL } from "../engine/util";

export const T = { tx: "#1e293b", mu: "#64748b", lt: "#94a3b8", bd: "#e2e8f0", bg2: "#f8fafc", bg3: "#f1f5f9", ac: "#6366f1", okb: "#dcfce7", okf: "#166534", bdb: "#fee2e2", bdf: "#991b1b", amb: "#ffedd5", amf: "#9a3412" };

export function Bubble({ children }) {
  return (
    <div className="msg-in" style={{ position: "relative", padding: "14px 32px 14px 68px", fontSize: 14, lineHeight: 1.75, color: T.tx }}>
      <div style={{ position: "absolute", left: 24, top: 14, width: 30, height: 30, borderRadius: "50%", background: T.ac, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Bot size={15} color="white" />
      </div>
      {children}
    </div>
  );
}

export function UserBubble({ children, file }) {
  return (
    <div className="msg-in" style={{ display: "flex", justifyContent: "flex-end", padding: "4px 32px", gap: 10 }}>
      <div style={{ background: T.bd, color: T.tx, borderRadius: 16, padding: "9px 14px", maxWidth: "70%", fontSize: 14, lineHeight: 1.6, display: "flex", alignItems: "center", gap: 8, wordBreak: "break-word" }}>
        {file && <FileText size={13} style={{ color: T.mu, flexShrink: 0 }} />}
        <span>{children}</span>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.ac, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end" }}>
        <User size={15} color="white" />
      </div>
    </div>
  );
}

export function Typing() {
  return (
    <span className="dots">
      <span />
      <span />
      <span />
    </span>
  );
}

export const btn = (primary) => ({
  background: primary ? T.tx : "#fff", color: primary ? "#fff" : "#475569", border: primary ? "none" : `1px solid ${T.bd}`,
  borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit",
});

export function Buttons({ list, onAction, used }) {
  if (used || !list?.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
      {list.map((b) => (
        <button key={b.action} style={btn(b.primary)} onClick={() => onAction(b.action)}>
          {b.icon}
          {b.label}
        </button>
      ))}
    </div>
  );
}

export function Badge({ res, children }) {
  const m = { p: [T.okb, T.okf], f: [T.bdb, T.bdf], n: [T.amb, T.amf] }[res] || [T.bg3, T.mu];
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: m[0], color: m[1], whiteSpace: "nowrap" }}>{children || RES_LABEL[res]}</span>;
}

export function DataTable({ head, rows }) {
  return (
    <div style={{ border: `1px solid ${T.bd}`, borderRadius: 10, overflow: "auto", margin: "8px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead>
          <tr>{head.map((h, i) => <th key={i} style={{ background: T.bg2, color: T.mu, textAlign: "left", padding: "9px 12px", fontSize: 12, fontWeight: 600, borderBottom: `1px solid ${T.bd}`, whiteSpace: "nowrap" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? "#fafbfc" : "#fff" }}>
              {r.map((c, j) => <td key={j} style={{ padding: "9px 12px", color: "#475569", borderBottom: i === rows.length - 1 ? "none" : `1px solid ${T.bg3}`, verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Mono = ({ children }) => <span style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", color: T.ac, fontSize: 12.5 }}>{children}</span>;

export function Kpis({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, margin: "8px 0" }}>
      {items.map(([v, l, color], i) => (
        <div key={i} style={{ border: `1px solid ${T.bd}`, borderRadius: 10, padding: "10px 14px", background: "#fff" }}>
          <b style={{ display: "block", fontSize: 24, lineHeight: 1.2, color: color || T.tx }}>{v}</b>
          <span style={{ fontSize: 12, color: T.mu }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- step: choose evidence source ---------- */
export function SourcePicker({ onAction, used, chosen }) {
  const card = (key, icon, title, text) => {
    const on = chosen === key;
    return (
      <button
        disabled={used}
        onClick={() => onAction("src:" + key)}
        style={{ textAlign: "left", background: on ? "#eef2ff" : "#fff", border: `1px solid ${on ? T.ac : T.bd}`, borderRadius: 14, padding: 16, cursor: used ? "default" : "pointer", display: "flex", gap: 12, fontFamily: "inherit", opacity: used && !on ? 0.5 : 1 }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.ac, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.tx }}>{title}</div>
          <div style={{ fontSize: 12.5, color: T.mu, lineHeight: 1.5 }}>{text}</div>
        </div>
      </button>
    );
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 10 }}>
      {card("sap", <Server size={18} color="#fff" />, "SAP system", "I connect to SAP, open table PAHI (SE16) and extract the active parameter population myself.")}
      {card("manual", <FileUp size={18} color="#fff" />, "Manual upload", "You upload the evidence: Excel/CSV extract, PDF, Word/text export or SAP screenshots.")}
    </div>
  );
}

const inp = { width: "100%", border: `1px solid ${T.bd}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: T.tx, background: "#fff", boxSizing: "border-box" };
const lbl = { fontSize: 11.5, fontWeight: 600, color: T.mu, display: "block", marginBottom: 4 };

export function SapForm({ onSubmit, used, gateway }) {
  const [v, setV] = useState({ sid: "DS4", host: "sapds4", client: "100", user: "AUDIT_RO", password: "" });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <div style={{ border: `1px solid ${T.bd}`, background: T.bg2, borderRadius: 12, padding: 16, marginTop: 10, opacity: used ? 0.6 : 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {[["sid", "System ID (SID)"], ["host", "Application server"], ["client", "Client"], ["user", "User (read-only)"]].map(([k, l]) => (
          <label key={k}>
            <span style={lbl}>{l}</span>
            <input style={inp} value={v[k]} onChange={set(k)} disabled={used} />
          </label>
        ))}
        <label>
          <span style={lbl}>Password</span>
          <input style={inp} type="password" value={v.password} onChange={set("password")} disabled={used} placeholder={gateway ? "" : "not needed in demo"} />
        </label>
      </div>
      <div style={{ fontSize: 12, color: T.mu, marginTop: 10 }}>
        {gateway ? <>Connecting through the SAP gateway at <Mono>{gateway}</Mono> (read-only).</> : <>No SAP gateway is configured, so the <b>demo connector</b> will return a simulated PAHI population. Set <Mono>VITE_SAP_GATEWAY_URL</Mono> to connect to a real system.</>}
      </div>
      {!used && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={btn(true)} onClick={() => v.sid.trim() && onSubmit(v)}>
            <Database size={14} /> Connect and extract
          </button>
        </div>
      )}
    </div>
  );
}

export function CountForm({ onSubmit, used, active }) {
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
      <input style={{ ...inp, width: 220 }} type="number" placeholder={`e.g. ${active}`} value={v} onChange={(e) => setV(e.target.value)} disabled={used} />
      {!used && (
        <>
          <button style={btn(true)} onClick={() => v !== "" && onSubmit(v)}>Use this count</button>
          <button style={btn(false)} onClick={() => onSubmit(null)}>Skip</button>
        </>
      )}
    </div>
  );
}

/* ---------- live checklist ---------- */
export function Checklist({ data }) {
  const { steps, pct, title, done } = data;
  const color = done ? "#16a34a" : T.ac;
  return (
    <div style={{ border: `1px solid ${T.bd}`, background: T.bg2, borderRadius: 10, padding: "14px 16px", margin: "6px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        <span>{title}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: T.bd, borderRadius: 9, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: pct + "%", background: color, transition: "width .4s" }} />
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderTop: "1px solid #eef2f6", opacity: s.status === "todo" ? 0.45 : 1, transition: "opacity .3s" }}>
          <div style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {s.status === "run" ? <SpinnerIcon size={18} /> : s.status === "done" ? <CheckCircle2 size={19} color="#16a34a" /> : s.status === "err" ? <X size={18} color={T.bdf} /> : <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${T.bd}` }} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.t}</div>
            {s.d && <div style={{ fontSize: 12.5, color: T.mu, lineHeight: 1.5 }}>{s.d}</div>}
            {s.subs?.length > 0 && (
              <div style={{ marginTop: 4 }}>
                {s.subs.map((x, j) => (
                  <div key={j} style={{ fontSize: 12.5, color: "#475569", display: "flex", gap: 8, alignItems: "center", padding: "1px 0", flexWrap: "wrap" }}>
                    <Badge res={x.res} />
                    <span><Mono>{x.key}</Mono> · actual <b>{x.act}</b> vs {x.rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- report preview (same layout as the downloadable report) ---------- */
export function ReportView({ R }) {
  const h2 = { fontSize: 15, margin: "26px 0 8px", paddingLeft: 10, borderLeft: `4px solid ${T.ac}`, lineHeight: 1.3 };
  const sOk = R.ca.sample.every((s) => s.ok);
  return (
    <div style={{ padding: "36px 44px", color: T.tx, fontSize: 13.5, lineHeight: 1.6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `3px solid ${T.ac}`, paddingBottom: 12 }}>
        <img src={import.meta.env.BASE_URL + "DeloitteLogo.png"} alt="Deloitte" style={{ height: 46 }} />
        <span style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700, color: T.mu, textTransform: "uppercase", textAlign: "right" }}>IT General Controls<br />Test Report</span>
      </div>
      <h1 style={{ fontSize: 24, margin: "18px 0 2px", lineHeight: 1.25 }}>{R.title}</h1>
      <div style={{ color: T.mu, marginBottom: 18 }}>{R.system} · {R.date}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", border: `1px solid ${T.bd}`, borderRadius: 10, overflow: "hidden" }}>
        {[["Report reference", R.id], ["Policy document", R.policyName], ["Evidence source", R.sourceLabel], ["Evidence files", R.files.join(", ")], ["Population", `${R.ca.active.toLocaleString()} active of ${R.ca.total.toLocaleString()}`], ["Reviewer sign-off", "Pending"]].map(([k, v]) => (
          <div key={k} style={{ padding: "10px 14px", borderRight: `1px solid ${T.bd}`, borderBottom: `1px solid ${T.bd}`, wordBreak: "break-word" }}>
            <small style={{ display: "block", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.8, color: T.lt, fontWeight: 700 }}>{k}</small>
            {v}
          </div>
        ))}
      </div>
      <h2 style={h2}>Executive summary</h2>
      <div style={{ borderRadius: 10, padding: "14px 18px", margin: "10px 0", background: R.exceptions.length ? "#fef2f2" : "#f0fdf4", border: `1px solid ${R.exceptions.length ? "#fecaca" : "#bbf7d0"}` }}>
        <b style={{ display: "block", fontSize: 16, marginBottom: 4, color: R.exceptions.length ? T.bdf : T.okf }}>{R.exceptions.length ? `Exceptions noted (${R.exceptions.length})` : "No exceptions noted"}</b>
        {R.conclusion}
      </div>
      <Kpis items={[[R.N, "Attributes tested"], [R.p, "Passed", T.okf], [R.f, "Failed", R.f ? T.bdf : null], [R.n, "Not found", R.n ? T.amf : null], [R.ca.expected == null ? "n/a" : R.ca.ca ? "Agreed" : "Differs", "Population vs system"]]} />
      <h2 style={h2}>1. Scope and approach</h2>
      <p>The agent read the policy “{R.policyName}”, identified {R.N} measurable requirement(s) and mapped each to a system setting. Evidence was obtained from {R.sourceLabel}. The population was checked for completeness and accuracy, every requirement was tested against the policy threshold, and each result is supported by an annotated screenshot in section 6.</p>
      <h2 style={h2}>2. Policy requirements identified</h2>
      <DataTable head={["#", "Requirement (policy text)", "Setting", "Rule", "Severity"]} rows={R.results.map((r) => [r.no, r.src, <Mono key="k">{r.key}</Mono>, <b key="b">{r.rule}</b>, r.sev])} />
      {R.unmapped.length > 0 && (
        <>
          <p style={{ marginBottom: 4 }}><b>Not measurable from system settings (manual testing required):</b></p>
          <ul style={{ marginTop: 0 }}>{R.unmapped.map((u, i) => <li key={i}>{u}</li>)}</ul>
        </>
      )}
      <h2 style={h2}>3. Completeness and accuracy of the population</h2>
      <DataTable head={["Check", "Result", "Detail"]} rows={[
        ["Record count agrees to system", <Badge key="a" res={R.ca.expected == null ? "n" : R.ca.ca ? "p" : "f"}>{R.ca.expected == null ? "N/A" : R.ca.ca ? "AGREED" : "DIFFERS"}</Badge>, R.ca.expected == null ? "No system record count supplied" : `Evidence ${R.ca.active.toLocaleString()} vs system ${R.ca.expected.toLocaleString()}`],
        ["Only active entries tested", <Badge key="b" res="p">OK</Badge>, `${R.ca.total - R.ca.active} inactive / superseded entries excluded`],
        [`Random sample re-performed (${R.ca.sample.length})`, <Badge key="c" res={sOk ? "p" : "f"}>{sOk ? "AGREED" : "DIFFERS"}</Badge>, R.ca.sample.map((s) => `${s.r.p} = ${s.r.v}`).join("; ")],
      ]} />
      <h2 style={h2}>4. Test results</h2>
      <DataTable head={["#", "Requirement", "Setting", "Policy", "Actual", "Conclusion"]} rows={R.results.map((r) => [r.no, r.d, <Mono key="k">{r.key}</Mono>, r.rule, <b key="a">{String(r.actual)}</b>, <Badge key="r" res={r.res} />])} />
      <h2 style={h2}>5. Exceptions and recommended actions</h2>
      {R.exceptions.length ? (
        <DataTable head={["Ref", "Exception", "Gap", "Severity", "Recommended action", "Owner"]} rows={R.exceptions.map((e) => [e.ref, <span key="t"><b>{e.title}</b><br /><Mono>{e.key}</Mono></span>, e.gap, <Badge key="s" res={e.sev === "High" ? "f" : "n"}>{e.sev.toUpperCase()}</Badge>, e.action, e.owner])} />
      ) : (
        <p>None noted.</p>
      )}
      <h2 style={h2}>6. Annotated evidence</h2>
      {R.evidence.map((e, i) => (
        <div key={i} style={{ breakInside: "avoid", marginBottom: 16 }}>
          <b>6.{e.no} {e.title}</b> <Badge res={e.res} />
          <img src={e.img.url} alt={`Evidence for ${e.key}`} style={{ maxWidth: "100%", border: `1px solid ${T.bd}`, borderRadius: 8, display: "block", marginTop: 6 }} />
        </div>
      ))}
      {!R.evidence.length && <p>No setting was located in the evidence, so no annotated screenshot could be produced.</p>}
      {R.refs.length > 0 && (
        <>
          <h2 style={h2}>7. Reference screenshots supplied</h2>
          {R.refs.map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ color: T.mu, fontSize: 12.5 }}>{s.name}</div>
              <img src={s.url} alt={s.name} style={{ maxWidth: "100%", border: `1px solid ${T.bd}`, borderRadius: 8 }} />
            </div>
          ))}
        </>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 34 }}>
        <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 12, color: T.mu }}>Prepared by: Agentic Controls Testing<br />{R.date}</div>
        <div style={{ borderTop: "1px solid #94a3b8", paddingTop: 6, fontSize: 12, color: T.mu }}>Reviewed by: ______________________<br />Date: ______________</div>
      </div>
      <div style={{ marginTop: 26, paddingTop: 10, borderTop: `1px solid ${T.bd}`, fontSize: 11, color: T.lt, display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span>{R.id}</span>
        <span>AI-assisted results – review by a qualified tester required</span>
      </div>
    </div>
  );
}

export function ReportModal({ R, onClose, onDownload, busy }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 50, overflow: "auto", padding: "20px 12px" }}>
      <div style={{ background: "#fff", maxWidth: 940, margin: "0 auto", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 8, padding: "12px 24px", background: T.bg2, borderBottom: `1px solid ${T.bd}`, position: "sticky", top: 0, zIndex: 2, alignItems: "center" }}>
          <button style={btn(true)} disabled={!!busy} onClick={() => onDownload("docx")}><Download size={14} /> Download Word</button>
          <button style={btn(true)} disabled={!!busy} onClick={() => onDownload("pdf")}><Download size={14} /> Download PDF</button>
          {busy && <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: T.mu }}><SpinnerIcon size={14} /> {busy}</span>}
          <span style={{ flex: 1 }} />
          <button style={btn(false)} onClick={onClose}><X size={14} /> Close</button>
        </div>
        <ReportView R={R} />
      </div>
    </div>
  );
}

export { OPS };
