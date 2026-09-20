"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CATEGORIES, Category, MARKETS } from "../../lib/markets";

const NavBar = dynamic(() => import("../../components/NavBar").then((m) => m.NavBar), { ssr: false });
const MarketCard = dynamic(() => import("../../components/MarketCard").then((m) => m.MarketCard), { ssr: false });

export default function MarketsPage() {
  const [filter, setFilter] = useState<Category | "All">("All");
  const shown = filter === "All" ? MARKETS : MARKETS.filter((m) => m.category === filter);

  return (
    <main className="page">
      <NavBar />
      <div className="section-title" style={{ marginBottom: 4 }}>Markets</div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="btn"
            style={{
              padding: "6px 13px",
              fontSize: 12,
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: filter === c ? "var(--accent)" : "transparent",
              color: filter === c ? "#071022" : "var(--text-dim)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div>
        {shown.map((m) => (
          <MarketCard key={m.id.toString()} meta={m} />
        ))}
      </div>
    </main>
  );
}
