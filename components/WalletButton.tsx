"use client";

import { FC, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";

const BRIDGE_URL = "https://hyperlane.cookiescan.io";
const LOW_BALANCE_THRESHOLD = 0.05; // COOK - below this, nudge toward the bridge

export const WalletButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [rpcOk, setRpcOk] = useState<boolean | null>(null);

  useEffect(() => {
    connection
      .getVersion()
      .then(() => setRpcOk(true))
      .catch(() => setRpcOk(false));
  }, [connection]);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    connection.getBalance(publicKey).then((lamports) => {
      setBalance(lamports / 1e9);
    });
  }, [publicKey, connection]);

  const lowBalance = connected && balance !== null && balance < LOW_BALANCE_THRESHOLD;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <WalletMultiButton />
      <div className="icon-row" style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
        RPC:
        {rpcOk === null ? (
          "checking..."
        ) : rpcOk ? (
          <span className="icon-row" style={{ color: "var(--yes)" }}>
            <CheckCircle2 size={12} /> connected
          </span>
        ) : (
          <span className="icon-row" style={{ color: "var(--no)" }}>
            <XCircle size={12} /> unreachable
          </span>
        )}
      </div>
      {connected && publicKey && (
        <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
          <div>{publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}</div>
          <div>{balance === null ? "..." : `${balance.toFixed(4)} SOL/COOK`}</div>
        </div>
      )}

      {lowBalance && (
        <a
          href={BRIDGE_URL}
          target="_blank"
          rel="noreferrer"
          className="btn btn-gold icon-row"
          style={{ textAlign: "center", textDecoration: "none", fontSize: 12.5, padding: "8px 12px", justifyContent: "center" }}
        >
          Low on gas, bridge SOL to COOK <ArrowUpRight size={13} />
        </a>
      )}
    </div>
  );
};
