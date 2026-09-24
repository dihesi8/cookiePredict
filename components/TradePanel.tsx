"use client";

import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { enterPositionIx } from "../lib/program";
import { useMarket } from "../hooks/useMarket";

const LAMPORTS_PER_COOK = 1_000_000_000n; // native token, 9 decimals like SOL

export const TradePanel: FC<{ marketId: bigint; question: string }> = ({
  marketId,
  question,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { market, marketAddress, loading } = useMarket(marketId);

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<
    { kind: "idle" } | { kind: "pending" } | { kind: "error"; msg: string } | { kind: "success"; sig: string }
  >({ kind: "idle" });

  async function trade(side: boolean) {
    if (!publicKey || !marketAddress) return;
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setStatus({ kind: "error", msg: "Enter an amount greater than 0" });
      return;
    }

    try {
      setStatus({ kind: "pending" });
      const lamports = BigInt(Math.round(amountNum * Number(LAMPORTS_PER_COOK)));
      const ix = enterPositionIx(publicKey, marketAddress, side, lamports);

      const tx = new Transaction().add(ix);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

      setStatus({ kind: "success", sig });
    } catch (e: any) {
      console.error(e);
      setStatus({ kind: "error", msg: e?.message ?? "Transaction failed" });
    }
  }

  const yesPct =
    market && market.yesPool + market.noPool > 0n
      ? Number((market.yesPool * 100n) / (market.yesPool + market.noPool))
      : 50;

  return (
    <div className="card">
      <div className="market-id">Market #{marketId.toString()}</div>
      <div className="question">{question}</div>

      {loading ? (
        <div className="empty-note">Loading market…</div>
      ) : !market ? (
        <div className="empty-note">Market not found on-chain yet. Seed it from /admin first.</div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className={`tag ${market.status === "Open" ? "tag-open" : "tag-resolved"}`}>
              {market.status}
            </span>
          </div>

          <div className="prob-bar">
            <div className="yes-fill" style={{ width: `${yesPct}%` }} />
            <div className="no-fill" style={{ width: `${100 - yesPct}%` }} />
          </div>
          <div className="prob-labels">
            <span>YES {yesPct}%</span>
            <span>NO {100 - yesPct}%</span>
          </div>

          <input
            type="number"
            min="0"
            step="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={status.kind === "pending"}
            className="amount-input"
            placeholder="Amount (COOK)"
          />

          <div className="btn-row">
            <button
              onClick={() => trade(true)}
              disabled={!connected || market.status !== "Open" || status.kind === "pending"}
              className="btn btn-yes"
            >
              YES
            </button>
            <button
              onClick={() => trade(false)}
              disabled={!connected || market.status !== "Open" || status.kind === "pending"}
              className="btn btn-no"
            >
              NO
            </button>
          </div>

          {status.kind !== "idle" && (
            <div
              className={`status-line ${
                status.kind === "pending" ? "status-pending" : status.kind === "error" ? "status-error" : "status-success"
              }`}
            >
              {status.kind === "pending" && "Confirm in Nightly, then waiting for confirmation…"}
              {status.kind === "error" && status.msg}
              {status.kind === "success" && (
                <>
                  Confirmed: {status.sig.slice(0, 8)}…{" "}
                  <a href={`https://cookiescan.io/tx/${status.sig}`} target="_blank" rel="noreferrer">
                    view on CookieScan →
                  </a>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
