"use client";

import { FC, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { User, Pencil } from "lucide-react";
import { createProfileIx, updateProfileIx } from "../lib/program";
import { useMyProfile } from "../hooks/useMyProfile";

export const ProfileEditForm: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { profile, loading, refresh } = useMyProfile();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [pfpUrl, setPfpUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
      setPfpUrl(profile.pfpUrl);
    }
  }, [profile]);

  async function save() {
    if (!publicKey) return;
    if (nickname.trim().length === 0) {
      setError("Nickname can't be empty");
      return;
    }
    if (nickname.length > 32) {
      setError("Nickname must be 32 characters or fewer");
      return;
    }
    if (pfpUrl.length > 200) {
      setError("PFP URL must be 200 characters or fewer");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const ix = profile
        ? updateProfileIx(publicKey, nickname.trim(), pfpUrl.trim())
        : createProfileIx(publicKey, nickname.trim(), pfpUrl.trim());
      const tx = new Transaction().add(ix);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
      setEditing(false);
      refresh();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="skeleton" style={{ height: 70, marginBottom: 16 }} />;

  if (!editing) {
    return (
      <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div className="avatar" style={{ width: 44, height: 44 }}>
          {profile?.pfpUrl ? (
            <img src={profile.pfpUrl} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          ) : (
            <User size={20} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 650 }}>
            {profile?.nickname || (publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : "Not connected")}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
            {profile ? "On-chain profile" : "No nickname set yet"}
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="btn btn-ghost icon-row" style={{ fontSize: 12, padding: "7px 12px" }}>
          <Pencil size={13} /> Edit
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <label className="field-label">Nickname</label>
      <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={32} className="field" placeholder="Your display name" />

      <label className="field-label">PFP URL (optional)</label>
      <input value={pfpUrl} onChange={(e) => setPfpUrl(e.target.value)} maxLength={200} className="field" placeholder="https://..." />

      {pfpUrl && (
        <div className="avatar" style={{ width: 40, height: 40, marginBottom: 12 }}>
          <img src={pfpUrl} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
        </div>
      )}

      <div className="btn-row">
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : profile ? "Update profile" : "Create profile"}
        </button>
        <button onClick={() => setEditing(false)} className="btn btn-ghost">
          Cancel
        </button>
      </div>
      {error && <div className="status-line status-error">{error}</div>}
    </div>
  );
};
