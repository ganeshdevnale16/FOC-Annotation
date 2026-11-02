import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import MessageList from "./components/MessageList";
import InputArea from "./components/InputArea";
import { downloadReport } from "./utils/exportExcel";

// Once a batch of staged files crosses this count (matches InputArea's own
// pill-summary threshold), collapse them into a single chat bubble instead of
// one bubble per file - otherwise a folder upload of, say, 256 evidence files
// turns the whole conversation into an unscrollable wall of file bubbles.
const FILE_GROUP_THRESHOLD = 8;

function buildFileMessages(files) {
  if (files.length > FILE_GROUP_THRESHOLD) {
    return [
      {
        id: Date.now() + Math.random(),
        role: "user",
        type: "fileGroup",
        content: { count: files.length, names: files.map((f) => f.name) },
      },
    ];
  }
  return files.map((f) => ({
    id: Date.now() + Math.random(),
    role: "user",
    type: "file",
    content: f.name,
  }));
}

// A small "Step X of Y" badge plus the step's own question, so a plain
// chat-only step (no processing, no output table) still reads as forward
// progress rather than one bare line of text.
function StepBadge({ index, total, label }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 700,
        color: "#0e7490",
        background: "#ecfeff",
        border: "1px solid #a5f3fc",
        borderRadius: 999,
        padding: "3px 10px",
        marginBottom: 10,
        letterSpacing: 0.3,
      }}
    >
      Step {index + 1} of {total}
      {label ? ` · ${label}` : ""}
    </div>
  );
}

function questionContent(step, index, total, ackText) {
  return (
    <>
      {ackText && <div style={{ marginBottom: 8, color: "#334155" }}>{ackText}</div>}
      <div>
        <StepBadge index={index} total={total} label={step.progressLabel} />
      </div>
      <div>{step.question}</div>
    </>
  );
}

