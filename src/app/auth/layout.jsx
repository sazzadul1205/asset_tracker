// Auth/layout.js
"use client";

// Next Auth Components
import { SessionProvider } from "next-auth/react";


// Auth Layout
export default function AuthLayout({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
