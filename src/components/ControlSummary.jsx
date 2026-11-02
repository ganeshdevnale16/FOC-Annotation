export default function ControlSummary({ heading, fields, data }) {
  return (
    <div>
      <p style={{ fontSize: 14, color: "#1e293b", marginTop: 0, marginBottom: 12 }}>
        {heading}
      </p>
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {fields.map((f, i) => (
          <div
            key={f.key}
            style={{
              display: "flex",
              gap: 16,
              padding: "9px 14px",
              background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
              borderBottom:
                i === fields.length - 1 ? "none" : "1px solid #f1f5f9",
            }}
          >
            <span
              style={{
                flex: "0 0 170px",
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
              }}
            >
              {f.label}
            </span>
            <span style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
              {data[f.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
