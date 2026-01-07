'use client';

import React from 'react';
import { Role } from '@/types';

interface RoleRevealPhaseProps {
    role?: Role;
    onReady?: () => void;
}

export function RoleRevealPhase({ role = 'villager', onReady }: RoleRevealPhaseProps) {
    const roleConfig: Record<Role, { color: string; icon: string; title: string; description: string; shadow: string }> = {
        mafia: {
            color: 'text-primary', // Red
            icon: 'skull',
            title: 'Mafia',
            description: 'Eliminate the villagers without getting caught by the sheriff.',
            shadow: 'shadow-primary/50'
        },
        sheriff: {
            color: 'text-blue-500', 
            icon: 'local_police',
            title: 'Sheriff',
            description: 'Investigate players at night to find the Mafia.',
            shadow: 'shadow-blue-500/50'
        },
        doctor: {
            color: 'text-green-500',
            icon: 'medical_services',
            title: 'Doctor',
            description: 'Protect one player each night from elimination.',
            shadow: 'shadow-green-500/50'
        },
        villager: {
            color: 'text-yellow-500',
            icon: 'person',
            title: 'Villager',
            description: 'Find the Mafia and vote them out during the day.',
            shadow: 'shadow-yellow-500/50'
        }
    };

    const config = roleConfig[role] || roleConfig.villager;

    return (
        <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto p-6 md:p-10 justify-between items-center relative z-10">
             {/* Background Effects */}
             <div className="absolute inset-0 pointer-events-none z-0">
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-${config.color.replace('text-', '')}/10 via-transparent to-transparent opacity-80`}></div>
            </div>

            {/* Header */}
            <header className="w-full flex justify-center pt-8 md:pt-12 animate-fade-in">
                <p className="text-white/60 text-sm md:text-base font-bold tracking-[0.2em] uppercase">Your Role</p>
            </header>

            {/* Role Card */}
            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg gap-8 md:gap-12 pb-20">
                <div className="relative group">
                    <div className={`absolute inset-0 rounded-full blur-2xl transform group-hover:scale-110 transition-transform duration-700 bg-current opacity-20 ${config.color.replace('text-', 'bg-')}`}></div>
                    <div className={`relative flex items-center justify-center w-40 h-40 md:w-56 md:h-56 bg-background-dark border-[3px] rounded-full animate-pulse-glow ${config.color} border-current`}>
                         <span className={`material-symbols-outlined text-[6rem] md:text-[8rem] drop-shadow-xl ${config.color}`}>
                             {config.icon}
                         </span>
                    </div>
                </div>

                <div className="text-center flex flex-col gap-4 animate-float">
                    <h1 className="text-white text-6xl md:text-8xl font-black tracking-[-0.02em] uppercase leading-none drop-shadow-xl">
                        <span className={config.color}>{config.title.charAt(0)}</span>{config.title.slice(1)}
                    </h1>
                     <div className={`h-1 w-24 bg-gradient-to-r from-transparent via-current to-transparent mx-auto rounded-full opacity-60 ${config.color.replace('text-', 'bg-')}`}></div>
                     <div className="px-4">
                        <p className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-sm mx-auto">
                            {config.description}
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full flex justify-center pb-8 md:pb-12 z-20">
                <div className="text-white/40 text-sm font-mono animate-pulse">
                     Waiting for game to proceed...
                </div>
            </footer>
        </div>
    );
}