"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ChallengeAccount, getUserChallenges } from "../lib/program";
import { PublicKey } from "@solana/web3.js";

const POLL_MS = 6000;

export interface ChallengeRow {
  pubkey: PublicKey;
  account: ChallengeAccount;
}

export function useChallenges() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setChallenges([]);
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function poll() {
      try {
        const rows = await getUserChallenges(connection, publicKey!);
        if (!cancelled) setChallenges(rows);
      } catch (e) {
        console.error("Failed to fetch challenges", e);
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
  }, [connection, publicKey]);

  return { challenges, loading };
}
