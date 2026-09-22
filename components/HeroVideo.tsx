"use client";

import { FC, ReactNode } from "react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_030633_1712fc71-4979-4e14-98f9-9f95702ab3da.mp4";

export const HeroVideo: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="hero-full">
    <video src={HERO_VIDEO_URL} autoPlay muted loop playsInline />
    <div className="hero-scrim" />
    <div className="hero-content">{children}</div>
  </div>
);
