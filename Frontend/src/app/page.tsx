'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (joinCode.length >= 4) {
      router.push(`/lobby/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-20 w-full max-w-5xl mx-auto min-h-screen">
      {/* Noise Texture Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 opacity-5 bg-noise"></div>

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-12 md:mb-16 animate-fade-in-down z-20">
        {/* Icon/Logo Mark */}
        <div className="relative mb-4 group cursor-default">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-text relative z-10 flex items-center gap-1 font-display">
            MAF
            <span className="relative text-primary flex items-center justify-center h-full">
              I
              {/* Stylized Knife overlaying the I */}
              <span className="material-symbols-outlined absolute -top-2 left-1/2 -translate-x-1/2 text-5xl md:text-7xl rotate-180 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-white drop-shadow-[0_0_8px_rgba(230,55,67,0.8)]">
                restaurant
              </span>
            </span>
            A
          </h1>
          {/* Subtle glow behind title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-red-500/50"></div>
          <p className="text-gray-400 tracking-[0.3em] text-sm md:text-base font-medium uppercase font-display">Trust No One.</p>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-red-500/50"></div>
        </div>
      </div>

      {/* Action Stack */}
      <div className="w-full max-w-[420px] flex flex-col gap-4 z-20">
        {/* Primary Action: Play Public */}
        <button
          onClick={() => router.push('/matchmaking')}
          className="group relative w-full h-14 md:h-16 bg-primary hover:bg-[#ff4d5a] text-white rounded-xl font-bold text-lg tracking-wide transition-all duration-300 transform hover:-translate-y-1 shadow-[0_4px_0_rgb(160,20,30)] hover:shadow-[0_6px_0_rgb(160,20,30),0_0_20px_rgba(230,55,67,0.5)] active:translate-y-[2px] active:shadow-[0_2px_0_rgb(160,20,30)] flex items-center justify-between px-6 overflow-hidden font-display"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shimmer"></div>
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined">public</span>
            PLAY PUBLIC GAME
          </span>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>

        {/* Secondary Action: Create Private */}
        <button
          onClick={() => router.push('/create')}
          className="group w-full h-14 md:h-16 bg-[#1a1d24] hover:bg-[#252932] border border-white/5 hover:border-white/10 text-gray-200 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 flex items-center justify-between px-6 hover:shadow-lg font-display"
        >
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">add_box</span>
            CREATE PRIVATE LOBBY
          </span>
          <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">chevron_right</span>
        </button>

        {/* Tertiary Action: Join with Code */}
        <div className="relative group w-full font-display">
          <form onSubmit={handleJoin} className="flex w-full h-14 md:h-16 bg-[#1a1d24] border border-white/5 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all duration-200">
            <div className="pl-5 pr-2 flex items-center justify-center text-gray-500">
              <span className="material-symbols-outlined">vpn_key</span>
            </div>
            <input
              className="flex-1 bg-transparent border-none text-white font-bold tracking-widest placeholder:font-medium placeholder:tracking-normal focus:ring-0 h-full uppercase outline-none"
              maxLength={6}
              placeholder="ENTER CODE"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              className="px-6 h-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm tracking-wider transition-colors border-l border-white/5 hover:text-white"
              type="submit"
            >
              JOIN
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 py-8 text-center mt-auto md:mt-0 font-display">
        <div className="flex items-center justify-center gap-6 md:gap-8 text-sm text-gray-600 font-medium tracking-wide">
          <a className="hover:text-primary transition-colors duration-200 flex items-center gap-1 group" href="#">
            <span className="material-symbols-outlined text-[18px] group-hover:animate-bounce">gavel</span>
            RULES
          </a>
          <span className="w-1 h-1 rounded-full bg-gray-700"></span>
          <a className="hover:text-primary transition-colors duration-200 flex items-center gap-1 group" href="#">
            <span className="material-symbols-outlined text-[18px]">info</span>
            CREDITS
          </a>
        </div>
        <div className="mt-4 text-xs text-gray-800 dark:text-gray-800">
          v2.4.1 © 2023 Mafia Game
        </div>
      </footer>

      {/* Background Gradient Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top glow */}
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-gradient-to-b from-primary/5 to-transparent blur-[120px] rounded-full opacity-40"></div>
        {/* Bottom glow */}
        <div className="absolute -bottom-[10%] left-1/4 w-[60%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full opacity-30"></div>
      </div>
    </main>
  );
}
