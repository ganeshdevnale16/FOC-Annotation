import { Check } from "lucide-react";

export default function AttributesList({ attributes, itemLabel = "item" }) {
  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#1e293b",
          marginTop: 0,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Check size={15} color="#16a34a" />
        Captured {attributes.length} {itemLabel}
        {attributes.length === 1 ? "" : "s"}:
      </p>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {attributes.map((attr, i) => (
          <div
            key={attr.no}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 14px",
              background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
              borderBottom:
                i === attributes.length - 1 ? "none" : "1px solid #f1f5f9",
            }}
          >
            <span
              style={{
                flex: "0 0 26px",
                height: 22,
                borderRadius: 6,
                background: "#eef2ff",
                color: "#6366f1",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {attr.no}
            </span>
            <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              {attr.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
