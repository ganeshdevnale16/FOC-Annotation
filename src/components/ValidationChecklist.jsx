import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Pause, Play } from "lucide-react";
import SpinnerIcon from "./icons/SpinnerIcon";
import { SUB_CHECK_MS, PASS_PAUSE_MS } from "../data/timingConstants";

/**
 * Flattens the procedures into a frame timeline: one frame per sub-check,
 * plus a trailing "pass" frame per procedure that holds its result on screen.
 * Frames advance on a timer that can be paused, so nothing is pre-scheduled.
 */
function buildFrames(checks) {
  const frames = [];
  checks.forEach((check, procIndex) => {
    check.subChecks.forEach(() =>
      frames.push({ procIndex, kind: "sub", duration: SUB_CHECK_MS })
    );
    frames.push({ procIndex, kind: "pass", duration: PASS_PAUSE_MS });
  });
  return frames;
}

export default function ValidationChecklist({
  checks,
  onComplete,
  runningLabel = "Running control tests and validating evidence...",
}) {
  const frames = useMemo(() => buildFrames(checks), [checks]);
  const [idx, setIdx] = useState(0); // frames elapsed
  const [paused, setPaused] = useState(false);
  // Procedure ids the user has re-opened after they collapsed on completion
  const [expanded, setExpanded] = useState({});
  const completedRef = useRef(false);

  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Where each procedure's frames sit in the timeline
  const bounds = useMemo(() => {
    let cursor = 0;
    return checks.map((c) => {
      const start = cursor;
      cursor += c.subChecks.length; // sub-check frames
      const passFrame = cursor; // its pass frame
      cursor += 1;
      return { start, passFrame, subCount: c.subChecks.length };
    });
  }, [checks]);

  const finished = idx >= frames.length;

  // Advance one frame at a time - pausing simply stops scheduling the next
  useEffect(() => {
    if (paused || finished) return;
    const t = setTimeout(() => setIdx((i) => i + 1), frames[idx].duration);
    return () => clearTimeout(t);
  }, [idx, paused, finished, frames]);

  // Tell the parent once, so it can append the results below this message
  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [finished, onComplete]);

  const totalSubs = useMemo(
    () => checks.reduce((sum, c) => sum + c.subChecks.length, 0),
    [checks]
  );
  const subsDone = useMemo(
    () =>
      bounds.reduce(
        (sum, b) => sum + Math.min(Math.max(idx - b.start, 0), b.subCount),
        0
      ),
    [bounds, idx]
  );
  const proceduresDone = bounds.filter((b) => idx > b.passFrame).length;
  // Only procedures that have started are rendered; the last one gets no divider
  const lastVisible = bounds.reduce(
    (last, b, i) => (idx >= b.start ? i : last),
    -1
  );
  const pct = Math.round((subsDone / totalSubs) * 100);

  return (
    <div>
      {/* Header - status, progress and pause control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {finished ? (
            <Check size={15} color="#16a34a" strokeWidth={3} />
          ) : paused ? (
            <Pause size={14} color="#b45309" />
          ) : (
            <SpinnerIcon size={15} />
          )}
          {finished
            ? `Validation complete - ${checks.length} procedures, ${totalSubs} checks passed.`
            : paused
            ? "Validation paused."
            : runningLabel}
        </span>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: finished ? "#16a34a" : "#6366f1",
              whiteSpace: "nowrap",
            }}
          >
            {proceduresDone} / {checks.length}
          </span>

          {!finished && (
            <button
              onClick={() => setPaused((p) => !p)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: paused ? "#6366f1" : "#ffffff",
                color: paused ? "#ffffff" : "#475569",
                border: `1px solid ${paused ? "#6366f1" : "#e2e8f0"}`,
                borderRadius: 7,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? "Resume" : "Pause"}
            </button>
          )}
        </span>
      </div>

      <div
        style={{
          height: 4,
          background: "#e2e8f0",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: finished ? "#16a34a" : paused ? "#f59e0b" : "#6366f1",
            borderRadius: 99,
            transition: "width 0.3s ease, background 0.3s ease",
          }}
        />
      </div>

      {/* Procedures - completed ones stay on screen */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          background: "#f8fafc",
          overflow: "hidden",
        }}
      >
        {checks.map((check, i) => {
          const { start, passFrame, subCount } = bounds[i];
          const isDone = idx > passFrame;
          const isPending = idx < start;
          const isActive = !isDone && !isPending;
          const subDone = Math.min(Math.max(idx - start, 0), subCount);
          const showFindings = isDone || idx === passFrame;
          // Sub-checks collapse once the procedure passes, unless re-opened
          const isOpen = !showFindings || !!expanded[check.id];

          // Not started yet - nothing to show
          if (isPending) return null;

          return (
            <div
              key={check.id}
              onClick={
                showFindings ? () => toggleExpanded(check.id) : undefined
              }
              onMouseEnter={(e) => {
                if (showFindings) e.currentTarget.style.background = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                if (showFindings) e.currentTarget.style.background = "transparent";
              }}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 14px",
                background: isActive ? "#ffffff" : "transparent",
                borderBottom:
                  i === lastVisible ? "none" : "1px solid #eef2f6",
                cursor: showFindings ? "pointer" : "default",
                transition: "background 0.3s ease",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  marginTop: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showFindings ? (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={12} color="#16a34a" strokeWidth={3} />
                  </span>
                ) : paused ? (
                  <Pause size={14} color="#f59e0b" />
                ) : (
                  <SpinnerIcon size={16} />
                )}
              </span>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: showFindings ? "#166534" : "#1e293b",
                    }}
                  >
                    {check.label}
                  </span>

                  {showFindings ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#166534",
                        background: "#dcfce7",
                        borderRadius: 99,
                        padding: "2px 8px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      Pass
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: paused ? "#b45309" : "#6366f1",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {subDone} / {subCount}
                    </span>
                  )}
                </div>

                {/* Detail - kept visible whether running or collapsed */}
                <div
                  style={{
                    fontSize: 12.5,
                    color: "#64748b",
                    lineHeight: 1.6,
                    margin: "4px 0 6px",
                  }}
                >
                  {check.detail}
                </div>

                {/* Sub-checks - collapsed once passed, re-openable on click */}
                {showFindings && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: "#94a3b8",
                    }}
                  >
                    {isOpen ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                    {isOpen ? "Hide" : "Show"} {subCount} checks
                  </span>
                )}

                {isOpen && (
                <div style={{ display: "grid", gap: 3, marginTop: 4 }}>
                  {check.subChecks.map((sub, k) => {
                    const cleared = k < subDone;
                    const running = k === subDone && !showFindings;
                    return (
                      <div
                        key={sub}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 7,
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: cleared
                            ? "#16a34a"
                            : running
                            ? "#475569"
                            : "#b0bac7",
                          transition: "color 0.25s ease",
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "center",
                            marginTop: 3,
                          }}
                        >
                          {cleared ? (
                            <Check size={11} color="#16a34a" strokeWidth={3} />
                          ) : running ? (
                            paused ? (
                              <Pause size={10} color="#f59e0b" />
                            ) : (
                              <SpinnerIcon size={11} />
                            )
                          ) : (
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: "#dbe1e9",
                              }}
                            />
                          )}
                        </span>
                        <span>{sub}</span>
                      </div>
                    );
                  })}
                </div>
                )}

                {/* Findings */}
                {showFindings && check.points?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#16a34a",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: 3,
                      }}
                    >
                      Noted that
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 15,
                        fontSize: 12.5,
                        color: "#475569",
                        lineHeight: 1.6,
                      }}
                    >
                      {check.points.map((pt, k) => (
                        <li key={k} style={{ marginBottom: 2 }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
