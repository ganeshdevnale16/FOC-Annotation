import { Bot } from "lucide-react";

export default function Navbar({ activeModule, onHome }) {
  return (
    <div
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <button
        onClick={onHome}
        style={{
          display: "flex",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
              <img
                src={import.meta.env.BASE_URL + "DeloitteLogo.png"}
                alt="Deloitte"
                style={{
                  width: 160,
                  height: 60,
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <div style={{ height: 20, width: 1, background: "#9ca3af", margin: "0 16px 0 4px" }}></div>

        {/* <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bot size={16} color="#fff" />
        </div> */}
        <span style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
          Agentic Controls Testing
        </span>
      </button>

      {activeModule && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: activeModule.menu.accent || "#6366f1",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
            {activeModule.menu.title}
          </span>
        </div>
      )}
    </div>
  );
}
