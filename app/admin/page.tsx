"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { createMarketIx, resolveMarketIx, marketPda } from "../../lib/program";
import { MARKETS } from "../../lib/markets";

const NavBar = dynamic(() => import("../../components/NavBar").then((m) => m.NavBar), { ssr: false });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendIx(connection: any, publicKey: any, sendTransaction: any, ix: any) {
  const tx = new Transaction().add(ix);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = publicKey;
  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
  return sig;
}

async function sendIxWithRetry(connection: any, publicKey: any, sendTransaction: any, ix: any) {
  try {
    return await sendIx(connection, publicKey, sendTransaction, ix);
  } catch (e) {
    // One retry after a short pause — covers transient RPC hiccups /
    // rate limiting rather than a real rejection or on-chain error.
    await sleep(1500);
    return await sendIx(connection, publicKey, sendTransaction, ix);
  }
}

export default function AdminPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [marketId, setMarketId] = useState(MARKETS[0].id.toString());
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState({ done: 0, total: 0 });
  const [log, setLog] = useState<string[]>([]);

  function pushLog(msg: string) {
    setLog((l) => [msg, ...l].slice(0, 40));
  }

  async function seedAll() {
    if (!publicKey) return;
    setSeeding(true);
    setSeedProgress({ done: 0, total: MARKETS.length });
    for (let i = 0; i < MARKETS.length; i++) {
      const m = MARKETS[i];
      try {
        const closeTs = BigInt(Math.floor(Date.now() / 1000) + m.closeDays * 86400);
        const resolveTs = closeTs + 3600n;
        const ix = createMarketIx(publicKey, m.id, closeTs, resolveTs);
        const sig = await sendIxWithRetry(connection, publicKey, sendTransaction, ix);
        pushLog(`OK: seeded #${m.id} (${m.category}), ${sig.slice(0, 10)}…`);
      } catch (e: any) {
        pushLog(`FAIL: #${m.id} failed: ${e?.message ?? e}`);
      }
      setSeedProgress({ done: i + 1, total: MARKETS.length });
      // Small pause between transactions — the public RPC rate-limits
      // rapid back-to-back requests, which is the main cause of
      // mid-batch failures.
      await sleep(600);
    }
    setSeeding(false);
  }

  async function seedOne() {
    if (!publicKey) return;
    const m = MARKETS.find((x) => x.id.toString() === marketId);
    if (!m) return;
    try {
      const closeTs = BigInt(Math.floor(Date.now() / 1000) + m.closeDays * 86400);
      const resolveTs = closeTs + 3600n;
      const ix = createMarketIx(publicKey, m.id, closeTs, resolveTs);
      const sig = await sendIx(connection, publicKey, sendTransaction, ix);
      pushLog(`OK: seeded #${m.id}, ${sig.slice(0, 12)}…`);
    } catch (e: any) {
      pushLog(`FAIL: seed failed: ${e?.message ?? e}`);
    }
  }

  async function resolve(outcome: boolean) {
    if (!publicKey) return;
    const m = MARKETS.find((x) => x.id.toString() === marketId);
    if (!m) return;
    try {
      const [market] = marketPda(m.id);
      const ix = resolveMarketIx(publicKey, market, outcome);
      const sig = await sendIx(connection, publicKey, sendTransaction, ix);
      pushLog(`OK: resolved #${m.id} ${outcome ? "YES" : "NO"}, ${sig.slice(0, 12)}…`);
    } catch (e: any) {
      pushLog(`FAIL: resolve failed: ${e?.message ?? e}`);
    }
  }

  return (
    <>
      <NavBar />
      <main className="page" style={{ maxWidth: 520 }}>
      <div>
        <div className="section-title" style={{ marginBottom: 4 }}>Admin / Resolver</div>
        <p style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
          Trusted-resolver MVP model: whichever wallet signs create_market becomes that
          market's authority, and only that wallet can resolve it. An oracle-based resolver
          is planned as a future upgrade. This admin panel is the interim source of truth.
        </p>
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 8 }}>
          Seed all {MARKETS.length} markets ({[...new Set(MARKETS.map((m) => m.category))].join(", ")})
        </div>
        <p style={{ fontSize: 11.5, color: "var(--text-faint)", marginBottom: 10 }}>
          Sends one create_market transaction per market, sequentially. You'll be prompted to
          sign each one in Nightly.
        </p>
        <button onClick={seedAll} disabled={!connected || seeding} className="btn btn-primary" style={{ width: "100%" }}>
          {seeding ? `Seeding… ${seedProgress.done}/${seedProgress.total}` : `Seed all ${MARKETS.length} markets`}
        </button>
      </div>

      <div className="card">
        <label className="field-label">Market</label>
        <select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="field">
          {MARKETS.map((m) => (
            <option key={m.id.toString()} value={m.id.toString()}>
              #{m.id.toString()} [{m.category}] {m.question.slice(0, 40)}…
            </option>
          ))}
        </select>

        <div className="btn-row">
          <button onClick={seedOne} disabled={!connected} className="btn btn-ghost">
            Seed this one
          </button>
          <button onClick={() => resolve(true)} disabled={!connected} className="btn btn-yes">
            Resolve YES
          </button>
        </div>
        <button onClick={() => resolve(false)} disabled={!connected} className="btn btn-no" style={{ width: "100%", marginTop: 8 }}>
          Resolve NO
        </button>
      </div>

      <div>
        {log.map((l, i) => (
          <div key={i} className="log-line">{l}</div>
        ))}
      </div>
      </main>
    </>
  );
}
