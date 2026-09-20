import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "CookiePredict",
  description: "On-chain prediction markets on Cookie Chain",
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
