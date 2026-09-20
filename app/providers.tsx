"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { NightlyWalletAdapter } from "@solana/wallet-adapter-nightly";

// Cookie Chain is SVM/Solana-compatible, so the standard wallet-adapter
// stack works as-is — we just point the connection at Cookie Chain's RPC
// and register Nightly, the chain's officially supported wallet.
const COOKIE_CHAIN_RPC =
  process.env.NEXT_PUBLIC_COOKIE_CHAIN_RPC || "https://rpc.cookiescan.io";

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(() => [new NightlyWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={COOKIE_CHAIN_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
