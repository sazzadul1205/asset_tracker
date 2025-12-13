// src/app/layout.jsx
import "./globals.css";

// Fonts
import { Geist, Geist_Mono } from "next/font/google";



// Providers
import SessionWrapper from "./SessionWrapper";
import QueryProvider from "@/Providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Asset Tracker",
  description: "A simple asset tracker app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <SessionWrapper>{children}</SessionWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
