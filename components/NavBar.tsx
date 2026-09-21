"use client";

import { FC } from "react";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Flame } from "lucide-react";
import { useStreak } from "../hooks/useStreak";
import { useWallet } from "@solana/wallet-adapter-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/markets", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
];

export const NavBar: FC = () => {
  const pathname = usePathname();
  const { connected } = useWallet();
  const { streak } = useStreak();

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="/" className="header-logo">
          <div className="brand-mark">
            <span style={{ fontSize: 15, fontWeight: 800 }}>C</span>
          </div>
          <span className="header-logo-text">
            Cookie<span>Predict</span>
          </span>
        </a>

        <nav className="header-nav">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="header-right">
          {connected && (
            <div className="streak-chip">
              <Flame size={13} />
              {streak}
            </div>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};
