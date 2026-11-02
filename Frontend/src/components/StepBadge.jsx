// "Step X of Y" badge, same treatment as the reference flow modules.
export default function StepBadge({ index, total, label }) {
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
      Step {index} of {total}
      {label ? ` · ${label}` : ""}
    </div>
  );
}
