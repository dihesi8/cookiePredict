"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { getAllProfiles, UserProfileAccount } from "../lib/program";
import { PublicKey } from "@solana/web3.js";

const POLL_MS = 30000; // profiles change rarely, poll infrequently

export function useAllProfiles() {
  const { connection } = useConnection();
  const [profiles, setProfiles] = useState<{ pubkey: PublicKey; account: UserProfileAccount }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const all = await getAllProfiles(connection);
        if (!cancelled) setProfiles(all);
      } catch (e) {
        console.error("Failed to fetch profiles", e);
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
  }, [connection]);

  function resolveNickname(input: string): PublicKey | null {
    const match = profiles.find((p) => p.account.nickname.toLowerCase() === input.trim().toLowerCase());
    return match ? match.account.owner : null;
  }

  function nicknameFor(owner: PublicKey): string | null {
    const entry = profiles.find((p) => p.account.owner.equals(owner));
    return entry?.account.nickname || null;
  }

  return { profiles, loading, resolveNickname, nicknameFor };
}
