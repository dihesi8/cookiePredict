"use client";

import { useEffect, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PROGRAM_ID } from "../lib/program";
import { extractEventsFromLogs, ProgramEvent } from "../lib/events";

const POLL_MS = 10000;
const MAX_ITEMS = 15;
const MAX_FETCH_PER_POLL = 5; // spread a large backlog across cycles instead of bursting

export interface FeedItem {
  signature: string;
  blockTime: number | null;
  event: ProgramEvent;
}

export function useActivityFeed() {
  const { connection } = useConnection();
  const [items, setItems] = useState<FeedItem[]>([]);
  const seenSigs = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const sigs = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: MAX_ITEMS });
        const fresh = sigs.filter((s) => !seenSigs.current.has(s.signature)).slice(0, MAX_FETCH_PER_POLL);
        if (fresh.length === 0) return;

        const newItems: FeedItem[] = [];
        for (const s of fresh) {
          seenSigs.current.add(s.signature);
          const tx = await connection.getTransaction(s.signature, {
            maxSupportedTransactionVersion: 0,
          });
          const logs = tx?.meta?.logMessages ?? [];
          for (const event of extractEventsFromLogs(logs)) {
            newItems.push({ signature: s.signature, blockTime: s.blockTime ?? null, event });
          }
        }

        if (!cancelled && newItems.length > 0) {
          setItems((prev) => [...newItems, ...prev].slice(0, MAX_ITEMS));
        }
      } catch (e) {
        console.error("Failed to poll activity feed", e);
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [connection]);

  return items;
}
