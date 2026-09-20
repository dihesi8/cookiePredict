import { PublicKey } from "@solana/web3.js";
import { MarketAccount, PositionAccount } from "./program";
import { computeStreak, ResolvedResult } from "./streak";

export interface LeaderboardEntry {
  user: PublicKey;
  wins: number;
  losses: number;
  streak: number;
  totalStakedLamports: bigint;
}

export function computeLeaderboard(
  positions: { account: PositionAccount }[],
  marketByKey: Map<string, MarketAccount>
): LeaderboardEntry[] {
  const byUser = new Map<
    string,
    { user: PublicKey; results: ResolvedResult[]; totalStaked: bigint }
  >();

  for (const { account: p } of positions) {
    const key = p.user.toBase58();
    if (!byUser.has(key)) {
      byUser.set(key, { user: p.user, results: [], totalStaked: 0n });
    }
    const entry = byUser.get(key)!;
    entry.totalStaked += p.amount;

    const market = marketByKey.get(p.market.toBase58());
    if (market && market.status === "Resolved" && market.outcome !== null) {
      entry.results.push({ side: p.side, outcome: market.outcome, resolveTs: market.resolveTs });
    }
  }

  const rows: LeaderboardEntry[] = [];
  for (const { user, results, totalStaked } of byUser.values()) {
    const wins = results.filter((r) => r.side === r.outcome).length;
    const losses = results.length - wins;
    const streak = computeStreak(results);
    rows.push({ user, wins, losses, streak, totalStakedLamports: totalStaked });
  }

  // Rank by current streak first (the product's signature stat), then total wins.
  rows.sort((a, b) => (b.streak !== a.streak ? b.streak - a.streak : b.wins - a.wins));
  return rows;
}
