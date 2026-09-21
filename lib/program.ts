import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { COOKIEPREDICT_PROGRAM_ID, IDL } from "./idl";
import { BinaryReader, BinaryWriter } from "./borsh";

export const PROGRAM_ID = new PublicKey(COOKIEPREDICT_PROGRAM_ID);

const ix = (name: string) =>
  IDL.instructions.find((i) => i.name === name)!;

// ---------- PDAs ----------

export function marketPda(marketId: bigint): [PublicKey, number] {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(marketId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), idBuf],
    PROGRAM_ID
  );
}

export function positionPda(
  market: PublicKey,
  user: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), market.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}

export function challengePda(
  market: PublicKey,
  creator: PublicKey,
  recipient: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("challenge"), market.toBuffer(), creator.toBuffer(), recipient.toBuffer()],
    PROGRAM_ID
  );
}

export function profilePda(user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("profile"), user.toBuffer()], PROGRAM_ID);
}

// ---------- Instruction builders ----------

export function createMarketIx(
  authority: PublicKey,
  marketId: bigint,
  closeTs: bigint,
  resolveTs: bigint
): TransactionInstruction {
  const [market] = marketPda(marketId);
  const data = new BinaryWriter()
    .bytes(Buffer.from(ix("createMarket").discriminator))
    .u64(marketId)
    .i64(closeTs)
    .i64(resolveTs)
    .toBuffer();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: market, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function enterPositionIx(
  user: PublicKey,
  market: PublicKey,
  side: boolean,
  amountLamports: bigint
): TransactionInstruction {
  const [position] = positionPda(market, user);
  const data = new BinaryWriter()
    .bytes(Buffer.from(ix("enterPosition").discriminator))
    .bool(side)
    .u64(amountLamports)
    .toBuffer();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: market, isSigner: false, isWritable: true },
      { pubkey: position, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function resolveMarketIx(
  authority: PublicKey,
  market: PublicKey,
  outcome: boolean
): TransactionInstruction {
  const data = new BinaryWriter()
    .bytes(Buffer.from(ix("resolveMarket").discriminator))
    .bool(outcome)
    .toBuffer();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: market, isSigner: false, isWritable: true },
    ],
    data,
  });
}

export function claimWinningsIx(
  user: PublicKey,
  market: PublicKey
): TransactionInstruction {
  const [position] = positionPda(market, user);
  const data = Buffer.from(ix("claimWinnings").discriminator);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: market, isSigner: false, isWritable: true },
      { pubkey: position, isSigner: false, isWritable: true },
    ],
    data,
  });
}

export function createChallengeIx(
  creator: PublicKey,
  recipient: PublicKey,
  market: PublicKey,
  creatorSide: boolean,
  amountLamports: bigint,
  expiryTs: bigint
): TransactionInstruction {
  const [challenge] = challengePda(market, creator, recipient);
  const data = new BinaryWriter()
    .bytes(Buffer.from(ix("createChallenge").discriminator))
    .bool(creatorSide)
    .u64(amountLamports)
    .i64(expiryTs)
    .toBuffer();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: recipient, isSigner: false, isWritable: false },
      { pubkey: market, isSigner: false, isWritable: false },
      { pubkey: challenge, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function acceptChallengeIx(
  recipient: PublicKey,
  challenge: PublicKey
): TransactionInstruction {
  const data = Buffer.from(ix("acceptChallenge").discriminator);
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: recipient, isSigner: true, isWritable: true },
      { pubkey: challenge, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function cancelChallengeIx(
  creator: PublicKey,
  challenge: PublicKey
): TransactionInstruction {
  const data = Buffer.from(ix("cancelChallenge").discriminator);
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: challenge, isSigner: false, isWritable: true },
    ],
    data,
  });
}

