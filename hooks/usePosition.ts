"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { decodePosition, PositionAccount, positionPda } from "../lib/program";

const POLL_MS = 4000;

export function usePosition(market: import("@solana/web3.js").PublicKey | null) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [position, setPosition] = useState<PositionAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!market || !publicKey) {
      setPosition(null);
      setLoading(false);
      return;
    }
    const [pda] = positionPda(market, publicKey);
    let cancelled = false;

    async function poll() {
      try {
        const info = await connection.getAccountInfo(pda);
        if (cancelled) return;
        setPosition(info ? decodePosition(info.data) : null);
      } catch (e) {
        console.error("Failed to fetch position", e);
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
  }, [connection, market, publicKey]);

  return { position, loading };
}
