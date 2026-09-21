"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getProfile, UserProfileAccount } from "../lib/program";

export function useMyProfile() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfileAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!publicKey) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getProfile(connection, publicKey)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((e) => console.error("Failed to fetch profile", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey, refreshKey]);

  return { profile, loading, refresh: () => setRefreshKey((k) => k + 1) };
}
