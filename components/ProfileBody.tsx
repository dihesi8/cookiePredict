"use client";

import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProfile } from "../hooks/useProfile";
import { ACHIEVEMENTS, unlockedAchievements } from "../lib/achievements";

export const ProfileBody: FC = () => {
  const { connected } = useWallet();
  const { stats, loading } = useProfile();

  if (!connected) {
    return <div className="empty-note">Connect your wallet to see your profile.</div>;
  }
  if (loading || !stats) {
    return <div className="empty-note">Loading profile…</div>;
  }

  const winRate = stats.wins + stats.losses > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0;
  const unlocked = new Set(unlockedAchievements(stats).map((a) => a.id));

  const statItems = [
    { label: "Total Trades", value: stats.totalTrades },
    { label: "Win Rate", value: `${winRate}%` },
    { label: "Record", value: `${stats.wins}W-${stats.losses}L` },
    { label: "Current Streak", value: `🔥 ${stats.currentStreak}` },
    { label: "Best Streak", value: `🔥 ${stats.bestStreak}` },
    { label: "Total Staked", value: `${(Number(stats.totalStakedLamports) / 1e9).toFixed(2)} COOK` },
    { label: "Challenges Played", value: stats.challengesPlayed },
    { label: "Challenges Won", value: stats.challengesWon },
  ];

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {statItems.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">Achievements</div>
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.has(a.id);
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: 10,
                  borderRadius: 8,
                  background: isUnlocked ? "var(--accent-soft)" : "var(--panel-2)",
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 650 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{a.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
