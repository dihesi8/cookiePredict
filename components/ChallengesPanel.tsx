"use client";

import { FC, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  acceptChallengeIx,
  cancelChallengeIx,
  createChallengeIx,
  decodeMarket,
  MarketAccount,
  settleChallengeIx,
} from "../lib/program";
import { useChallenges, ChallengeRow } from "../hooks/useChallenges";
import { useAllProfiles } from "../hooks/useAllProfiles";

const LAMPORTS_PER_COOK = 1_000_000_000n;

function shortAddr(base58: string) {
  return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
}

async function sendIx(connection: any, publicKey: PublicKey, sendTransaction: any, ix: any) {
  const tx = new Transaction().add(ix);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = publicKey;
  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
  return sig;
}

const ChallengeItem: FC<{
  row: ChallengeRow;
  question: string;
  displayName: (pk: PublicKey) => string;
  onChanged: () => void;
}> = ({ row, question, displayName, onChanged }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { pubkey, account } = row;
  const [market, setMarket] = useState<MarketAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    connection.getAccountInfo(account.market).then((info) => {
      if (!cancelled && info) setMarket(decodeMarket(info.data));
    });
    return () => {
      cancelled = true;
    };
  }, [connection, account.market]);

  if (!publicKey) return null;
  const isCreator = publicKey.equals(account.creator);
  const isRecipient = publicKey.equals(account.recipient);
  const amountCook = Number(account.amount) / 1e9;

  const canAccept = isRecipient && account.status === "PendingAccept";
  const canCancel = isCreator && account.status === "PendingAccept";
  const resolved = market?.status === "Resolved" && market.outcome !== null;
  const winner =
    resolved && market
      ? account.creatorSide === market.outcome
        ? account.creator
        : account.recipient
      : null;
  const canSettle = account.status === "Accepted" && resolved && winner;

  async function act(fn: () => Promise<any>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onChanged();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Transaction failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{question}</div>
        <span
          className={`tag ${
            account.status === "PendingAccept"
              ? "tag-open"
              : account.status === "Accepted"
              ? "tag-open"
              : account.status === "Settled"
              ? "tag-won"
              : "tag-lost"
          }`}
        >
          {account.status}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>
        {displayName(account.creator)} ({account.creatorSide ? "YES" : "NO"}) vs{" "}
        {displayName(account.recipient)} ({!account.creatorSide ? "YES" : "NO"}) - {amountCook.toFixed(2)} COOK each
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {canAccept && (
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() =>
              act(() => sendIx(connection, publicKey, sendTransaction, acceptChallengeIx(publicKey, pubkey)))
            }
          >
            {busy ? "..." : "Accept"}
          </button>
        )}
        {canCancel && (
          <button
            className="btn btn-ghost"
            disabled={busy}
            onClick={() =>
              act(() => sendIx(connection, publicKey, sendTransaction, cancelChallengeIx(publicKey, pubkey)))
            }
          >
            {busy ? "..." : "Cancel"}
          </button>
        )}
        {canSettle && winner && (
          <button
            className="btn btn-gold"
            disabled={busy}
            onClick={() =>
              act(() =>
                sendIx(connection, publicKey, sendTransaction, settleChallengeIx(winner, account.market, pubkey))
              )
            }
          >
            {busy ? "..." : `Settle (${publicKey.equals(winner) ? "you won" : displayName(winner) + " won"})`}
          </button>
        )}
      </div>
      {error && <div className="status-line status-error">{error}</div>}
    </div>
  );
};

export const ChallengesPanel: FC<{ marketId: bigint; marketAddress: PublicKey; question: string }> = ({
  marketAddress,
  question,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { challenges, loading } = useChallenges();
  const { resolveNickname, nicknameFor } = useAllProfiles();

  function displayName(pk: PublicKey) {
    return nicknameFor(pk) || shortAddr(pk.toBase58());
  }

  const [recipient, setRecipient] = useState("");
  const [side, setSide] = useState(true);
  const [amount, setAmount] = useState("1");
  const [days, setDays] = useState("3");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function create() {
    if (!publicKey) return;
    setError(null);

    let recipientKey: PublicKey | null = resolveNickname(recipient);
    if (!recipientKey) {
      try {
        recipientKey = new PublicKey(recipient.trim());
      } catch {
        setError("Enter a known nickname or a valid wallet address");
        return;
      }
    }

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }

    setCreating(true);
    try {
      const lamports = BigInt(Math.round(amountNum * Number(LAMPORTS_PER_COOK)));
      const expiryTs = BigInt(Math.floor(Date.now() / 1000) + Number(days) * 86400);
      const ix = createChallengeIx(publicKey, recipientKey, marketAddress, side, lamports, expiryTs);
      await sendIx(connection, publicKey, sendTransaction, ix);
      setRecipient("");
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to create challenge");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Challenge a friend: {question}</div>

        <label className="field-label">Recipient (nickname or wallet address)</label>
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="field" placeholder="nickname or address" />

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label className="field-label">Your side</label>
            <select value={side ? "yes" : "no"} onChange={(e) => setSide(e.target.value === "yes")} className="field" style={{ marginBottom: 0 }}>
              <option value="yes">YES</option>
              <option value="no">NO</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="field-label">Stake (COOK)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="field" style={{ marginBottom: 0 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="field-label">Expires (days)</label>
            <input value={days} onChange={(e) => setDays(e.target.value)} className="field" style={{ marginBottom: 0 }} />
          </div>
        </div>

        <button onClick={create} disabled={!connected || creating} className="btn btn-primary" style={{ width: "100%" }}>
          {creating ? "Creating..." : "Create Challenge"}
        </button>
        {error && <div className="status-line status-error">{error}</div>}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 60 }} />
      ) : challenges.length === 0 ? (
        <div className="empty-note">No challenges yet. Create one above.</div>
      ) : (
        challenges.map((row) => (
          <ChallengeItem
            key={row.pubkey.toBase58() + refreshKey}
            row={row}
            question={question}
            displayName={displayName}
            onChanged={() => setRefreshKey((k) => k + 1)}
          />
        ))
      )}
    </div>
  );
};
