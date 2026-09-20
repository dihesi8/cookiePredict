import { PublicKey } from "@solana/web3.js";
import { BinaryReader } from "./borsh";

// Discriminators copied from the real generated target/idl/cookiepredict.json
// (events section) — confirmed matching, not hand-guessed.
const EVENT_DISCRIMINATORS: Record<string, number[]> = {
  MarketCreated: [88, 184, 130, 231, 226, 84, 6, 58],
  MarketResolved: [89, 67, 230, 95, 143, 106, 199, 202],
  PositionEntered: [128, 189, 133, 45, 175, 144, 118, 139],
  WinningsClaimed: [187, 184, 29, 196, 54, 117, 70, 150],
};

export type ProgramEvent =
  | { name: "MarketCreated"; market: PublicKey; marketId: bigint; closeTs: bigint; resolveTs: bigint }
  | { name: "MarketResolved"; market: PublicKey; outcome: boolean }
  | { name: "PositionEntered"; market: PublicKey; user: PublicKey; side: boolean; amount: bigint }
  | { name: "WinningsClaimed"; market: PublicKey; user: PublicKey; amount: bigint };

function matchDiscriminator(data: Buffer): string | null {
  for (const [name, disc] of Object.entries(EVENT_DISCRIMINATORS)) {
    if (data.length >= 8 && disc.every((b, i) => data[i] === b)) return name;
  }
  return null;
}

export function decodeEvent(data: Buffer): ProgramEvent | null {
  const name = matchDiscriminator(data);
  if (!name) return null;
  const r = new BinaryReader(data).skip(8);

  switch (name) {
    case "MarketCreated": {
      const market = new PublicKey(r.pubkeyBytes());
      const marketId = r.u64();
      const closeTs = r.i64();
      const resolveTs = r.i64();
      return { name, market, marketId, closeTs, resolveTs };
    }
    case "MarketResolved": {
      const market = new PublicKey(r.pubkeyBytes());
      const outcome = r.bool();
      return { name, market, outcome };
    }
    case "PositionEntered": {
      const market = new PublicKey(r.pubkeyBytes());
      const user = new PublicKey(r.pubkeyBytes());
      const side = r.bool();
      const amount = r.u64();
      return { name, market, user, side, amount };
    }
    case "WinningsClaimed": {
      const market = new PublicKey(r.pubkeyBytes());
      const user = new PublicKey(r.pubkeyBytes());
      const amount = r.u64();
      return { name, market, user, amount };
    }
    default:
      return null;
  }
}

// Anchor's emit! macro logs events as "Program data: <base64>" via sol_log_data.
export function extractEventsFromLogs(logs: string[]): ProgramEvent[] {
  const events: ProgramEvent[] = [];
  for (const line of logs) {
    const prefix = "Program data: ";
    if (!line.startsWith(prefix)) continue;
    try {
      const buf = Buffer.from(line.slice(prefix.length), "base64");
      const ev = decodeEvent(buf);
      if (ev) events.push(ev);
    } catch {
      // not a decodable event log line — ignore
    }
  }
  return events;
}
