'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RoomState } from '@/types';

interface GameEndPhaseProps {
    room: RoomState;
}

export function GameEndPhase({ room }: GameEndPhaseProps) {
    const router = useRouter();
    const winner = room.winner || 'villagers'; // Default to villagers if undefined
    const isMafiaWin = winner === 'mafia';

    const color = isMafiaWin ? 'text-primary' : 'text-blue-500';
    const bgColor = isMafiaWin ? 'bg-primary' : 'bg-blue-500';
    const bgGradient = isMafiaWin ? 'from-red-900/50' : 'from-blue-900/50';

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-fade-in relative z-10 w-full">
            {/* Background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} to-background-dark pointer-events-none -z-10`}></div>

            <div className="mb-8">
                 <span className={`material-symbols-outlined text-[120px] ${color} drop-shadow-[0_0_30px_currentColor] animate-bounce`}>
                    {isMafiaWin ? 'skull' : 'verified'}
                 </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2 drop-shadow-xl">
                {isMafiaWin ? 'Mafia' : 'Villagers'}
            </h1>
            <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-widest mb-12 ${color}`}>
                Victory
            </h2>
            
            <div className="w-full max-w-sm space-y-4">
                <button 
                    onClick={() => router.push('/')}
                    className="w-full h-14 rounded-xl border border-white/10 hover:bg-white/10 text-white font-bold tracking-wide transition-all"
                >
                    RETURN TO HOME
                </button>
            </div>
        </div>
    );
}