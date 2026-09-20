"use client";

import dynamic from "next/dynamic";

const NavBar = dynamic(() => import("../../components/NavBar").then((m) => m.NavBar), { ssr: false });
const ProfileBody = dynamic(() => import("../../components/ProfileBody").then((m) => m.ProfileBody), { ssr: false });

export default function ProfilePage() {
  return (
    <main className="page">
      <NavBar />
      <div className="section-title">Your Profile</div>
      <ProfileBody />
    </main>
  );
}
