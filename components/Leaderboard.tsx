"use client";

import { FC } from "react";
import { useLeaderboard } from "../hooks/useLeaderboard";

function shortAddr(base58: string) {
  return `${base58.slice(0, 4)}…${base58.slice(-4)}`;
}

export const Leaderboard: FC = () => {
  const { entries, loading } = useLeaderboard();

  return (
    <div className="card">
      {loading ? (
        <div className="empty-note">Loading leaderboard…</div>
      ) : entries.length === 0 ? (
        <div className="empty-note">No resolved positions yet — the leaderboard fills in once markets resolve.</div>
      ) : (
        entries.map((e, i) => (
          <div
            key={e.user.toBase58()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: i < entries.length - 1 ? "1px solid var(--border-soft)" : "none",
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: i === 0 ? "var(--gold)" : "var(--panel-2)",
                color: i === 0 ? "#1a1204" : "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontWeight: 600, flex: 1 }}>{shortAddr(e.user.toBase58())}</span>
            <span style={{ color: "var(--gold)", fontSize: 12 }}>🔥 {e.streak}</span>
            <span style={{ color: "var(--text-dim)", fontSize: 12 }}>
              {e.wins}W-{e.losses}L
            </span>
          </div>
        ))
      )}
    </div>
  );
};
