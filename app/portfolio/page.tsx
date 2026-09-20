"use client";

import dynamic from "next/dynamic";
import { MARKETS } from "../../lib/markets";

const NavBar = dynamic(() => import("../../components/NavBar").then((m) => m.NavBar), { ssr: false });
const PortfolioCard = dynamic(() => import("../../components/PortfolioCard").then((m) => m.PortfolioCard), { ssr: false });

export default function PortfolioPage() {
  return (
    <main className="page">
      <NavBar />
      <div className="section-title">Your Portfolio</div>
      <div className="card-row">
        {MARKETS.map((m) => (
          <PortfolioCard key={m.id.toString()} marketId={m.id} question={m.question} />
        ))}
      </div>
    </main>
  );
}
