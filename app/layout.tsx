import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import BottomNav from "@/components/ButtomNav";
import { SolanaContext } from "./SolanaContext";
import AppWalletProvider from "@/components/AppWalletProvider";

export const metadata: Metadata = {
  title: "SolanaDex",
  description: "Discover and collect animals in the wild!",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-b from-purple-400 to-blue-500 min-h-screen`}
      >
        <main className="pb-16">
          <AppWalletProvider>{children}</AppWalletProvider>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
