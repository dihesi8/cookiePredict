"use client";

import dynamic from "next/dynamic";
import { Sparkles, ArrowUpRight, ChevronRight } from "lucide-react";
import { marketPda } from "../lib/program";
import { MARKETS } from "../lib/markets";

const NavBar = dynamic(() => import("../components/NavBar").then((m) => m.NavBar), { ssr: false });
const MarketCard = dynamic(() => import("../components/MarketCard").then((m) => m.MarketCard), { ssr: false });
const ActivityFeed = dynamic(() => import("../components/ActivityFeed").then((m) => m.ActivityFeed), { ssr: false });
const Leaderboard = dynamic(() => import("../components/Leaderboard").then((m) => m.Leaderboard), { ssr: false });

const QUESTION_BY_MARKET = Object.fromEntries(
  MARKETS.map((m) => [marketPda(m.id)[0].toBase58(), m.question])
);

const TRENDING = MARKETS.slice(0, 4);

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="page">
        <div className="hero">
          <div className="hero-kicker">
            <Sparkles size={12} />
            Built on Cookie Chain
          </div>
          <h1>Predict what happens next</h1>
          <p>
            Trade YES/NO positions on real questions, build a streak, and challenge friends
            head to head. Every trade settles on-chain through Nightly.
          </p>
          <div className="hero-actions">
            <a href="/markets" className="btn btn-primary icon-row" style={{ textDecoration: "none" }}>
              Explore markets <ChevronRight size={14} />
            </a>
            <a
              href="https://hyperlane.cookiescan.io"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost icon-row"
              style={{ textDecoration: "none" }}
            >
              Bridge SOL to COOK <ArrowUpRight size={13} />
            </a>
          </div>
          <div className="stats-ribbon">
            <div>
              <div className="stat-label">Markets</div>
              <div className="stat-value">{MARKETS.length}</div>
            </div>
            <div>
              <div className="stat-label">Categories</div>
              <div className="stat-value">4</div>
            </div>
            <div>
              <div className="stat-label">Wallet</div>
              <div className="stat-value">Nightly</div>
            </div>
            <div>
              <div className="stat-label">Chain</div>
              <div className="stat-value">Cookie / SVM</div>
            </div>
          </div>
        </div>

        <div>
          <div className="section-title" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Trending Markets</span>
            <a href="/markets" style={{ color: "var(--accent)" }}>View all</a>
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
      </main>
    </>
  );
}
