export interface ProfileStats {
  totalTrades: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  totalStakedLamports: bigint;
  challengesPlayed: number;
  challengesWon: number;
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: "target" | "check" | "flame" | "rocket" | "medal" | "swords" | "trophy";
  check: (s: ProfileStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-prediction",
    label: "First Prediction",
    description: "Enter your first position on any market",
    icon: "target",
    check: (s) => s.totalTrades >= 1,
  },
  {
    id: "first-win",
    label: "First Win",
    description: "Win a resolved prediction",
    icon: "check",
    check: (s) => s.wins >= 1,
  },
  {
    id: "hot-streak",
    label: "Hot Streak",
    description: "Reach a 3-win streak",
    icon: "flame",
    check: (s) => s.bestStreak >= 3,
  },
  {
    id: "on-fire",
    label: "On Fire",
    description: "Reach a 5-win streak",
    icon: "rocket",
    check: (s) => s.bestStreak >= 5,
  },
  {
    id: "veteran-trader",
    label: "Veteran Trader",
    description: "Enter 10 or more positions",
    icon: "medal",
    check: (s) => s.totalTrades >= 10,
  },
  {
    id: "challenger",
    label: "Challenger",
    description: "Take part in a Head-to-Head challenge",
    icon: "swords",
    check: (s) => s.challengesPlayed >= 1,
  },
  {
    id: "champion",
    label: "Champion",
    description: "Win a Head-to-Head challenge",
    icon: "trophy",
    check: (s) => s.challengesWon >= 1,
  },
];

export function unlockedAchievements(stats: ProfileStats): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats));
}
