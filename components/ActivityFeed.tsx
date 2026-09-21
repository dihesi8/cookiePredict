"use client";

import { FC } from "react";
import { useActivityFeed } from "../hooks/useActivity";

function timeAgo(blockTime: number | null): string {
  if (blockTime === null) return "";
  const secs = Math.max(0, Math.floor(Date.now() / 1000) - blockTime);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

function shortAddr(base58: string) {
  return `${base58.slice(0, 4)}…${base58.slice(-4)}`;
}

export const ActivityFeed: FC<{ questionByMarket: Record<string, string> }> = ({
  questionByMarket,
}) => {
  const items = useActivityFeed();

  const label = (item: ReturnType<typeof useActivityFeed>[number]) => {
    const { event } = item;
    const q = questionByMarket[event.market.toBase58()] ?? "a market";

    switch (event.name) {
      case "MarketCreated":
        return `New market seeded: ${q}`;
      case "PositionEntered":
        return `${shortAddr(event.user.toBase58())} entered ${event.side ? "YES" : "NO"} on ${q} (${(
          Number(event.amount) / 1e9
        ).toFixed(2)} COOK)`;
      case "MarketResolved":
        return `Resolved ${event.outcome ? "YES" : "NO"} for ${q}`;
      case "WinningsClaimed":
        return `${shortAddr(event.user.toBase58())} claimed ${(Number(event.amount) / 1e9).toFixed(2)} COOK on ${q}`;
    }
  };

  const dot = (name: string) =>
    name === "WinningsClaimed" || name === "MarketResolved" ? "var(--yes)" : "var(--accent)";

  return (
    <div className="card">
      <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 650, marginBottom: 10 }}>
        RECENT ACTIVITY
      </div>
      {items.length === 0 ? (
        <div className="empty-note">No on-chain activity yet. Trade or resolve a market to see it here.</div>
      ) : (
        items.map((item, i) => (
          <div
            key={`${item.signature}-${i}`}
            style={{
              display: "flex",
              gap: 10,
              padding: "9px 0",
              borderBottom: i < items.length - 1 ? "1px solid var(--border-soft)" : "none",
              fontSize: 12.5,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: dot(item.event.name),
                marginTop: 5,
                flexShrink: 0,
              }}
            />
            <div>
              <div>{label(item)}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 2 }}>
                {timeAgo(item.blockTime)}
              </div>
            </div>
          </div>
        ))
      )}
      <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
        Polled from on-chain program logs every few seconds, no indexer.
      </div>
    </div>
  );
};
