"use client";

import { FC } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/markets", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
];

export const NavBar: FC = () => (
  <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
    {LINKS.map((l) => (
      <a
        key={l.href}
        href={l.href}
        style={{
          fontSize: 12.5,
          color: "var(--text-dim)",
          padding: "6px 11px",
          borderRadius: 7,
          border: "1px solid var(--border-soft)",
        }}
      >
        {l.label}
      </a>
    ))}
  </div>
);
