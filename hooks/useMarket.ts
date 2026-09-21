"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { decodeMarket, MarketAccount, marketPda } from "../lib/program";

const POLL_MS = 12000;

export function useMarket(marketId: bigint) {
  const { connection } = useConnection();
  const [market, setMarket] = useState<MarketAccount | null>(null);
  const [marketAddress, setMarketAddress] = useState<PublicKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const [pda] = marketPda(marketId);
    setMarketAddress(pda);
    let cancelled = false;

    async function poll() {
      try {
        const info = await connection.getAccountInfo(pda);
        if (cancelled) return;
        setMarket(info ? decodeMarket(info.data) : null);
      } catch (e) {
        console.error("Failed to fetch market", e);
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
  }, [connection, marketId]);

  return { market, marketAddress, loading };
}
