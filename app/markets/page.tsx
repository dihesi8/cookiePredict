"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, Filter } from "lucide-react";
import { CATEGORIES, Category, MARKETS } from "../../lib/markets";

const NavBar = dynamic(() => import("../../components/NavBar").then((m) => m.NavBar), { ssr: false });
const MarketCard = dynamic(() => import("../../components/MarketCard").then((m) => m.MarketCard), { ssr: false });

export default function MarketsPage() {
  const [filter, setFilter] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");

  const shown = MARKETS.filter((m) => {
    const matchesCategory = filter === "All" || m.category === filter;
    const matchesQuery = m.question.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <>
      <NavBar />
      <main className="page">
        <div className="section-title" style={{ marginBottom: 4 }}>Markets</div>

        <div className="search-bar">
          <Search size={14} />
          <input placeholder="Search markets..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="filter-row">
          <Filter size={13} color="var(--text-faint)" />
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
          {shown.length === 0 ? (
            <div className="empty-note">No markets match your search.</div>
          ) : (
            shown.map((m) => <MarketCard key={m.id.toString()} meta={m} />)
          )}
        </div>
      </main>
    </>
  );
}
