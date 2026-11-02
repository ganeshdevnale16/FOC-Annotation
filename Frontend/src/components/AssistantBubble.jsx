import { Bot } from "lucide-react";

export default function AssistantBubble({ children }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "14px 32px 14px 68px",
        fontSize: 14,
        lineHeight: 1.75,
        color: "#1e293b",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 14,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "#6366f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bot size={15} color="white" />
      </div>
      {children}
    </div>
  );
}
