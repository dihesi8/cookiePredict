// Streak Multiplier System — mirrors the table in the product blueprint:
// 0:1.0x 1:1.25x 2:1.5x 3:2.0x 4:3.0x 5+: +1.0x per level, capped at 10x.
// This is a *display* multiplier for now — the funded bonus-pool payout
// wiring is a later phase, per the blueprint's own economics section.

export function multiplierForStreak(streak: number): number {
  const table = [1.0, 1.25, 1.5, 2.0, 3.0];
  if (streak <= 4) return table[streak];
  return Math.min(10, 3.0 + (streak - 4));
}

export interface ResolvedResult {
  side: boolean; // which way the user bet
  outcome: boolean; // market's final outcome
  resolveTs: bigint; // for chronological ordering
}

/**
 * Current consecutive-win streak: walk resolved results from most recent
 * to oldest, stop at the first loss. Unresolved markets are excluded
 * before this is called.
 */
export function computeStreak(results: ResolvedResult[]): number {
  const sorted = [...results].sort((a, b) => (a.resolveTs < b.resolveTs ? 1 : -1)); // newest first
  let streak = 0;
  for (const r of sorted) {
    if (r.side === r.outcome) streak++;
    else break;
  }
  return streak;
}

/**
 * Longest consecutive-win run anywhere in history — used for achievement
 * badges ("best streak"), distinct from computeStreak's *current* trailing streak.
 */
export function computeBestStreak(results: ResolvedResult[]): number {
  const sorted = [...results].sort((a, b) => (a.resolveTs < b.resolveTs ? -1 : 1)); // oldest first
  let best = 0;
  let run = 0;
  for (const r of sorted) {
    if (r.side === r.outcome) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}
