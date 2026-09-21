"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { decodeMarket, getUserPositions } from "../lib/program";
import { computeStreak, multiplierForStreak, ResolvedResult } from "../lib/streak";

const POLL_MS = 15000;

export function useStreak() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setStreak(0);
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function poll() {
      try {
        const positions = await getUserPositions(connection, publicKey!);
        if (positions.length === 0) {
          if (!cancelled) setStreak(0);
          return;
        }

        const uniqueMarkets = [...new Set(positions.map((p) => p.account.market.toBase58()))].map(
          (s) => new PublicKey(s)
        );
        const marketInfos = await connection.getMultipleAccountsInfo(uniqueMarkets);

        const marketByKey = new Map<string, ReturnType<typeof decodeMarket>>();
        uniqueMarkets.forEach((pk, i) => {
          const info = marketInfos[i];
          if (info) marketByKey.set(pk.toBase58(), decodeMarket(info.data));
        });

        const results: ResolvedResult[] = [];
        for (const p of positions) {
          const market = marketByKey.get(p.account.market.toBase58());
          if (market && market.status === "Resolved" && market.outcome !== null) {
            results.push({
              side: p.account.side,
              outcome: market.outcome,
              resolveTs: market.resolveTs,
            });
          }
        }

        if (!cancelled) setStreak(computeStreak(results));
      } catch (e) {
        console.error("Failed to compute streak", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [connection, publicKey]);

  return { streak, multiplier: multiplierForStreak(streak), loading };
}
