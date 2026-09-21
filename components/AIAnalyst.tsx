"use client";

import { FC, useState } from "react";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";

interface Analysis {
  summary: string;
  bullish: string[];
  bearish: string[];
  estimatedProbabilityYes: number;
  confidence: "low" | "medium" | "high";
}

export const AIAnalyst: FC<{ question: string; category: string; yesPct: number; noPct: number }> = ({
  question,
  category,
  yesPct,
  noPct,
}) => {
  const [state, setState] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "error"; msg: string }
    | { kind: "done"; data: Analysis }
  >({ kind: "idle" });

  async function analyze() {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, category, yesPct, noPct }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", msg: data.error ?? "Analysis failed" });
        return;
      }
      setState({ kind: "done", data });
    } catch (e: any) {
      setState({ kind: "error", msg: e?.message ?? "Analysis failed" });
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="icon-row" style={{ fontSize: 13, fontWeight: 650 }}>
          <Brain size={15} color="var(--gold)" /> AI Market Analyst
        </div>
        {state.kind !== "loading" && (
          <button onClick={analyze} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>
            {state.kind === "done" ? "Re-analyze" : "Analyze"}
          </button>
        )}
      </div>

      {state.kind === "idle" && (
        <div className="empty-note">
          Get an AI-generated read on this market: summary, bullish/bearish factors, and an estimated
          probability. Informational only, not financial advice.
        </div>
      )}
      {state.kind === "loading" && <div className="empty-note">Analyzing…</div>}
      {state.kind === "error" && <div className="status-line status-error">{state.msg}</div>}
      {state.kind === "done" && (
        <div style={{ fontSize: 12.5 }}>
          <p style={{ color: "var(--text-dim)", marginBottom: 12 }}>{state.data.summary}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div className="icon-row" style={{ color: "var(--yes)", fontWeight: 650, marginBottom: 4 }}>
                <TrendingUp size={13} /> Bullish (YES)
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-dim)" }}>
                {state.data.bullish?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
            <div>
              <div className="icon-row" style={{ color: "var(--no)", fontWeight: 650, marginBottom: 4 }}>
                <TrendingDown size={13} /> Bearish (NO)
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-dim)" }}>
                {state.data.bearish?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                padding: "4px 10px",
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              AI est. {state.data.estimatedProbabilityYes}% YES
            </span>
            <span style={{ color: "var(--text-faint)", fontSize: 11 }}>
              confidence: {state.data.confidence}
            </span>
          </div>

          <div style={{ fontSize: 10.5, color: "var(--text-faint)", borderTop: "1px solid var(--border-soft)", paddingTop: 8 }}>
            AI-generated from general knowledge only (no live news access). Informational only, not
            financial advice, and does not affect market resolution.
          </div>
        </div>
      )}
    </div>
  );
};