export function settleChallengeIx(
  winner: PublicKey,
  market: PublicKey,
  challenge: PublicKey
): TransactionInstruction {
  const data = Buffer.from(ix("settleChallenge").discriminator);
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: winner, isSigner: false, isWritable: true },
      { pubkey: market, isSigner: false, isWritable: false },
      { pubkey: challenge, isSigner: false, isWritable: true },
    ],
    data,
  });
}

export function createProfileIx(
  user: PublicKey,
  nickname: string,
  pfpUrl: string
): TransactionInstruction {
  const [profile] = profilePda(user);
  const data = new BinaryWriter()
    .bytes(Buffer.from(ix("createProfile").discriminator))
    .string(nickname)
    .string(pfpUrl)
    .toBuffer();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: profile, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function updateProfileIx(
  user: PublicKey,
  nickname: string,
  pfpUrl: string
): TransactionInstruction {
  const [profile] = profilePda(user);
  const data = new BinaryWriter()
    .bytes(Buffer.from(ix("updateProfile").discriminator))
    .string(nickname)
    .string(pfpUrl)
    .toBuffer();

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: user, isSigner: true, isWritable: false },
      { pubkey: profile, isSigner: false, isWritable: true },
    ],
    data,
  });
}

// ---------- Account decoders ----------
// Layout matches the #[account] structs in lib.rs field-for-field.
// The 8-byte account discriminator is skipped at offset 0.

export type MarketStatus = "Open" | "Closed" | "Resolved" | "Cancelled";
const STATUS_NAMES: MarketStatus[] = ["Open", "Closed", "Resolved", "Cancelled"];

export interface MarketAccount {
  authority: PublicKey;
  marketId: bigint;
  closeTs: bigint;
  resolveTs: bigint;
  status: MarketStatus;
  outcome: boolean | null;
  yesPool: bigint;
  noPool: bigint;
  bump: number;
}

export function decodeMarket(data: Buffer): MarketAccount {
  const r = new BinaryReader(data).skip(8); // discriminator
  const authority = new PublicKey(r.pubkeyBytes());
  const marketId = r.u64();
  const closeTs = r.i64();
  const resolveTs = r.i64();
  const status = STATUS_NAMES[r.u8()] ?? "Open";
  const outcome = r.optionBool();
  const yesPool = r.u64();
  const noPool = r.u64();
  const bump = r.u8();
  return { authority, marketId, closeTs, resolveTs, status, outcome, yesPool, noPool, bump };
}

export interface PositionAccount {
  market: PublicKey;
  user: PublicKey;
  side: boolean;
  amount: bigint;
  claimed: boolean;
  bump: number;
}

export function decodePosition(data: Buffer): PositionAccount {
  const r = new BinaryReader(data).skip(8); // discriminator
  const market = new PublicKey(r.pubkeyBytes());
  const user = new PublicKey(r.pubkeyBytes());
  const side = r.bool();
  const amount = r.u64();
  const claimed = r.bool();
  const bump = r.u8();
  return { market, user, side, amount, claimed, bump };
}

// user field starts right after the 8-byte discriminator + 32-byte market pubkey
const POSITION_USER_OFFSET = 8 + 32;

export type ChallengeStatus = "PendingAccept" | "Accepted" | "Settled" | "Cancelled";
const CHALLENGE_STATUS_NAMES: ChallengeStatus[] = [
  "PendingAccept",
  "Accepted",
  "Settled",
  "Cancelled",
];

export interface ChallengeAccount {
  market: PublicKey;
  creator: PublicKey;
  recipient: PublicKey;
  creatorSide: boolean;
  amount: bigint;
  status: ChallengeStatus;
  expiryTs: bigint;
  bump: number;
}

export function decodeChallenge(data: Buffer): ChallengeAccount {
  const r = new BinaryReader(data).skip(8);
  const market = new PublicKey(r.pubkeyBytes());
  const creator = new PublicKey(r.pubkeyBytes());
  const recipient = new PublicKey(r.pubkeyBytes());
  const creatorSide = r.bool();
  const amount = r.u64();
  const status = CHALLENGE_STATUS_NAMES[r.u8()] ?? "PendingAccept";
  const expiryTs = r.i64();
  const bump = r.u8();
  return { market, creator, recipient, creatorSide, amount, status, expiryTs, bump };
}

