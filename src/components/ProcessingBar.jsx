import { useEffect, useState } from "react";
import SpinnerIcon from "./icons/SpinnerIcon";
import { PROCESSING_BAR_MS } from "../data/timingConstants";

export default function ProcessingBar({ label, duration = PROCESSING_BAR_MS }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    // Progress points as a fraction of the total run - front-loaded so the
    // bar moves early and then eases toward 100%.
    const steps = [
      { target: 12, at: 0.04 },
      { target: 30, at: 0.15 },
      { target: 48, at: 0.3 },
      { target: 62, at: 0.45 },
      { target: 74, at: 0.6 },
      { target: 85, at: 0.75 },
      { target: 93, at: 0.88 },
      { target: 100, at: 1 },
    ];
    const timers = steps.map(({ target, at }) =>
      setTimeout(() => setPct(target), Math.round(duration * at))
    );
    return () => timers.forEach(clearTimeout);
  }, [duration]);

  return (
    <div
      style={{
        marginTop: 10,
        padding: "12px 14px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "#475569",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <SpinnerIcon size={13} /> {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "#e2e8f0",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#6366f1",
            borderRadius: 99,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
