import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "highlight.js/styles/github-dark.css";
import "./globals.css";
import "./marketing.css";
import SiteFx from "@/components/SiteFx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XSkinny AI scripter — AI na Roblox skripty",
  description:
    "AI ktoré ti napíše a vysvetlí Roblox (Luau) skripty. Popíš čo chceš a dostaneš hotový kód aj s návodom kam ho dať. Od XSkinny.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteFx />
        {children}
      </body>
    </html>
  );
}
