"use client";

import { FC } from "react";
import { Flame } from "lucide-react";
import { useStreak } from "../hooks/useStreak";
import { multiplierForStreak } from "../lib/streak";

const LADDER_SEGMENTS = 5;

export const StreakWidget: FC = () => {
  const { streak, multiplier, loading } = useStreak();
  const nextMultiplier = multiplierForStreak(streak + 1);

  return (
    <div className="card" style={{ minWidth: 220 }}>
      <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 650, marginBottom: 10 }}>
        YOUR STREAK
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <Flame size={20} color="var(--gold)" />
        <span style={{ fontSize: 26, fontWeight: 700 }}>{loading ? "..." : streak}</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 13,
            fontWeight: 700,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          {multiplier.toFixed(2)}x
        </span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {Array.from({ length: LADDER_SEGMENTS }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              background: i < streak ? "var(--gold)" : "var(--panel-2)",
              border: "1px solid var(--border)",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-faint)" }}>
        Next win: {nextMultiplier.toFixed(2)}x
      </div>
    </div>
  );
};
