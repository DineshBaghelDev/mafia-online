import React from 'react';
import { useRouter } from 'next/navigation';

interface GameHeaderProps {
    roomCode?: string;
    phase?: string;
}

export function GameHeader({ roomCode, phase }: GameHeaderProps) {
    const router = useRouter();
    
    const handleLeave = () => {
        if (confirm('Are you sure you want to leave the game?')) {
            router.push('/');
        }
    };
    
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-6 py-4 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4 text-white">
                <span className="material-symbols-outlined text-primary text-2xl">skull</span>
                <h2 className="text-white text-xl font-bold leading-tight tracking-wide">M<span className="text-primary">A</span>FIA <span className="opacity-50 text-sm ml-2 font-mono">{roomCode}</span></h2>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleLeave}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-bold transition-colors"
                >
                    <span className="truncate">Leave</span>
                </button>
            </div>
        </header>
    );
}