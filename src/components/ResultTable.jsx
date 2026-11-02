import { Download } from "lucide-react";
import CommentCell from "./CommentCell";

const BADGE_COLORS = {
  pass: { bg: "#dcfce7", fg: "#166534" },
  passed: { bg: "#dcfce7", fg: "#166534" },
  fail: { bg: "#fee2e2", fg: "#991b1b" },
  failed: { bg: "#fee2e2", fg: "#991b1b" },
  critical: { bg: "#fee2e2", fg: "#991b1b" },
  high: { bg: "#ffedd5", fg: "#9a3412" },
};

function Badge({ value }) {
  const colors = BADGE_COLORS[String(value).toLowerCase()] || {
    bg: "#dcfce7",
    fg: "#166534",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 99,
        background: colors.bg,
        color: colors.fg,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {value}
    </span>
  );
}

export default function ResultTable({ intro, columns, rows, onDownload }) {
  return (
    <div>
      <p
        style={{
          fontSize: 14,
          color: "#1e293b",
          marginBottom: 14,
          marginTop: 0,
        }}
      >
        {intro}
      </p>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e2e8f0",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            minWidth: 700,
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "11px 14px",
                    textAlign: "left",
                    color: "#64748b",
                    fontWeight: 600,
                    borderBottom: "1px solid #e2e8f0",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "#ffffff" : "#fafbfc",
                  verticalAlign: "top",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "11px 14px",
                      color: col.key === "evidenceName" || col.mono ? "#6366f1" : "#475569",
                      borderBottom: "1px solid #f1f5f9",
                      minWidth: col.minWidth,
                      whiteSpace: col.width && !col.minWidth ? "nowrap" : undefined,
                      fontFamily: col.mono ? "monospace" : undefined,
                      fontSize: col.mono ? 12 : undefined,
                    }}
                  >
                    {col.type === "comment" ? (
                      <CommentCell comment={row[col.key]} />
                    ) : col.type === "badge" ? (
                      <Badge value={row[col.key]} />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={onDownload}
        style={{
          marginTop: 16,
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
