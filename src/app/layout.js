import "./globals.css";

// Fonts
import { Geist, Geist_Mono } from "next/font/google";

// Providers
import QueryProvider from "@/Providers/QueryProvider";

// Import the Geist Sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Import the Geist Mono font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Layout for the entire app
export const metadata = {
  title: "Asset Tracker",
  description: "A simple asset tracker app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
