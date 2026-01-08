'use client';

import React from 'react';
import { Role } from '@/types';

interface RoleRevealPhaseProps {
    role?: Role;
    onReady?: () => void;
}

export function RoleRevealPhase({ role = 'villager', onReady }: RoleRevealPhaseProps) {
    const roleConfig: Record<Role, { color: string; bgColor: string; icon: string; title: string; description: string }> = {
        mafia: {
            color: 'text-primary',
            bgColor: 'bg-primary',
            icon: 'skull',
            title: 'MAFIA',
            description: 'Eliminate the villagers without getting caught by the detective.'
        },
        detective: {
            color: 'text-blue-500', 
            bgColor: 'bg-blue-500',
            icon: 'local_police',
            title: 'SHERIFF',
            description: 'Investigate players to uncover the Mafia. Protect the town with your badge.'
        },
        doctor: {
            color: 'text-[#20e0d0]',
            bgColor: 'bg-[#20e0d0]',
            icon: 'medical_services',
            title: 'DOCTOR',
            description: 'Save one player each night from elimination. Be the guardian angel.'
        },
        villager: {
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500',
            icon: 'person',
            title: 'VILLAGER',
            description: 'Work with others to find and eliminate the Mafia during the day.'
        }
    };

    const config = roleConfig[role] || roleConfig.villager;

    return (
        <div className="flex flex-col h-full w-full max-w-[720px] mx-auto px-6 py-12 justify-between items-center relative z-10 min-h-screen">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-background-dark opacity-80`}></div>
                <div className="absolute inset-0 opacity-[0.03] bg-noise"></div>
            </div>

            {/* Header Section */}
            <header className="relative z-10 w-full flex justify-center pt-8 md:pt-4 animate-fade-in">
                <span className="text-white/50 tracking-[0.3em] text-sm font-bold uppercase border-b border-white/10 pb-4 px-8">Your Role</span>
            </header>

            {/* Role Reveal Card (Centered) */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full gap-10">
                {/* Icon Container with Glow */}
                <div className="relative group animate-float">
                    {/* Outer Glow Ring */}
                    <div className={`absolute inset-0 rounded-full ${config.bgColor} opacity-20 blur-2xl transform group-hover:scale-110 transition-transform duration-700`}></div>
                    {/* Icon Circle */}
                    <div className={`relative flex items-center justify-center w-48 h-48 bg-background-dark border-[3px] ${config.color} border-current rounded-full shadow-[0_0_40px_rgba(230,55,67,0.2)] animate-pulse-glow`}>
                        <span className={`material-symbols-outlined ${config.color} text-[6rem] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`} style={{fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 48"}}>
                            {config.icon}
                        </span>
                    </div>
                </div>

                {/* Role Text Info */}
                <div className="text-center flex flex-col gap-6 max-w-lg">
                    <h1 className={`text-white text-[56px] md:text-6xl font-black tracking-tight leading-none drop-shadow-xl uppercase`}>
                        <span className={config.color}>{config.title.charAt(0)}</span><span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60">{config.title.slice(1)}</span>
                    </h1>
                    {/* Separator Line */}
                    <div className={`h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent mx-auto rounded-full opacity-60 ${config.color}`}></div>
                    <div className="px-4">
                        <p className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto">
                            {config.description}
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full flex justify-center pb-8 md:pb-4">
                <div className="text-white/40 text-sm font-mono animate-pulse">
                    Game starting soon...
                </div>
            </footer>
        </div>
    );
}