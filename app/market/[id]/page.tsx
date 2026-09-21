"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { marketById } from "../../../lib/markets";
import { marketPda } from "../../../lib/program";
import { useMarket } from "../../../hooks/useMarket";

const NavBar = dynamic(() => import("../../../components/NavBar").then((m) => m.NavBar), { ssr: false });
const TradePanel = dynamic(() => import("../../../components/TradePanel").then((m) => m.TradePanel), { ssr: false });
const PortfolioCard = dynamic(() => import("../../../components/PortfolioCard").then((m) => m.PortfolioCard), { ssr: false });
const AIAnalyst = dynamic(() => import("../../../components/AIAnalyst").then((m) => m.AIAnalyst), { ssr: false });
const ChallengesPanel = dynamic(() => import("../../../components/ChallengesPanel").then((m) => m.ChallengesPanel), { ssr: false });

function MarketDetailBody({ id }: { id: bigint }) {
  const meta = marketById(id);
  const { market } = useMarket(id);

  if (!meta) {
    return <div className="empty-note">Unknown market id.</div>;
  }

  const yesPct =
    market && market.yesPool + market.noPool > 0n
      ? Number((market.yesPool * 100n) / (market.yesPool + market.noPool))
      : 50;

  return (
    <>
      <span className="tag tag-open" style={{ marginBottom: 10, display: "inline-block" }}>{meta.category}</span>

      <TradePanel marketId={meta.id} question={meta.question} />

      <div style={{ marginTop: 14 }}>
        <AIAnalyst question={meta.question} category={meta.category} yesPct={yesPct} noPct={100 - yesPct} />
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="section-title">Your Position</div>
        <PortfolioCard marketId={meta.id} question={meta.question} />
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="section-title">Head-to-Head Challenges</div>
        <ChallengesPanel marketId={meta.id} marketAddress={marketPda(meta.id)[0]} question={meta.question} />
      </div>
    </>
  );
}

export default function MarketDetailPage() {
  const params = useParams();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  let id: bigint;
  try {
    id = BigInt(idStr ?? "0");
  } catch {
    id = 0n;
  }

  return (
    <>
      <NavBar />
      <main className="page">
        <MarketDetailBody id={id} />
      </main>
    </>
  );
}
