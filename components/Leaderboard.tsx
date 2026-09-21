"use client";

import { FC } from "react";
import { Flame, User } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useAllProfiles } from "../hooks/useAllProfiles";

function shortAddr(base58: string) {
  return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
}

export const Leaderboard: FC = () => {
  const { entries, loading } = useLeaderboard();
  const { profiles } = useAllProfiles();
  const { publicKey } = useWallet();

  if (loading) return <div className="skeleton" style={{ height: 160 }} />;
  if (entries.length === 0) {
    return <div className="empty-note">No resolved positions yet. The leaderboard fills in once markets resolve.</div>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Trader</th>
            <th>Streak</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const p = profiles.find((x) => x.account.owner.equals(e.user));
            const isYou = publicKey?.equals(e.user);
            return (
              <tr key={e.user.toBase58()} className={isYou ? "is-you" : ""}>
                <td style={{ fontWeight: 700 }}>#{i + 1}</td>
                <td>
                  <div className="icon-row">
                    <div className="avatar" style={{ width: 22, height: 22 }}>
                      {p?.account.pfpUrl ? (
                        <img
                          src={p.account.pfpUrl}
                          alt=""
                          onError={(ev) => ((ev.target as HTMLImageElement).style.display = "none")}
                        />
                      ) : (
                        <User size={11} />
                      )}
                    </div>
                    <span style={{ fontWeight: 600 }}>{p?.account.nickname || shortAddr(e.user.toBase58())}</span>
                    {isYou && (
                      <span className="tag tag-open" style={{ fontSize: 9.5, padding: "1.5px 6px" }}>
                        YOU
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="icon-row" style={{ color: "var(--gold)", fontWeight: 700 }}>
                    <Flame size={13} />
                    {e.streak}
                  </span>
                </td>
                <td style={{ color: "var(--text-dim)" }}>
                  {e.wins}W-{e.losses}L
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
