"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { decodeMarket, getUserChallenges, getUserPositions, MarketAccount } from "../lib/program";
import { computeBestStreak, computeStreak, ResolvedResult } from "../lib/streak";
import { ProfileStats } from "../lib/achievements";

const POLL_MS = 18000;

export function useProfile() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setStats(null);
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function poll() {
      try {
        const [positions, challenges] = await Promise.all([
          getUserPositions(connection, publicKey!),
          getUserChallenges(connection, publicKey!),
        ]);

        const marketKeys = [
          ...new Set([
            ...positions.map((p) => p.account.market.toBase58()),
            ...challenges.map((c) => c.account.market.toBase58()),
          ]),
        ];
        const marketPks = marketKeys.map((s) => new PublicKey(s));
        const infos = await connection.getMultipleAccountsInfo(marketPks);
        const marketByKey = new Map<string, MarketAccount>();
        marketPks.forEach((pk, i) => {
          const info = infos[i];
          if (info) marketByKey.set(pk.toBase58(), decodeMarket(info.data));
        });

        const results: ResolvedResult[] = [];
        let totalStaked = 0n;
        for (const p of positions) {
          totalStaked += p.account.amount;
          const market = marketByKey.get(p.account.market.toBase58());
          if (market?.status === "Resolved" && market.outcome !== null) {
            results.push({ side: p.account.side, outcome: market.outcome, resolveTs: market.resolveTs });
          }
        }

        const wins = results.filter((r) => r.side === r.outcome).length;

        let challengesPlayed = 0;
        let challengesWon = 0;
        for (const c of challenges) {
          if (c.account.status === "Accepted" || c.account.status === "Settled") {
            challengesPlayed++;
          }
          if (c.account.status === "Settled") {
            const market = marketByKey.get(c.account.market.toBase58());
            if (market?.outcome !== null && market?.outcome !== undefined) {
              const creatorWon = c.account.creatorSide === market.outcome;
              const winner = creatorWon ? c.account.creator : c.account.recipient;
              if (winner.equals(publicKey!)) challengesWon++;
            }
          }
        }

        const computed: ProfileStats = {
          totalTrades: positions.length,
          wins,
          losses: results.length - wins,
          currentStreak: computeStreak(results),
          bestStreak: computeBestStreak(results),
          totalStakedLamports: totalStaked,
          challengesPlayed,
          challengesWon,
        };

        if (!cancelled) setStats(computed);
      } catch (e) {
        console.error("Failed to compute profile stats", e);
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

  return { stats, loading };
}
