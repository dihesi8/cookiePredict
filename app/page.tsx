"use client";

import dynamic from "next/dynamic";
import { marketPda } from "../lib/program";
import { MARKETS } from "../lib/markets";

const NavBar = dynamic(() => import("../components/NavBar").then((m) => m.NavBar), { ssr: false });
const WalletButton = dynamic(() => import("../components/WalletButton").then((m) => m.WalletButton), { ssr: false });
const StreakWidget = dynamic(() => import("../components/StreakWidget").then((m) => m.StreakWidget), { ssr: false });
const MarketCard = dynamic(() => import("../components/MarketCard").then((m) => m.MarketCard), { ssr: false });
const ActivityFeed = dynamic(() => import("../components/ActivityFeed").then((m) => m.ActivityFeed), { ssr: false });
const Leaderboard = dynamic(() => import("../components/Leaderboard").then((m) => m.Leaderboard), { ssr: false });

const QUESTION_BY_MARKET = Object.fromEntries(
  MARKETS.map((m) => [marketPda(m.id)[0].toBase58(), m.question])
);

const TRENDING = MARKETS.slice(0, 4);

export default function Home() {
  return (
    <main className="page">
      <NavBar />

      <div>
        <div className="brand-row">
          <div className="brand-mark">🍪</div>
          <div className="brand-name">
            Cookie<span>Predict</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <WalletButton />
          <StreakWidget />
        </div>
      </div>

      <div>
        <div className="section-title" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Trending Markets</span>
          <a href="/markets" style={{ color: "var(--accent)" }}>View all →</a>
        </div>
        {TRENDING.map((m) => (
          <MarketCard key={m.id.toString()} meta={m} />
        ))}
      </div>

      <div>
        <div className="section-title">Leaderboard</div>
        <Leaderboard />
      </div>

      <div>
        <div className="section-title">Recent Activity</div>
        <ActivityFeed questionByMarket={QUESTION_BY_MARKET} />
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
        <a href="https://hyperlane.cookiescan.io" target="_blank" rel="noreferrer">
          bridge SOL → COOK →
        </a>
      </div>
    </main>
  );
}
