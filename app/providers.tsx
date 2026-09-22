"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
} from "@solana-mobile/wallet-adapter-mobile";

// Cookie Chain is SVM/Solana-compatible, so the standard wallet-adapter
// stack works as-is - we just point the connection at Cookie Chain's RPC.
//
// We don't manually instantiate a Nightly adapter here: Nightly now
// self-registers via the Wallet Standard, so wallet-adapter-react detects
// it automatically. Explicitly adding NightlyWalletAdapter on top of that
// creates two competing entries for the same wallet, which is what caused
// send failures and "nothing pops up" connection issues.
//
// The one adapter we DO register explicitly is Solana Mobile Wallet
// Adapter (MWA), which handles the deep-link handshake into MWA-compatible
// wallet apps (including Nightly's mobile app) from a mobile browser -
// there's no Wallet Standard equivalent for that flow.
export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  const COOKIE_CHAIN_RPC =
    process.env.NEXT_PUBLIC_COOKIE_CHAIN_RPC || "https://rpc.cookiescan.io";

  const wallets = useMemo(() => {
    if (typeof window === "undefined") return [];
    return [
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          name: "CookiePredict",
          uri: window.location.origin,
          icon: "/favicon.svg",
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: "mainnet-beta",
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      }),
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={COOKIE_CHAIN_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