export default function Chatbot({ config, onBack }) {
  const isFlow = Array.isArray(config.flow);

  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", type: "welcome", content: null },
  ]);
  const [input, setInput] = useState("");
  const [stagedFiles, setStagedFiles] = useState([]);
  // Legacy (non-flow) modules: 1 = awaiting input files, 2 = results shown.
  const [flowStep, setFlowStep] = useState(1);
  // Flow modules: index into config.flow of the step currently being asked
  // about or processed. Starts at 0 - the welcome message already asks it.
  const [flowIndex, setFlowIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [flowDone, setFlowDone] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const flowIndexRef = useRef(flowIndex);
  useEffect(() => {
    flowIndexRef.current = flowIndex;
  }, [flowIndex]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, stagedFiles]);

  // ── File attachment ──────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files);
    if (!picked.length || processing) return;
    e.target.value = "";
    setStagedFiles((prev) => [...prev, ...picked]);
  };

  const removeStagedFile = (index) =>
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));

  const clearStagedFiles = () => setStagedFiles([]);

  // ── Processing finished (fired by a checklist message) ───────────────────
  const handleChecksComplete = useCallback(() => {
    if (isFlow) {
      const idx = flowIndexRef.current;
      const step = config.flow[idx];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          type: "stepTables",
          intro: step.tablesIntro,
          tables: step.tables,
          showDownload: !!step.final,
        },
      ]);
      setProcessing(false);
      setFlowIndex(idx + 1);

      const next = config.flow[idx + 1];
      if (next) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              role: "assistant",
              type: "jsx",
              content: questionContent(next, idx + 1, config.flow.length),
            },
          ]);
        }, 500);
      } else {
        setFlowDone(true);
      }
      return;
    }

    setMessages((prev) =>
      prev.some((m) => m.type === "table")
        ? prev
        : [...prev, { id: Date.now(), role: "assistant", type: "table" }]
    );
    setFlowStep(2);
    setProcessing(false);
  }, [isFlow, config]);

  // ── Send (flow-driven modules) ───────────────────────────────────────────
  const handleFlowSend = () => {
    const hasFiles = stagedFiles.length > 0;
    const hasText = input.trim().length > 0;
    if (!hasFiles && !hasText) return;

    const step = config.flow[flowIndex];
    const newMsgs = [];
    if (hasFiles) newMsgs.push(...buildFileMessages(stagedFiles));
    if (hasText)
      newMsgs.push({ id: Date.now() + Math.random(), role: "user", type: "text", content: input });

    if (flowDone || !step) {
      setMessages((prev) => [...prev, ...newMsgs]);
      setInput("");
      setStagedFiles([]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", type: "jsx", content: config.messages.afterFlowNudge },
        ]);
      }, 400);
      return;
    }

    // "ask" - free-text answer only.
    if (step.kind === "ask") {
      if (!hasText) {
        setMessages((prev) => [...prev, ...newMsgs]);
        setStagedFiles([]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: "assistant", type: "jsx", content: config.messages.wrongKindNudge_ask },
          ]);
        }, 400);
        return;
      }
      setMessages((prev) => [...prev, ...newMsgs]);
      setInput("");
      setStagedFiles([]);
      const next = config.flow[flowIndex + 1];
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            type: "jsx",
            content: questionContent(next, flowIndex + 1, config.flow.length, "Thanks - got that."),
          },
        ]);
      }, 450);
      setFlowIndex((i) => i + 1);
      return;
    }

    // "ask-file-or-text" - either a file or chat text is accepted.
    if (step.kind === "ask-file-or-text") {
      setMessages((prev) => [...prev, ...newMsgs]);
      setInput("");
      setStagedFiles([]);
      const next = config.flow[flowIndex + 1];
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          step.captured
            ? {
                id: Date.now() + 1,
                role: "assistant",
                type: "stepTables",
                intro: step.capturedIntro,
                tables: [step.captured],
              }
            : {
                id: Date.now() + 1,
                role: "assistant",
                type: "jsx",
                content: (
                  <>
                    <div>{step.capturedIntro}</div>
                    {step.capturedNote && (
                      <div style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>
                        {step.capturedNote}
                      </div>
                    )}
                  </>
                ),
              },
        ]);
      }, 450);
      if (next) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 2,
              role: "assistant",
              type: "jsx",
              content: questionContent(next, flowIndex + 1, config.flow.length),
            },
          ]);
        }, 950);
      }
      setFlowIndex((i) => i + 1);
      return;
    }

    // "file" - needs an actual file upload to kick off processing.
    if (step.kind === "file") {
      if (!hasFiles) {
        setMessages((prev) => [...prev, ...newMsgs]);
        setInput("");
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: "assistant", type: "jsx", content: config.messages.wrongKindNudge_file },
          ]);
        }, 400);
        return;
      }
      newMsgs.push({ id: Date.now() + 999, role: "assistant", type: "checks", checks: step.checks, runningLabel: step.runningLabel });
      setMessages((prev) => [...prev, ...newMsgs]);
      setInput("");
      setStagedFiles([]);
      setProcessing(true);
      return;
    }
  };

  // ── Send (legacy, simple modules - e.g. Corporate Actions) ───────────────
  const handleLegacySend = () => {
    const hasFiles = stagedFiles.length > 0;
    const hasText = input.trim().length > 0;
    if (!hasFiles && !hasText) return;

    const newMsgs = [];
    if (hasFiles) newMsgs.push(...buildFileMessages(stagedFiles));
    if (hasText)
      newMsgs.push({ id: Date.now() + Math.random(), role: "user", type: "text", content: input });

    if (flowStep === 1 && hasFiles) {
      newMsgs.push({ id: Date.now() + 999, role: "assistant", type: "checks" });
      setMessages((prev) => [...prev, ...newMsgs]);
      setInput("");
      setStagedFiles([]);
      setProcessing(true);
      return;
    }

    setMessages((prev) => [...prev, ...newMsgs]);
    setInput("");
    setStagedFiles([]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          type: "jsx",
          content: flowStep === 1 ? config.messages.beforeFilesNudge : config.messages.afterResultsNudge,
        },
      ]);
    }, 500);
  };

  const handleSend = () => {
    if (processing) return;
    isFlow ? handleFlowSend() : handleLegacySend();
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#f0f2f5",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
       @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
       @keyframes fadeUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
       .msg-in { animation: fadeUp 0.2s ease; }
     `}</style>

      <Sidebar moduleTitle={config.menu.title} accent={config.menu.accent} onBack={onBack} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          minWidth: 0,
        }}
      >
        <MessageList
          ref={messagesEndRef}
          messages={messages}
          config={config}
          onDownload={() => downloadReport(config)}
          onChecksComplete={handleChecksComplete}
        />

        <InputArea
          input={input}
          setInput={setInput}
          stagedFiles={stagedFiles}
          onFileChange={handleFileChange}
          onFolderChange={handleFileChange}
          onRemoveStagedFile={removeStagedFile}
          onClearStagedFiles={clearStagedFiles}
          onSend={handleSend}
          processing={processing}
          fileInputRef={fileInputRef}
          folderInputRef={folderInputRef}
        />
      </div>
    </div>
  );
}
