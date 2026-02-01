'use client';

import React from 'react';
import { Role } from '@/types';

interface RoleRevealPhaseProps {
    role?: Role;
    onReady?: () => void;
}

export function RoleRevealPhase({ role = 'villager', onReady }: RoleRevealPhaseProps) {
    const roleConfig: Record<Role, { primaryColor: string; icon: string; title: string; description: string }> = {
        mafia: {
            primaryColor: '#E63743',
            icon: 'skull',
            title: 'MAFIA',
            description: 'Eliminate the villagers without getting caught by the detective.'
        },
        detective: {
            primaryColor: '#3B82F6',
            icon: 'local_police',
            title: 'SHERIFF',
            description: 'Investigate players to uncover the Mafia. Protect the town with your badge.'
        },
        doctor: {
            primaryColor: '#20E0D0',
            icon: 'medical_services',
            title: 'DOCTOR',
            description: 'Heal players and protect them from the Mafia.'
        },
        villager: {
            primaryColor: '#2BEE6C',
            icon: 'cottage',
            title: 'VILLAGER',
            description: 'Uncover the Mafia and vote them out. Your strength lies in numbers.'
        }
    };

    const config = roleConfig[role] || roleConfig.villager;
    const isVillager = role === 'villager';
    const isSheriff = role === 'detective';
    const isDoctor = role === 'doctor';
    const isMafia = role === 'mafia';

    return (
        <div className="bg-background-dark min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-white">
            {/* Background Glow Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {isVillager ? (
                    <>
                        <div 
                            className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] aspect-square rounded-full blur-[120px]"
                            style={{ backgroundColor: `${config.primaryColor}0D` }}
                        ></div>
                        <div 
                            className="absolute bottom-[-10%] right-0 w-[40%] aspect-square rounded-full blur-[100px]"
                            style={{ backgroundColor: `${config.primaryColor}05` }}
                        ></div>
                    </>
                ) : (
                    <>
                        <div 
                            className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] aspect-square rounded-full blur-[120px]"
                            style={{ backgroundColor: `${config.primaryColor}1A` }}
                        ></div>
                        <div 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-pulse-glow blur-[100px] opacity-20"
                            style={{ backgroundColor: config.primaryColor }}
                        ></div>
                    </>
                )}
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-[720px] mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[600px]">
                {/* "Your Role" Label */}
                <div className="mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <span className="tracking-[0.3em] text-sm font-bold uppercase text-white/50 border-b border-white/10 pb-4 px-8">
                        Your Role
                    </span>
                </div>

                {/* Icon Card with Glow */}
                <div className="relative group mb-12 animate-fade-in overflow-visible" style={{ animationDelay: '0.2s' }}>
                    {!isVillager && (
                        <div 
                            className="absolute -inset-4 border rounded-full scale-110 opacity-50"
                            style={{ borderColor: `${config.primaryColor}33` }}
                        ></div>
                    )}
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full animate-pulse-glow z-0 blur-2xl"
                        style={{ backgroundColor: isVillager ? config.primaryColor : `${config.primaryColor}4D` }}
                    ></div>
                    <div 
                        className="relative w-48 h-48 rounded-full bg-surface-dark flex items-center justify-center animate-float z-10 transition-all duration-500 ease-out group-hover:scale-105"
                        style={{ 
                            border: `1px solid ${config.primaryColor}66`,
                            boxShadow: `0 0 40px ${config.primaryColor}33`,
                        }}
                    >
                        {isVillager && (
                            <div className="absolute inset-2 rounded-full border border-white/5"></div>
                        )}
                        <span 
                            className="material-symbols-outlined transition-transform duration-500 group-hover:scale-110" 
                            style={{
                                color: config.primaryColor,
                                fontSize: isVillager ? '7rem' : '6rem',
                                fontVariationSettings: isVillager ? "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" : "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48",
                                filter: `drop-shadow(0 0 15px ${config.primaryColor}80)`
                            }}
                        >
                            {config.icon}
                        </span>
                    </div>
                </div>

                {/* Role Title and Description */}
                <div className="text-center space-y-6 max-w-lg mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="space-y-2">
                        <h1 
                            className="text-[56px] font-extrabold tracking-tight leading-none uppercase"
                            style={{
                                color: config.primaryColor,
                                filter: `drop-shadow(0 0 20px ${config.primaryColor}66)`
                            }}
                        >
                            {config.title}
                        </h1>
                        
                        {/* Decorative Divider */}
                        <div 
                            className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-transparent via-current to-transparent"
                            style={{ 
                                color: isVillager ? `${config.primaryColor}80` : config.primaryColor,
                                opacity: isVillager ? 1 : 0.5
                            }}
                        ></div>
                    </div>

                    <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
                        {config.description}
                    </p>
                </div>

                {/* Footer Text */}
                <div className="w-full flex justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="text-white/40 text-sm font-mono animate-pulse">
                        Game starting soon...
                    </div>
                </div>
            </div>
        </div>
    );
}