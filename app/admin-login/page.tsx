"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Incorrect password");
        return;
      }
      window.location.href = "/admin";
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page" style={{ maxWidth: 360, paddingTop: 100 }}>
      <div className="card">
        <div className="icon-row" style={{ marginBottom: 14 }}>
          <Lock size={16} color="var(--text-dim)" />
          <span style={{ fontSize: 13, fontWeight: 650 }}>Admin access</span>
        </div>
        <form onSubmit={submit}>
          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoFocus
          />
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: "100%" }}>
            {submitting ? "Checking..." : "Enter"}
          </button>
          {error && <div className="status-line status-error">{error}</div>}
        </form>
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 650, marginTop: 30 }}>Password for testing 12345</h3>
      <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 10 }}>
        This gate only hides the admin page from casual visitors. The real protection is
        on-chain: only the wallet that seeded a market can resolve it, enforced by the
        program itself regardless of who can see this page.
      </p>
    </main>
  );
}
