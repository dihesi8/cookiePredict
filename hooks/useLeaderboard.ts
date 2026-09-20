"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { decodeMarket, getAllPositions } from "../lib/program";
import { computeLeaderboard, LeaderboardEntry } from "../lib/leaderboard";

const POLL_MS = 8000;
const TOP_N = 10;

export function useLeaderboard() {
  const { connection } = useConnection();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const positions = await getAllPositions(connection);
        if (positions.length === 0) {
          if (!cancelled) setEntries([]);
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

        const ranked = computeLeaderboard(positions, marketByKey).slice(0, TOP_N);
        if (!cancelled) setEntries(ranked);
      } catch (e) {
        console.error("Failed to compute leaderboard", e);
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
  }, [connection]);

  return { entries, loading };
}
