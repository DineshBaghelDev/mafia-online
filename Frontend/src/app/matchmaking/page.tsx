'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';

export default function MatchmakingPage() {
    const router = useRouter();
    const { socket, username } = useGame();
    const [playersFound, setPlayersFound] = useState(1);
    const [searchTime, setSearchTime] = useState(0);
    const MAX_PLAYERS = 10;

    useEffect(() => {
        // Redirect to username if not set
        if (!username) {
            router.push('/username?next=/matchmaking');
            return;
        }

        if (!socket) return;

        // Join matchmaking queue
        socket.emit('matchmaking:join', { username });

        // Listen for queue updates
        socket.on('matchmaking:queued', (data: { queueSize: number }) => {
            setPlayersFound(data.queueSize);
        });

        // Listen for game found
        socket.on('matchmaking:found', (data: { roomId: string; roomCode: string }) => {
            console.log('Game found:', data);
            router.push(`/lobby/${data.roomCode}`);
        });

        // Track search time
        const interval = setInterval(() => {
            setSearchTime(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
            socket.emit('matchmaking:leave');
            socket.off('matchmaking:queued');
            socket.off('matchmaking:found');
        };
    }, [socket, username, router]);

    const handleCancel = () => {
        if (socket) {
            socket.emit('matchmaking:leave');
        }
        router.push('/');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-background-dark text-white overflow-x-hidden min-h-screen flex flex-col font-display">
            {/* Back Button */}
            <button
                onClick={handleCancel}
                className="fixed top-8 left-8 z-20 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-medium">Back</span>
            </button>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative w-full max-w-[720px] mx-auto">
                {/* Ambient Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="flex flex-col items-center w-full gap-12 z-10">
                    {/* Heading Section */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.03em] drop-shadow-lg">
                            Finding Players...
                        </h1>
                        <p className="text-muted text-lg font-medium leading-normal flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                            </span>
                            Matchmaking in progress
                        </p>
                    </div>

                    {/* Visualization of Players (Dots) */}
                    <div className="flex flex-col items-center gap-6 w-full py-8">
                        {/* Visual Slots */}
                        <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                            {Array.from({ length: MAX_PLAYERS }).map((_, i) => (
                                i < playersFound ? (
                                    <div 
                                        key={i} 
                                        className="size-6 md:size-8 rounded-full bg-primary shadow-[0_0_15px_rgba(230,55,67,0.6)] animate-pulse" 
                                        style={{ animationDelay: `${i * 75}ms` }}
                                    ></div>
                                ) : (
                                    <div key={i} className="size-6 md:size-8 rounded-full border-2 border-dashed border-primary/30 bg-white/5"></div>
                                )
                            ))}
                        </div>
                        {/* Text Count */}
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Lobby Status</p>
                            <p className="text-3xl font-mono font-bold text-white tracking-widest">
                                <span className="text-primary">{playersFound}</span> / {MAX_PLAYERS}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-[320px] flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-medium text-white/50 uppercase tracking-wider">
                            <span>Search Time</span>
                            <span>{formatTime(searchTime)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full relative overflow-hidden transition-all duration-1000"
                                style={{ width: `${Math.min((searchTime / 30) * 100, 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-shimmer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Cancel Action */}
                    <div className="pt-8">
                        <button 
                            onClick={handleCancel}
                            className="group flex min-w-[160px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl h-14 px-8 border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/50 text-white/70 hover:text-white transition-all duration-300"
                        >
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">close</span>
                            <span className="text-base font-bold tracking-wide">CANCEL</span>
                        </button>
                    </div>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="p-6 text-center">
                <p className="text-white/20 text-xs font-medium uppercase tracking-widest">Tip: Trust no one, not even your neighbors.</p>
            </footer>
        </div>
    );
}
