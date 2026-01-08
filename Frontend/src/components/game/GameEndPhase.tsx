'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RoomState } from '@/types';

interface GameEndPhaseProps {
    room: RoomState;
}

export function GameEndPhase({ room }: GameEndPhaseProps) {
    const router = useRouter();
    const winner = room.winner || 'villagers';
    const isMafiaWin = winner === 'mafia';

    return (
        <div className="relative flex flex-col items-center justify-center flex-grow w-full max-w-5xl mx-auto px-4 py-8 h-full overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Center Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]"></div>
                {/* Confetti Particles */}
                <div className="absolute top-10 left-[20%] w-3 h-3 bg-yellow-400 rounded-sm rotate-12 opacity-80"></div>
                <div className="absolute top-20 right-[25%] w-2 h-4 bg-primary rounded-sm -rotate-45 opacity-70"></div>
                <div className="absolute top-40 left-[10%] w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-1/3 right-[15%] w-3 h-3 bg-green-400 rounded-sm rotate-45 opacity-50"></div>
                <div className="absolute top-1/4 left-[30%] w-1.5 h-3 bg-purple-400 rounded-sm rotate-90 opacity-40"></div>
            </div>

            {/* Main Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">
                {/* Victory Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-4xl text-yellow-400">celebration</span>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-white drop-shadow-xl">
                            {isMafiaWin ? 'Mafia Win' : 'Villagers Win'}
                        </h1>
                        <span className="material-symbols-outlined text-4xl text-yellow-400 transform scale-x-[-1]">celebration</span>
                    </div>
                    <p className="text-white/60 text-lg md:text-xl font-medium tracking-wide">
                        {isMafiaWin ? 'The Mafia have taken over the town.' : 'The town has been saved from the Mafia.'}
                    </p>
                </div>

                {/* Main Card: Final Roles */}
                <div className="w-full max-w-lg flex flex-col bg-surface-dark/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-8">
                    {/* Card Header */}
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h2 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                            Final Roles
                        </h2>
                        <div className="text-xs font-bold px-2 py-1 bg-white/10 rounded uppercase text-white/50 tracking-wider">
                            Game Over
                        </div>
                    </div>
                    
                    {/* Scrollable Roles List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {Object.values(room.players).map(player => {
                            const roleColors: Record<string, { bg: string; text: string; icon: string }> = {
                                mafia: { bg: 'bg-red-900/20', text: 'text-primary', icon: 'skull' },
                                detective: { bg: 'bg-blue-900/20', text: 'text-blue-400', icon: 'local_police' },
                                doctor: { bg: 'bg-teal-900/20', text: 'text-teal-400', icon: 'medical_services' },
                                villager: { bg: 'bg-gray-800/20', text: 'text-gray-300', icon: 'person' }
                            };
                            
                            const roleConfig = roleColors[player.role || 'villager'] || roleColors.villager;
                            
                            return (
                                <div key={player.id} className={`flex items-center p-3 rounded-xl ${roleConfig.bg} border border-white/5`}>
                                    <div className={`w-10 h-10 rounded-full ${roleConfig.bg} border border-current flex items-center justify-center mr-3 ${roleConfig.text}`}>
                                        <span className="material-symbols-outlined text-xl">{roleConfig.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold text-sm ${player.isAlive ? 'text-white' : 'text-gray-500 line-through'}`}>
                                            {player.username}
                                        </p>
                                        <p className={`text-xs ${roleConfig.text} uppercase font-bold tracking-wide`}>
                                            {player.role}
                                        </p>
                                    </div>
                                    {!player.isAlive && (
                                        <span className="material-symbols-outlined text-gray-600 text-lg">skull</span>
                                    )}
                                    {player.isAlive && (
                                        <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-lg space-y-3">
                    <button 
                        onClick={() => router.push(`/lobby/${room.code}`)}
                        className="w-full h-14 rounded-xl bg-primary hover:bg-[#ff4d5a] text-white font-bold text-lg tracking-wide transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        PLAY AGAIN
                    </button>
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full h-14 rounded-xl border border-white/10 hover:bg-white/10 text-white font-bold text-lg tracking-wide transition-all"
                    >
                        LEAVE GAME
                    </button>
                </div>
            </div>
        </div>
    );
}