// creator field: disc(8) + market(32); recipient field: + creator(32)
const CHALLENGE_CREATOR_OFFSET = 8 + 32;
const CHALLENGE_RECIPIENT_OFFSET = 8 + 32 + 32;

export async function getUserChallenges(
  connection: Connection,
  user: PublicKey
): Promise<{ pubkey: PublicKey; account: ChallengeAccount }[]> {
  const discBytes = bs58Encode(Buffer.from(IDL.accounts[2].discriminator));

  const [asCreator, asRecipient] = await Promise.all([
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        { memcmp: { offset: 0, bytes: discBytes } },
        { memcmp: { offset: CHALLENGE_CREATOR_OFFSET, bytes: user.toBase58() } },
      ],
    }),
    connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        { memcmp: { offset: 0, bytes: discBytes } },
        { memcmp: { offset: CHALLENGE_RECIPIENT_OFFSET, bytes: user.toBase58() } },
      ],
    }),
  ]);

  const seen = new Set<string>();
  const results: { pubkey: PublicKey; account: ChallengeAccount }[] = [];
  for (const a of [...asCreator, ...asRecipient]) {
    const key = a.pubkey.toBase58();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ pubkey: a.pubkey, account: decodeChallenge(a.account.data) });
  }
  return results;
}

export async function getUserPositions(
  connection: Connection,
  user: PublicKey
): Promise<{ pubkey: PublicKey; account: PositionAccount }[]> {
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: bs58Encode(Buffer.from(IDL.accounts[1].discriminator)) } },
      { memcmp: { offset: POSITION_USER_OFFSET, bytes: user.toBase58() } },
    ],
  });
  return accounts.map((a) => ({ pubkey: a.pubkey, account: decodePosition(a.account.data) }));
}

export async function getAllPositions(
  connection: Connection
): Promise<{ pubkey: PublicKey; account: PositionAccount }[]> {
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: bs58Encode(Buffer.from(IDL.accounts[1].discriminator)) } },
    ],
  });
  return accounts.map((a) => ({ pubkey: a.pubkey, account: decodePosition(a.account.data) }));
}

// Minimal base58 encoder for the 8-byte discriminator filter (avoids
// pulling in a bs58 dependency for one call site).
function bs58Encode(buf: Buffer): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let digits = [0];
  for (const byte of buf) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = "";
  for (let k = 0; buf[k] === 0 && k < buf.length - 1; k++) result += ALPHABET[0];
  for (let q = digits.length - 1; q >= 0; q--) result += ALPHABET[digits[q]];
  return result;
}

export interface UserProfileAccount {
  owner: PublicKey;
  nickname: string;
  pfpUrl: string;
  bump: number;
}

export function decodeUserProfile(data: Buffer): UserProfileAccount {
  const r = new BinaryReader(data).skip(8);
  const owner = new PublicKey(r.pubkeyBytes());
  const nickname = r.string();
  const pfpUrl = r.string();
  const bump = r.u8();
  return { owner, nickname, pfpUrl, bump };
}

export async function getProfile(
  connection: Connection,
  user: PublicKey
): Promise<UserProfileAccount | null> {
  const [pda] = profilePda(user);
  const info = await connection.getAccountInfo(pda);
  return info ? decodeUserProfile(info.data) : null;
}

export async function getAllProfiles(
  connection: Connection
): Promise<{ pubkey: PublicKey; account: UserProfileAccount }[]> {
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: bs58Encode(Buffer.from(IDL.accounts[3].discriminator)) } },
    ],
  });
  return accounts.map((a) => ({ pubkey: a.pubkey, account: decodeUserProfile(a.account.data) }));
}
