import { forwardRef } from "react";
import { Paperclip, User } from "lucide-react";
import SpinnerIcon from "./icons/SpinnerIcon";
import AssistantBubble from "./AssistantBubble";
import ResultTable from "./ResultTable";
import ExceptionDashboard from "./ExceptionDashboard";
import WelcomeContent from "./WelcomeContent";
import ValidationChecklist from "./ValidationChecklist";
import DataTablesBlock from "./DataTablesBlock";

const MessageList = forwardRef(function MessageList(
  { messages, config, onDownload, onChecksComplete },
  messagesEndRef
) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
      <div style={{ width: "100%" }}>
        {messages.map((msg) => {
          // ── Assistant messages ──
          if (msg.role === "assistant") {
            if (msg.type === "spinner")
              return (
                <div key={msg.id} className="msg-in">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 32px 14px 68px",
                      color: "#64748b",
                      fontSize: 14,
                    }}
                  >
                    <SpinnerIcon size={18} /> {msg.content}
                  </div>
                </div>
              );

            if (msg.type === "checks")
              return (
                <div key={msg.id} className="msg-in">
                  <AssistantBubble>
                    <ValidationChecklist
                      checks={msg.checks || config.validationChecks}
                      onComplete={onChecksComplete}
                      runningLabel={msg.runningLabel || config.messages.checksRunningLabel}
                    />
                  </AssistantBubble>
                </div>
              );

            if (msg.type === "stepTables")
              return (
                <div key={msg.id} className="msg-in">
                  <AssistantBubble>
                    <DataTablesBlock
                      intro={msg.intro}
                      tables={msg.tables}
                      onDownload={msg.showDownload ? onDownload : undefined}
                    />
                  </AssistantBubble>
                </div>
              );

            if (msg.type === "table")
              return (
                <div key={msg.id} className="msg-in">
                  <AssistantBubble>
                    {config.dashboard ? (
                      <ExceptionDashboard
                        title={config.dashboard.title}
                        subtitle={config.dashboard.subtitle}
                        summaryLabel={config.dashboard.summaryLabel}
                        summary={config.dashboard.summary}
                        breakdown={config.dashboard.breakdown}
                        exceptions={config.dashboard.exceptions}
                        onDownload={onDownload}
                      />
                    ) : (
                      <ResultTable
                        intro={config.resultsTable.intro}
                        columns={config.resultsTable.columns}
                        rows={config.resultsTable.rows}
                        onDownload={onDownload}
                      />
                    )}
                  </AssistantBubble>
                </div>
              );

            // Welcome message
            if (msg.type === "welcome")
              return (
                <div key={msg.id} className="msg-in">
                  <AssistantBubble>
                    <WelcomeContent
                      assistantName={config.welcome.assistantName}
                      intro={config.welcome.intro}
                      summaryTable={config.welcome.summaryTable}
                      closing={config.welcome.closing}
                    />
                  </AssistantBubble>
                </div>
              );

            // Generic jsx message
            return (
              <div key={msg.id} className="msg-in">
                <AssistantBubble>
                  <div>{msg.content}</div>
                </AssistantBubble>
              </div>
            );
          }

          // ── User messages ──
          const avatar = (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                alignSelf: "flex-end",
              }}
            >
              <User size={15} color="white" />
            </div>
          );

          // A placeholder shown while a file "upload" is simulated - spinner
          // + filling progress bar - swapped out for the real file bubble(s)
          // once the randomized delay elapses.
          if (msg.type === "uploading") {
            const { label, durationMs } = msg.content;
            return (
              <div
                key={msg.id}
                className="msg-in"
                style={{ display: "flex", justifyContent: "flex-end", padding: "4px 32px", gap: 10 }}
              >
                <div
                  style={{
                    background: "#e2e8f0",
                    color: "#1e293b",
                    borderRadius: 16,
                    padding: "9px 14px",
                    maxWidth: "70%",
                    minWidth: 200,
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SpinnerIcon size={14} />
                    <span style={{ wordBreak: "break-all" }}>{label}</span>
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      height: 4,
                      borderRadius: 999,
                      background: "#cbd5e1",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "#6366f1",
                        width: "0%",
                        animation: `uploadFill ${durationMs / 1000}s linear forwards`,
                      }}
                    />
                  </div>
                </div>
                {avatar}
              </div>
            );
          }

          // A batch upload (e.g. a whole folder of evidence files) collapses
          // into one bubble instead of one per file, so a 200+ file upload
          // doesn't turn the conversation into an unscrollable wall.
          if (msg.type === "fileGroup") {
            const { count, names } = msg.content;
            const preview = names.slice(0, 4);
            const remaining = count - preview.length;
            return (
              <div
                key={msg.id}
                className="msg-in"
                style={{ display: "flex", justifyContent: "flex-end", padding: "4px 32px", gap: 10 }}
              >
                <div
                  style={{
                    background: "#e2e8f0",
                    color: "#1e293b",
                    borderRadius: 16,
                    padding: "9px 14px",
                    maxWidth: "70%",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                    <Paperclip size={13} style={{ color: "#64748b", flexShrink: 0 }} />
                    <span>{count} files attached</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", wordBreak: "break-all" }}>
                    {preview.join(", ")}
                    {remaining > 0 ? `, +${remaining} more` : ""}
                  </div>
                </div>
                {avatar}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="msg-in"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "4px 32px",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "#e2e8f0",
                  color: "#1e293b",
                  borderRadius: 16,
                  padding: "9px 14px",
                  maxWidth: "70%",
                  fontSize: 14,
                  lineHeight: 1.7,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {msg.type === "file" && (
                  <Paperclip size={13} style={{ color: "#64748b", flexShrink: 0 }} />
                )}
                <span style={{ wordBreak: "break-all" }}>{msg.content}</span>
              </div>
              {avatar}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

export default MessageList;

