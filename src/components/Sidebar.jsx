import { ArrowLeft, Plus } from "lucide-react";

const RECENT_CHATS = ["GC Compliance Audit"];

export default function Sidebar({ moduleTitle, accent = "#6366f1", onBack }) {
  return (
    <div
      style={{
        width: 260,
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "none",
            border: "none",
            borderBottom: "1px solid #e2e8f0",
            padding: "14px 16px",
            fontSize: 12.5,
            fontWeight: 500,
            color: "#64748b",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <ArrowLeft size={14} /> All modules
        </button>
      )}

      {moduleTitle && (
        <div
          style={{
            padding: "14px 16px 4px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: accent,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1e293b",
              lineHeight: 1.4,
            }}
          >
            {moduleTitle}
          </span>
        </div>
      )}

      <div style={{ padding: 16 }}>
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 13,
            color: "#1e293b",
            cursor: "pointer",
          }}
        >
          <Plus size={16} /> New Chat
        </button>
      </div>
      <div style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        <div
          style={{
            fontSize: 10,
            color: "#94a3b8",
            padding: "0 8px 8px",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 700,
          }}
        >
          Recent
        </div>
        {RECENT_CHATS.map((chat, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              color: "#475569",
              marginBottom: 2,
              gap: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {chat}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: 16,
          borderTop: "1px solid #e2e8f0",
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        Powered by AI
      </div>
    </div>
  );
}
