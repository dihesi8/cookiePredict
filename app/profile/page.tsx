"use client";

import dynamic from "next/dynamic";

const NavBar = dynamic(() => import("../../components/NavBar").then((m) => m.NavBar), { ssr: false });
const ProfileEditForm = dynamic(() => import("../../components/ProfileEditForm").then((m) => m.ProfileEditForm), { ssr: false });
const ProfileBody = dynamic(() => import("../../components/ProfileBody").then((m) => m.ProfileBody), { ssr: false });

export default function ProfilePage() {
  return (
    <>
      <NavBar />
      <main className="page">
        <div className="section-title">Your Profile</div>
        <ProfileEditForm />
        <ProfileBody />
      </main>
    </>
  );
}
