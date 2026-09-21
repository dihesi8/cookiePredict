import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "CookiePredict | Prediction Markets on Cookie Chain",
  description:
    "Trade YES/NO prediction markets on Cookie Chain. Build a streak, challenge friends head to head, and track your position on the leaderboard.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "CookiePredict",
    description: "On-chain prediction markets, streaks, and head-to-head challenges on Cookie Chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
