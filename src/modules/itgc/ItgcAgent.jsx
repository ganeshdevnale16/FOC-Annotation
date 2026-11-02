import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, FileUp, Plus } from "lucide-react";
import InputArea from "../../components/InputArea";
import { DEMO_POLICY, KB, parsePolicy, recommendation } from "./engine/policy";
import { isImage, readEvidenceFile, readPolicyFile } from "./engine/readers";
import { SAP_GATEWAY, fetchSapPopulation } from "./engine/sap";
import { completeness, population, runTests } from "./engine/testing";
import { buildEvidence, imageInfo } from "./engine/evidence";
import { buildReportModel } from "./engine/report";
import { OPS, fileToDataUrl, sleep } from "./engine/util";
import {
  Badge, Bubble, Buttons, Checklist, CountForm, DataTable, Kpis, Mono, ReportModal, SapForm, SourcePicker, T, Typing, UserBubble, btn,
} from "./components/ui";

const blank = () => ({
  stage: "policy", policyName: "", attrs: [], unmapped: [], sourceType: null, conn: null, sources: [], pending: [],
  shots: [], expected: null, results: [], meta: null, report: null, controlName: "",
});
const POLICY_EXT = /\.(docx|pdf|txt|md|rtf|doc|html?)$/i;
let MID = 0;

