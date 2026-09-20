"use client";

import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { claimWinningsIx } from "../lib/program";
import { useMarket } from "../hooks/useMarket";
import { usePosition } from "../hooks/usePosition";

export const PortfolioCard: FC<{ marketId: bigint; question: string }> = ({
  marketId,
  question,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { market, marketAddress } = useMarket(marketId);
  const { position, loading } = usePosition(marketAddress);

  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "pending" } | { kind: "error"; msg: string } | { kind: "success"; sig: string }
  >({ kind: "idle" });

  if (loading || !position || !market) return null;

  const won = market.status === "Resolved" && market.outcome === position.side;
  const canClaim = won && !position.claimed;
  const amountCook = Number(position.amount) / 1e9;

  async function claim() {
    if (!publicKey || !marketAddress) return;
    try {
      setStatus({ kind: "pending" });
      const ix = claimWinningsIx(publicKey, marketAddress);
      const tx = new Transaction().add(ix);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
      setStatus({ kind: "success", sig });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: "error", msg: e?.message ?? "Claim failed" });
    }
  }

  let tag = { cls: "tag-open", label: "Open" };
  if (market.status === "Resolved") {
    if (position.claimed) tag = { cls: "tag-won", label: "Claimed" };
    else if (won) tag = { cls: "tag-won", label: "Won" };
    else tag = { cls: "tag-lost", label: "Lost" };
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
        <div className="question" style={{ marginBottom: 0 }}>{question}</div>
        <span className={`tag ${tag.cls}`}>{tag.label}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>
        {position.side ? "YES" : "NO"} · {amountCook.toFixed(4)} COOK staked
      </div>

      {canClaim && (
        <button onClick={claim} disabled={status.kind === "pending"} className="btn btn-gold">
          {status.kind === "pending" ? "Claiming…" : "Claim winnings"}
        </button>
      )}

      {status.kind !== "idle" && (
        <div
          className={`status-line ${
            status.kind === "pending" ? "status-pending" : status.kind === "error" ? "status-error" : "status-success"
          }`}
        >
          {status.kind === "pending" && "Confirm in Nightly…"}
          {status.kind === "error" && status.msg}
          {status.kind === "success" && `Claimed: ${status.sig.slice(0, 8)}…`}
        </div>
      )}
    </div>
  );
};
