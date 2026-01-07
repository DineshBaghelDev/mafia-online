import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mafia Online",
  description: "Play Mafia online with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${manrope.className} bg-background-light dark:bg-background-dark text-slate-50`}>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
