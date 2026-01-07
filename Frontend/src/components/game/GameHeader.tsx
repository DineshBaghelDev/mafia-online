import React from 'react';

interface GameHeaderProps {
    roomCode?: string;
    timeLeft?: number; // in seconds
    phase?: string;
    onMenu?: () => void;
}

export function GameHeader({ roomCode, timeLeft, phase, onMenu }: GameHeaderProps) {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-6 py-4 bg-surface-dark/50 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4 text-white">
                <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                    <span className="material-symbols-outlined text-xl">theater_comedy</span>
                </div>
                <h2 className="text-white text-xl font-bold leading-tight tracking-wide">MAFIA <span className="opacity-50 text-sm ml-2 font-mono">{roomCode}</span></h2>
            </div>
            
            <div className="flex items-center gap-4">
                {timeLeft !== undefined && (
                    <div className="hidden md:flex items-center gap-2 text-muted-text bg-white/5 px-3 py-1.5 rounded-lg animate-fade-in">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        <span className={`text-sm font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                )}
                
                <button 
                    onClick={onMenu}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors"
                >
                    <span className="truncate">Menu</span>
                </button>
            </div>
        </header>
    );
}