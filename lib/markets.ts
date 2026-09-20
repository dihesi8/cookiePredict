export type Category = "Crypto" | "Politics" | "Ecosystem" | "Tech";

export const CATEGORIES: Category[] = ["Crypto", "Politics", "Ecosystem", "Tech"];

export interface MarketMeta {
  id: bigint;
  category: Category;
  question: string;
  closeDays: number; // days from seeding until close
}

export const MARKETS: MarketMeta[] = [
  // Crypto
  { id: 1n, category: "Crypto", question: "Will BTC reach $120,000 before October 1, 2026?", closeDays: 11 },
  { id: 2n, category: "Crypto", question: "Will SOL be above $300 by the end of September 2026?", closeDays: 10 },
  { id: 3n, category: "Crypto", question: "Will ETH flip a top-5 market cap rank this quarter?", closeDays: 30 },
  { id: 4n, category: "Crypto", question: "Will total crypto market cap exceed $4T by year-end 2026?", closeDays: 90 },
  { id: 5n, category: "Crypto", question: "Will a spot altcoin ETF be approved in the US by Dec 2026?", closeDays: 75 },

  // Politics
  { id: 6n, category: "Politics", question: "Will the US Federal Reserve cut rates at its next FOMC meeting?", closeDays: 21 },
  { id: 7n, category: "Politics", question: "Will UK inflation fall below 2% by Q4 2026?", closeDays: 60 },
  { id: 8n, category: "Politics", question: "Will a new EU-wide crypto regulation pass by end of 2026?", closeDays: 90 },
  { id: 9n, category: "Politics", question: "Will global oil prices close above $90/barrel this quarter?", closeDays: 45 },
  { id: 10n, category: "Politics", question: "Will any G7 nation hold snap elections before 2027?", closeDays: 90 },

  // Ecosystem (Cookie Chain-specific)
  { id: 11n, category: "Ecosystem", question: "Will Cookie Chain TVL pass $5M this quarter?", closeDays: 40 },
  { id: 12n, category: "Ecosystem", question: "Will $COOK reach $0.10 before December 31, 2026?", closeDays: 70 },
  { id: 13n, category: "Ecosystem", question: "Will Cookie Chain daily active wallets exceed 10,000?", closeDays: 30 },
  { id: 14n, category: "Ecosystem", question: "Will a top-10 CEX list $COOK by year-end 2026?", closeDays: 80 },
  { id: 15n, category: "Ecosystem", question: "Will Cookie Chain surpass 50 live dApps by Q1 2027?", closeDays: 90 },

  // Tech
  { id: 16n, category: "Tech", question: "Will OpenAI release a new flagship model before December 2026?", closeDays: 60 },
  { id: 17n, category: "Tech", question: "Will Apple announce a foldable iPhone in 2026?", closeDays: 90 },
  { id: 18n, category: "Tech", question: "Will a major tech company announce layoffs exceeding 10,000 this quarter?", closeDays: 45 },
  { id: 19n, category: "Tech", question: "Will the global AI chip shortage ease by Q4 2026?", closeDays: 75 },
  { id: 20n, category: "Tech", question: "Will a Fortune 500 company suffer a major data breach this quarter?", closeDays: 45 },
];

export function marketById(id: bigint): MarketMeta | undefined {
  return MARKETS.find((m) => m.id === id);
}
