import { useState } from "react";
import { CheckCircle2, Circle, Download } from "lucide-react";

const SEVERITY_COLORS = {
  HIGH: { bg: "#ffedd5", fg: "#9a3412" },
  CRITICAL: { bg: "#fee2e2", fg: "#991b1b" },
};

function SeverityBadge({ severity }) {
  const c = SEVERITY_COLORS[severity] || SEVERITY_COLORS.HIGH;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: 99,
        background: c.bg,
        color: c.fg,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      {severity}
    </span>
  );
}

function MetricCard({ label, value }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 90,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "12px 14px",
        background: "#f8fafc",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginTop: 2,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function ReconciliationDashboard({
  title,
  subtitle,
  summary,
  breakdown,
  exceptions,
  onDownload,
}) {
  const [selectedId, setSelectedId] = useState(exceptions[0]?.id ?? null);
  const selected = exceptions.find((e) => e.id === selectedId) || exceptions[0];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
          {subtitle}
        </div>
      </div>

      {/* Control result banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#dcfce7",
          border: "1px solid #bbf7d0",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 14,
        }}
      >
        <CheckCircle2 size={16} color="#16a34a" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
          CONTROL RESULT - {summary.controlResult}
        </span>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <MetricCard label="Recall" value={summary.metrics.recall} />
        <MetricCard label="Precision" value={summary.metrics.precision} />
        <MetricCard label="Exceptions" value={summary.metrics.exceptions} />
        <MetricCard label="False Positive" value={summary.metrics.falsePositives} />
      </div>

      {/* Reconciliation summary */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Reconciliation Summary
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px 16px",
          }}
        >
          {summary.summaryPoints.map((pt) => (
            <div
              key={pt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                color: "#334155",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#94a3b8",
                  flexShrink: 0,
                }}
              />
              {pt}
            </div>
          ))}
        </div>
      </div>

      {/* Exception breakdown */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Exception Breakdown
        </div>
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ textAlign: "left", padding: "8px 14px", fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>
                  Exception Type
                </th>
                <th style={{ textAlign: "left", padding: "8px 14px", fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>
                  Count
                </th>
                <th style={{ textAlign: "left", padding: "8px 14px", fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>
                  Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, i) => (
                <tr
                  key={row.type}
                  style={{
                    background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <td style={{ padding: "8px 14px", color: "#1e293b" }}>{row.type}</td>
                  <td style={{ padding: "8px 14px", color: "#475569" }}>{row.count}</td>
                  <td style={{ padding: "8px 14px" }}>
                    <SeverityBadge severity={row.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exceptions list */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Exceptions
        </div>
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {exceptions.map((exc, i) => {
            const isSelected = exc.id === selected?.id;
            return (
              <button
                key={exc.id}
                onClick={() => setSelectedId(exc.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textAlign: "left",
                  padding: "9px 14px",
                  fontSize: 13,
                  border: "none",
                  borderTop: i === 0 ? "none" : "1px solid #f1f5f9",
                  background: isSelected ? "#eef2ff" : "#ffffff",
                  cursor: "pointer",
                }}
              >
                {isSelected ? (
                  <CheckCircle2 size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                ) : (
                  <Circle size={14} color="#cbd5e1" style={{ flexShrink: 0 }} />
                )}
                <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#6366f1", flex: "0 0 70px" }}>
                  {exc.id}
                </span>
                <span style={{ color: "#64748b", flex: "0 0 90px" }}>{exc.account}</span>
                <span style={{ color: "#1e293b", flex: 1 }}>{exc.type}</span>
                <SeverityBadge severity={exc.severity} />
              </button>
            );
          })}
        </div>
      </div>

      {/* AI evidence / explanation for the selected exception */}
      {selected && (
        <div
          style={{
            marginBottom: 18,
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "12px 14px",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            AI Evidence / Explanation
          </div>
          <div style={{ fontSize: 12.5, color: "#475569", marginBottom: 8 }}>
            Selected Exception: <strong style={{ color: "#1e293b" }}>{selected.id}</strong>
            {" - "}
            {selected.securityName} ({selected.account})
          </div>
          <div style={{ display: "grid", gap: 5 }}>
            {selected.evidence.map((row) => (
              <div key={row.label} style={{ display: "flex", fontSize: 13 }}>
                <span style={{ flex: "0 0 170px", color: "#64748b" }}>{row.label}</span>
                <span style={{ color: "#1e293b", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test validation */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          Test Validation
        </div>
        <div style={{ display: "grid", gap: 5 }}>
          {summary.testValidation.map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                color: "#166534",
              }}
            >
              <CheckCircle2 size={14} color="#16a34a" style={{ flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onDownload}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#1e293b",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "9px 18px",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <Download size={14} /> Download Excel Report
      </button>
    </div>
  );
}