export default function ItgcAgent({ onBack }) {
  const [msgs, setMsgs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [cur, setCur] = useState(null);
  const [input, setInput] = useState("");
  const [staged, setStaged] = useState([]);
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [dl, setDl] = useState("");
  const S = useRef(blank());
  const store = useRef({});
  const fileRef = useRef(null);
  const pickRef = useRef(null);
  const endRef = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      newChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- message helpers ---------- */
  const add = (m) => {
    const id = ++MID;
    setMsgs((p) => [...p, { id, ...m }]);
    return id;
  };
  const upd = (id, patch) => setMsgs((p) => p.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)));
  const say = async (m, ms = 500) => {
    const id = add({ role: "assistant", kind: "typing" });
    await sleep(ms);
    upd(id, { kind: "text", ...m });
    return id;
  };
  const user = (content, file) => add({ role: "user", kind: file ? "file" : "text", content });
  const markUsed = (id) => upd(id, { used: true });

  /* ---------- sessions (left sidebar) ---------- */
  function newChat() {
    if (busy) return;
    if (cur != null) store.current[cur] = { S: S.current, msgs };
    const id = Date.now();
    store.current[id] = { S: blank(), msgs: [] };
    S.current = store.current[id].S;
    setSessions((p) => [...p, { id, title: "New chat" }]);
    setCur(id);
    setMsgs([]);
    setReportOpen(false);
    setTimeout(welcome, 50);
  }
  function openChat(id) {
    if (busy || id === cur) return;
    store.current[cur] = { S: S.current, msgs };
    S.current = store.current[id].S;
    setMsgs(store.current[id].msgs);
    setCur(id);
    setReportOpen(false);
  }
  const setTitle = (n) => {
    const t = (n.length > 24 ? n.slice(0, 22) + "…" : n) + " · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSessions((p) => p.map((s) => (s.id === cur ? { ...s, title: t } : s)));
  };

  /* ---------- flow ---------- */
  async function welcome() {
    await say({
      content: (
        <>
          <p style={{ margin: "0 0 10px" }}><b>Agentic Controls Testing · IT General Controls</b></p>
          <p style={{ margin: "0 0 10px" }}>
            I test IT general controls the way an auditor would. Give me the <b>policy document</b> (Word, PDF, text, Excel or even a scanned image) and I will work out what needs to be tested. You then choose where the evidence comes from – <b>SAP</b> (I connect and extract it myself) or a <b>manual upload</b>. I check completeness, test every requirement, annotate the evidence and prepare a downloadable Word / PDF report with all exceptions.
          </p>
          <p style={{ margin: 0 }}>Please import the policy document to begin.</p>
        </>
      ),
      buttons: [{ label: "Import policy document", action: "pickPolicy", primary: true, icon: <FileUp size={14} /> }, { label: "Use demo policy", action: "demo" }],
    }, 400);
  }

  async function gotPolicy(text, name) {
    const { attrs, unmapped } = parsePolicy(text || "");
    if (!attrs.length)
      return say({ content: <p style={{ margin: 0 }}>I read <b>{name}</b> but could not find a testable requirement with a threshold (for example “minimum password length of 8 characters”). Please check the document or import another policy.</p> });
    Object.assign(S.current, { attrs, unmapped, policyName: name, stage: "source" });
    S.current.controlName = attrs.every((a) => a.kb) ? "Password & Logon Configuration Control" : "System Configuration Control";
    setTitle(name);
    await say({
      content: (
        <>
          <p style={{ margin: "0 0 6px" }}>I have read <b>{name}</b> and identified <b>{attrs.length} test attribute{attrs.length > 1 ? "s" : ""}</b>:</p>
          <DataTable head={["#", "Setting", "Requirement", "Rule", "Severity"]} rows={attrs.map((a, i) => [i + 1, <Mono key="k">{a.key}</Mono>, a.generic ? <i key="d">{a.d}</i> : a.d, <b key="r">{OPS[a.op]} {a.val}</b>, a.sev])} />
          {unmapped.length > 0 && <p style={{ margin: "6px 0 0", fontSize: 12.5, color: T.mu }}>{unmapped.length} other statement{unmapped.length > 1 ? "s are" : " is"} not measurable from system settings and will be listed in the report for manual testing.</p>}
        </>
      ),
    }, 800);
    await sleep(300);
    await say({
      content: <p style={{ margin: 0 }}><b>Where should I collect the evidence from?</b></p>,
      kind: "source",
    }, 400);
  }

  async function chooseSource(type, msgId) {
    if (S.current.stage !== "source") return;
    upd(msgId, { used: true, chosen: type });
    S.current.sourceType = type;
    user(type === "sap" ? "SAP system" : "Manual upload");
    if (type === "sap") {
      S.current.stage = "sapForm";
      await say({ kind: "sapForm", content: <p style={{ margin: 0 }}>Please confirm the SAP system details. I use a read-only connection and only read table <Mono>PAHI</Mono> (profile parameters).</p> }, 400);
    } else {
      S.current.stage = "upload";
      const pre = S.current.pending;
      await say({
        content: (
          <p style={{ margin: 0 }}>
            Please upload the evidence. I can read <b>Excel / CSV</b> extracts (e.g. SE16 → PAHI or RSPARAM export), <b>PDF</b>, <b>Word / text</b> exports and <b>screenshots</b> (I read them with OCR and annotate the real image). You can attach several files at once.
            {pre.length > 0 && <> You already attached {pre.length} file{pre.length > 1 ? "s" : ""} with the policy – I can use {pre.length > 1 ? "them" : "it"} too.</>}
          </p>
        ),
        buttons: [
          { label: "Upload evidence files", action: "pickEvidence", primary: true, icon: <FileUp size={14} /> },
          ...(pre.length ? [{ label: `Use the ${pre.length} attached file${pre.length > 1 ? "s" : ""}`, action: "usePending" }] : []),
        ],
      }, 400);
    }
  }

  async function connectSap(conn, msgId) {
    markUsed(msgId);
    user(`Connect to ${conn.sid} · client ${conn.client} · ${conn.user}`);
    S.current.conn = conn;
    await run();
  }

  async function readEvidence(files) {
    setBusy(true);
    const id = await say({ content: <span style={{ color: T.mu }}>Reading {files.length} file{files.length > 1 ? "s" : ""}…</span> }, 200);
    const rows = [];
    for (const f of files) {
      try {
        const src = await readEvidenceFile(f, (t) => upd(id, { content: <span style={{ color: T.mu }}>{f.name}: {t}</span> }));
        if (src.rows.length) S.current.sources.push(src);
        if (src.kind === "image" && !src.rows.length) S.current.shots.push({ name: f.name, url: src.image.url, w: src.image.w, h: src.image.h });
        rows.push([f.name, src.kind === "table" ? `Spreadsheet · sheet ${src.table.sheet}` : src.kind === "image" ? "Screenshot (OCR)" : src.kind === "pdf" ? "PDF" : "Text / Word", src.rows.length ? <b key="n">{src.rows.length}</b> : <span key="n" style={{ color: T.amf }}>0 – kept as reference</span>]);
      } catch (e) {
        rows.push([f.name, "Could not read", <span key="e" style={{ color: T.bdf }}>{e.message}</span>]);
      }
    }
    setBusy(false);
    const { active } = population(S.current.sources);
    upd(id, {
      content: (
        <>
          <p style={{ margin: "0 0 6px" }}>Evidence received:</p>
          <DataTable head={["File", "Type", "Settings found"]} rows={rows} />
        </>
      ),
    });
    if (!active.length) {
      await say({ content: <p style={{ margin: 0 }}>I could not find any setting / value pairs in these files yet. Please upload an extract (Excel, CSV, PDF, text) or a clearer screenshot that shows parameter names and values.</p>, buttons: [{ label: "Upload more evidence", action: "pickEvidence", primary: true }] }, 300);
      return;
    }
    S.current.stage = "count";
    await say({
      kind: "count",
      active: active.length,
      content: (
        <p style={{ margin: 0 }}>
          I found <b>{active.length.toLocaleString()}</b> active entries. For the completeness check, what record count does the <b>SAP screen</b> show (e.g. SE16 “Number of entries”)? You can upload more files now, or skip this.
        </p>
      ),
      buttons: [{ label: "Upload more evidence", action: "pickEvidence" }],
    }, 400);
  }

  async function run() {
    const st = S.current;
    st.stage = "run";
    setBusy(true);
    const sap = st.sourceType === "sap";
    const steps = [{ t: "Policy read · test attributes mapped", d: `${st.attrs.length} attributes identified` }];
    if (sap) steps.push({ t: `Connecting to SAP ${st.conn.sid} (client ${st.conn.client})`, d: SAP_GATEWAY ? "Read-only connection via SAP gateway" : "Demo connector · read-only session" }, { t: "Extracting parameter population", d: "" });
    else steps.push({ t: "Evidence loaded from your upload", d: st.sources.map((s) => s.name).join(", ") });
    steps.push({ t: "Completeness & accuracy check", d: "" }, { t: "Random sample tie-out", d: "" }, { t: "Testing attributes against policy", d: "", subs: [] }, { t: "Annotating evidence screenshots", d: "" }, { t: "Generating report", d: "" });
    const data = { title: "Running control tests and validating evidence…", pct: 0, done: false, steps: steps.map((s) => ({ ...s, status: "todo" })) };
    const cid = add({ role: "assistant", kind: "checklist", data });
    const setStep = (i, patch) =>
      upd(cid, (m) => {
        const steps2 = m.data.steps.map((s, j) => (j === i ? { ...s, ...(typeof patch === "function" ? patch(s) : patch) } : s));
        const doneN = steps2.filter((s) => s.status === "done").length;
        return { data: { ...m.data, steps: steps2, pct: Math.round((doneN / steps2.length) * 100) } };
      });
    const go = async (i, ms) => {
      setStep(i, { status: "run" });
      await sleep(ms);
    };
    const fin = (i, d) => setStep(i, d != null ? { status: "done", d } : { status: "done" });

    try {
      let k = 0;
      await go(k, 500);
      fin(k++);
      if (sap) {
        await go(k, 900);
        fin(k++);
        await go(k, 400);
        setStep(k, { d: "SE16 → table PAHI · filter on active entries" });
        const src = await fetchSapPopulation(st.conn);
        st.sources = [src];
        st.expected = src.sap.screenCount;
        await sleep(600);
        fin(k++, `${src.rows.length.toLocaleString()} entries extracted (${src.sap.screenCount.toLocaleString()} active on SAP screen) · exported to ${src.name}`);
      } else {
        await go(k, 500);
        fin(k++);
      }
      const ca = completeness(st.sources, st.expected);
      st.meta = {
        ts: new Date(), ca,
        system: sap ? `SAP ${st.conn.sid} (client ${st.conn.client})` : st.sources.find((s) => s.rows.some((r) => r.host))?.rows.find((r) => r.host)?.host || "System per uploaded evidence",
        sourceLabel: sap ? (st.sources[0].sap.mode === "live" ? "SAP – live read-only extract" : "SAP – demo connector (simulated data)") : "Manual upload by the tester",
      };
      await go(k, 700);
      fin(k++, ca.expected == null ? `${ca.active.toLocaleString()} active entries · no system count supplied` : `Evidence ${ca.active.toLocaleString()} vs system ${ca.expected.toLocaleString()} · ${ca.ca ? "match" : "DIFFERENCE"}`);
      await go(k, 700);
      fin(k++, `${ca.sample.filter((s) => s.ok).length} of ${ca.sample.length} randomly selected entries agree with the source`);
      await go(k, 300);
      st.results = runTests(st.attrs, st.sources);
      for (const x of st.results) {
        setStep(k, (s) => ({ subs: [...s.subs, { res: x.res, key: x.a.key, act: x.inst.length ? String(x.act) : "–", rule: `${OPS[x.a.op]} ${x.a.val}` }] }));
        await sleep(300);
      }
      fin(k++);
      await go(k, 200);
      let idx = 0;
      for (const [i, x] of st.results.entries())
        for (const inst of x.inst.slice(0, 5)) {
          const src = st.sources.find((s) => s.id === inst.r.src);
          try {
            inst.img = await buildEvidence(x, inst, src, st.meta, i + 1);
          } catch (e) {
            console.warn("evidence", e);
          }
          setStep(k, { d: `${++idx} screenshot${idx > 1 ? "s" : ""} annotated` });
        }
      for (const s of st.shots) if (!s.w) Object.assign(s, await imageInfo(s.url));
      fin(k++);
      await go(k, 500);
      st.report = buildReportModel(st);
      fin(k++);
      upd(cid, (m) => ({ data: { ...m.data, title: "Control testing complete", done: true, pct: 100 } }));
      st.stage = "done";
      setBusy(false);
      await summary();
    } catch (e) {
      setBusy(false);
      upd(cid, (m) => ({ data: { ...m.data, title: "Stopped", steps: m.data.steps.map((s) => (s.status === "run" ? { ...s, status: "err", d: e.message } : s)) } }));
      st.stage = sap ? "sapForm" : "count";
      await say({
        content: <p style={{ margin: 0 }}>I could not complete the run: <b>{e.message}</b></p>,
        buttons: sap ? [{ label: "Try again", action: "retrySap", primary: true }, { label: "Switch to manual upload", action: "toManual" }] : [{ label: "Try again", action: "rerun", primary: true }],
      });
    }
  }

  async function summary() {
    const st = S.current;
    const R = st.report;
    await say({
      content: (
        <>
          <p style={{ margin: "0 0 6px" }}>Control testing complete. Here are the validated results:</p>
          <Kpis items={[[R.N, "Attributes tested"], [R.p, "Passed", T.okf], [R.f + R.n, "Exceptions", R.f + R.n ? T.bdf : null], [R.ca.active.toLocaleString(), "Population tested"]]} />
          <DataTable
            head={["#", "Setting", "Policy", "Actual", "Conclusion", "Evidence"]}
            rows={st.results.map((x, i) => [
              i + 1, <Mono key="k">{x.a.key}</Mono>, `${OPS[x.a.op]} ${x.a.val}`, x.inst.length ? String(x.act) : "–", <Badge key="b" res={x.res} />,
              x.inst.some((k) => k.img) ? <button key="v" style={{ ...btn(false), padding: "2px 10px", fontSize: 12 }} onClick={() => showEvidence(i)}>View</button> : "",
            ])}
          />
          {R.exceptions.length > 0 ? (
            <>
              <p style={{ margin: "10px 0 4px" }}><b>{R.exceptions.length} exception{R.exceptions.length > 1 ? "s" : ""} noted:</b></p>
              {R.exceptions.map((e) => (
                <div key={e.ref} style={{ border: `1px solid ${T.bd}`, borderLeft: "4px solid #dc2626", borderRadius: 8, padding: "10px 14px", margin: "8px 0", background: "#fff" }}>
                  <b>{e.ref} · {e.title}</b> <Mono>{e.key}</Mono> <Badge res={e.sev === "High" ? "f" : "n"}>{e.sev.toUpperCase()}</Badge>
                  <br />
                  <span style={{ fontSize: 13 }}>{e.gap}</span>
                  <br />
                  <span style={{ color: T.mu, fontSize: 12.5 }}>Recommended action: {e.action}</span>
                </div>
              ))}
            </>
          ) : (
            <p style={{ margin: "10px 0 0" }}><b>No exceptions noted.</b> The full report with annotated evidence is ready.</p>
          )}
        </>
      ),
      buttons: [
        { label: "View full report", action: "report", primary: true },
        { label: "Download Word", action: "docx", icon: <Download size={14} /> },
        { label: "Download PDF", action: "pdf", icon: <Download size={14} /> },
      ],
      keep: true,
    }, 600);
  }

  async function showEvidence(i) {
    const x = S.current.results[i];
    for (const inst of x.inst.filter((k) => k.img))
      await say({
        content: (
          <>
            <p style={{ margin: "0 0 6px" }}><Mono>{x.a.key}</Mono>: actual <b>{String(inst.act)}</b> against policy {OPS[x.a.op]} {x.a.val} <Badge res={inst.res} /></p>
            <img src={inst.img.url} alt="evidence" style={{ maxWidth: "100%", border: `1px solid ${T.bd}`, borderRadius: 8 }} />
          </>
        ),
      }, 200);
  }

  async function download(type) {
    const R = S.current.report;
    if (!R) return;
    setDl(type === "docx" ? "Preparing Word report…" : "Preparing PDF report…");
    try {
      if (type === "docx") await (await import("./engine/exportDocx")).downloadDocx(R);
      else await (await import("./engine/exportPdf")).downloadPdf(R);
    } catch (e) {
      console.error(e);
      await say({ content: <p style={{ margin: 0 }}>The {type === "docx" ? "Word" : "PDF"} file could not be created: {e.message}</p> }, 100);
    }
    setDl("");
  }

  async function qa(t) {
    const l = t.toLowerCase();
    const st = S.current;
    if (/word|docx/.test(l)) return download("docx");
    if (/pdf/.test(l)) return download("pdf");
    if (/report|print|download/.test(l)) return setReportOpen(true);
    if (/restart|new test|start over|new chat/.test(l)) return newChat();
    const hit = st.results.find((x) => l.includes(x.a.key.toLowerCase()) || (KB.find((k) => k.key === x.a.key)?.syn || []).some((s) => new RegExp(s, "i").test(l)));
    if (hit && !/why|exception/.test(l)) {
      await say({ content: hit.inst.length ? <p style={{ margin: 0 }}><b>{hit.a.d}</b> is configured as <b>{String(hit.act)}</b>. Policy requires {OPS[hit.a.op]} <b>{hit.a.val}</b>: <Badge res={hit.res} /></p> : <p style={{ margin: 0 }}>That setting was not found in the active population.</p> }, 400);
      if (hit.inst.length) showEvidence(st.results.indexOf(hit));
      return;
    }
    if (/why|fail|exception|issue|gap|result|summary/.test(l)) {
      const fl = st.results.filter((x) => x.res !== "p");
      return say({
        content: fl.length ? (
          <>
            <p style={{ margin: "0 0 6px" }}>{fl.length} attribute{fl.length > 1 ? "s" : ""} did not meet the policy:</p>
            {fl.map((x) => (
              <div key={x.a.key} style={{ border: `1px solid ${T.bd}`, borderLeft: "4px solid #dc2626", borderRadius: 8, padding: "10px 14px", margin: "8px 0" }}>
                <b>{x.a.d}</b> <Mono>{x.a.key}</Mono>
                <br />Configured: <b>{x.inst.length ? String(x.act) : "not found"}</b> · Policy: {OPS[x.a.op]} {x.a.val} · Severity: <b>{x.a.sev}</b>
                <br /><span style={{ color: T.mu, fontSize: 12.5 }}>Policy text: “{x.a.src}”</span>
                <br /><span style={{ color: T.mu, fontSize: 12.5 }}>Recommended action: {recommendation(x)}</span>
              </div>
            ))}
          </>
        ) : <p style={{ margin: 0 }}>Every attribute complied with the policy.</p>,
      }, 400);
    }
    return say({ content: <p style={{ margin: 0 }}>I can explain the exceptions, show the evidence for a setting (e.g. “password length”), open the report or download it as Word / PDF.</p> }, 300);
  }

  /* ---------- actions & input ---------- */
  async function onAction(action, msg) {
    const st = S.current;
    if (action === "pickPolicy" || action === "pickEvidence") return pickRef.current?.click();
    if (action === "demo") {
      if (st.stage !== "policy") return;
      markUsed(msg.id);
      user("Use demo policy");
      return gotPolicy(DEMO_POLICY, "Demo password policy");
    }
    if (action.startsWith("src:")) return chooseSource(action.slice(4), msg.id);
    if (action === "usePending") {
      markUsed(msg.id);
      const p = st.pending;
      st.pending = [];
      return readEvidence(p);
    }
    if (action === "report") return setReportOpen(true);
    if (action === "docx" || action === "pdf") return download(action);
    if (action === "retrySap") {
      markUsed(msg.id);
      return run();
    }
    if (action === "rerun") {
      markUsed(msg.id);
      return run();
    }
    if (action === "toManual") {
      markUsed(msg.id);
      st.stage = "source";
      return chooseSource("manual", null);
    }
  }

  async function handleFiles(files) {
    const st = S.current;
    if (!files.length) return;
    if (files.length > 6) add({ role: "user", kind: "file", content: `${files.length} files: ${files.slice(0, 4).map((f) => f.name).join(", ")}…` });
    else files.forEach((f) => user(f.name, true));
    if (st.stage === "policy") {
      const pol = files.find((f) => POLICY_EXT.test(f.name)) || files[0];
      st.pending = files.filter((f) => f !== pol);
      setBusy(true);
      const id = await say({ content: <span style={{ color: T.mu }}>Reading {pol.name}…</span> }, 200);
      try {
        const text = await readPolicyFile(pol, (t) => upd(id, { content: <span style={{ color: T.mu }}>{t}</span> }));
        setMsgs((p) => p.filter((m) => m.id !== id));
        setBusy(false);
        return gotPolicy(text, pol.name);
      } catch (e) {
        setBusy(false);
        return upd(id, { content: <p style={{ margin: 0 }}>Could not read {pol.name}: {e.message}</p> });
      }
    }
    if (st.stage === "upload" || st.stage === "count") return readEvidence(files);
    if (st.stage === "source") {
      st.pending.push(...files);
      return say({ content: <p style={{ margin: 0 }}>Thanks – I will use {files.length > 1 ? "these files" : "this file"} if you choose <b>Manual upload</b>. Please choose the evidence source above.</p> }, 300);
    }
    if (st.stage === "done") {
      const imgs = files.filter(isImage);
      for (const f of imgs) {
        const url = await fileToDataUrl(f);
        st.shots.push({ name: f.name, ...(await imageInfo(url)) });
      }
      if (imgs.length) {
        st.report = buildReportModel(st);
        return say({ content: <p style={{ margin: 0 }}>Added {imgs.length} reference screenshot{imgs.length > 1 ? "s" : ""} to the report. To test a new policy, start a new chat.</p> }, 300);
      }
      return say({ content: <p style={{ margin: 0 }}>This test is complete. Start a <b>New chat</b> to test another policy.</p> }, 300);
    }
    return say({ content: <p style={{ margin: 0 }}>Please complete the current step first.</p> }, 200);
  }

  async function send() {
    if (busy) return;
    const files = staged;
    const t = input.trim();
    setStaged([]);
    setInput("");
    if (files.length) await handleFiles(files);
    if (!t) return;
    const st = S.current;
    user(t);
    const l = t.toLowerCase();
    if (st.stage === "policy") {
      if (l === "demo") return gotPolicy(DEMO_POLICY, "Demo password policy");
      if (t.length > 40) return gotPolicy(t, "Pasted policy text");
      return say({ content: <p style={{ margin: 0 }}>I need the policy document first. Attach it with the 📎 button, paste the policy text, or use the demo policy.</p> }, 300);
    }
    if (st.stage === "source") {
      const id = msgs.findLast?.((m) => m.kind === "source")?.id;
      if (/sap/.test(l)) return chooseSource("sap", id);
      if (/manual|upload|file/.test(l)) return chooseSource("manual", id);
      return say({ content: <p style={{ margin: 0 }}>Please choose <b>SAP system</b> or <b>Manual upload</b>.</p> }, 200);
    }
    if (st.stage === "count") {
      const n = parseInt(t.replace(/[,\s]/g, ""), 10);
      if (!isNaN(n)) return setCount(n);
      if (/skip|no|n\/a/.test(l)) return setCount(null);
      return say({ content: <p style={{ margin: 0 }}>Please enter the record count shown on the SAP screen, or type “skip”.</p> }, 200);
    }
    if (st.stage === "done") return qa(t);
    return say({ content: <p style={{ margin: 0 }}>I am working on it, one moment…</p> }, 200);
  }

  async function setCount(v, msgId) {
    if (msgId) markUsed(msgId);
    else setMsgs((p) => p.map((m) => (m.kind === "count" ? { ...m, used: true } : m)));
    if (msgId) user(v == null ? "Skip" : `SAP screen shows ${Number(v).toLocaleString()} entries`);
    S.current.expected = v == null ? null : Number(v);
    await run();
  }

  /* ---------- render ---------- */
  function renderMsg(m) {
    if (m.role === "user") return <UserBubble key={m.id} file={m.kind === "file"}>{m.content}</UserBubble>;
    if (m.kind === "typing") return <Bubble key={m.id}><Typing /></Bubble>;
    if (m.kind === "checklist") return <Bubble key={m.id}><Checklist data={m.data} /></Bubble>;
    const act = (a) => onAction(a, m);
    return (
      <Bubble key={m.id}>
        {m.content}
        {m.kind === "source" && <SourcePicker onAction={act} used={m.used} chosen={m.chosen} />}
        {m.kind === "sapForm" && <SapForm used={m.used} gateway={SAP_GATEWAY} onSubmit={(v) => connectSap(v, m.id)} />}
        {m.kind === "count" && <CountForm used={m.used} active={m.active} onSubmit={(v) => setCount(v, m.id)} />}
        <Buttons list={m.buttons} used={m.used && !m.keep} onAction={act} />
      </Bubble>
    );
  }

  const st = S.current;
  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", background: "#fff" }}>
      {/* sidebar */}
      <div style={{ width: 260, flexShrink: 0, background: "#fff", borderRight: `1px solid ${T.bd}`, display: "flex", flexDirection: "column" }}>
        {onBack && (
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", borderBottom: `1px solid ${T.bd}`, padding: "14px 16px", fontSize: 12.5, fontWeight: 500, color: T.mu, cursor: "pointer", textAlign: "left" }}>
            <ArrowLeft size={14} /> All modules
          </button>
        )}
        <div style={{ padding: "14px 16px 4px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.ac, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: T.tx }}>ITGC Control Testing</span>
        </div>
        <div style={{ padding: 16 }}>
          <button onClick={newChat} disabled={busy} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${T.bd}`, borderRadius: 12, padding: "10px 16px", fontSize: 13, color: T.tx, cursor: busy ? "not-allowed" : "pointer" }}>
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: T.lt, padding: "0 8px 8px", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Recent</div>
          {[...sessions].reverse().map((s) => (
            <div key={s.id} onClick={() => openChat(s.id)} title={s.title} style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: s.id === cur ? T.tx : "#475569", fontWeight: s.id === cur ? 600 : 400, background: s.id === cur ? T.bg3 : "transparent", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.title}
            </div>
          ))}
        </div>
        <div style={{ padding: 16, borderTop: `1px solid ${T.bd}`, fontSize: 12, color: T.lt }}>Powered by AI</div>
      </div>

      {/* chat */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            {msgs.map(renderMsg)}
            <div ref={endRef} />
          </div>
        </div>
        <InputArea
          input={input}
          setInput={setInput}
          stagedFiles={staged}
          onFileChange={(e) => {
            setStaged((p) => [...p, ...e.target.files]);
            e.target.value = "";
          }}
          onRemoveStagedFile={(i) => setStaged((p) => p.filter((_, j) => j !== i))}
          onClearStagedFiles={() => setStaged([])}
          onSend={send}
          processing={busy}
          fileInputRef={fileRef}
        />
        <input
          ref={pickRef}
          type="file"
          multiple
          hidden
          accept=".docx,.pdf,.txt,.md,.xlsx,.xls,.xlsm,.csv,image/*"
          onChange={(e) => {
            const f = [...e.target.files];
            e.target.value = "";
            handleFiles(f);
          }}
        />
      </div>
      {reportOpen && st.report && <ReportModal R={st.report} busy={dl} onDownload={download} onClose={() => setReportOpen(false)} />}
    </div>
  );
}
