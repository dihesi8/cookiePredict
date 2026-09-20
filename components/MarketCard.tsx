"use client";

import { FC } from "react";
import { MarketMeta } from "../lib/markets";
import { useMarket } from "../hooks/useMarket";

export const MarketCard: FC<{ meta: MarketMeta }> = ({ meta }) => {
  const { market, loading } = useMarket(meta.id);

  const yesPct =
    market && market.yesPool + market.noPool > 0n
      ? Number((market.yesPool * 100n) / (market.yesPool + market.noPool))
      : 50;

  return (
    <a href={`/market/${meta.id.toString()}`} className="card" style={{ display: "block", textDecoration: "none", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="tag tag-open">{meta.category}</span>
        {market && <span className="tag tag-resolved">{market.status}</span>}
      </div>
      <div className="question" style={{ marginBottom: loading || !market ? 0 : 8 }}>{meta.question}</div>
      {!loading && market && (
        <>
          <div className="prob-bar">
            <div className="yes-fill" style={{ width: `${yesPct}%` }} />
            <div className="no-fill" style={{ width: `${100 - yesPct}%` }} />
          </div>
          <div className="prob-labels" style={{ marginBottom: 0 }}>
            <span>YES {yesPct}%</span>
            <span>NO {100 - yesPct}%</span>
          </div>
        </>
      )}
      {!loading && !market && (
        <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>Not seeded on-chain yet</div>
      )}
    </a>
  );
};
