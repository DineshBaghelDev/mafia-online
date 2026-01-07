'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import Link from 'next/link';

export default function MatchmakingPage() {
    const router = useRouter();
    const { socket, username, setUsername } = useGame();
    // Default to "Player" if no username set, in a real app we'd force the username modal first
    const [localUsername, setLocalUsername] = useState(username || "Guest"); 
    const [searching, setSearching] = useState(true); // Start searching immediately for this demo view
    const [playersFound, setPlayersFound] = useState(1); // Self
    const MAX_PLAYERS = 8;

    useEffect(() => {
        if (!username) {
             // In a real flow, redirect to username entry or show modal. 
             // For now, we simulate the matchmaking screen as requested even if username is empty.
        }
        
        let interval: NodeJS.Timeout;
        if (searching) {
            // Simulate players joining
            interval = setInterval(() => {
                setPlayersFound(prev => {
                    if (prev >= MAX_PLAYERS) return prev;
                    if (Math.random() > 0.4) return prev + 1;
                    return prev;
                });
            }, 1000);
            
            // Create room when full-ish (simulated)
            if (playersFound === MAX_PLAYERS) {
                // Mock completion
                // router.push('/lobby/PUBLIC'); 
            }

            return () => {
                clearInterval(interval);
            };
        }
    }, [searching, playersFound, username]);

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111418] dark:text-white overflow-x-hidden min-h-screen flex flex-col font-display">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-black/10 dark:border-b-white/5 px-6 py-4 md:px-10 z-20 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-sm sticky top-0">
                <Link href="/" className="flex items-center gap-3 text-white cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="size-8 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">local_police</span>
                    </div>
                    <h2 className="text-[#111418] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">Mafia</h2>
                </Link>
                <div className="flex flex-1 justify-end gap-4">
                    <button className="flex items-center justify-center overflow-hidden rounded-full size-10 bg-black/5 dark:bg-white/5 text-[#111418] dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </button>
                    <div 
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary/20" 
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDOCvxB_zI8EtADw5o_yX3RvNcNfhUIqLYrZecxxRvkqdtWtfYhvoXyqFWpM8FNuKp_nbgEVVU3E5AvCJL53h2I7rAUoDdfdH2BeYg4M22Fy8cQa_zTAbR6KDpkwxi7BW_0bYLfzhslo8WjAn4_QNh1iqj4Z--jBAWva8raMdZdcl-x5BMtoGfESZiA3O6XlWAM_F7rnovNHlLZ-E-Kg4peQYRWl6CWNktlD1d7NXW-45d-qabKoUy3TIXPuf0X60qWBm9-paAsuA20")' }}
                    >
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative w-full max-w-[1200px] mx-auto">
                {/* Ambient Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="layout-content-container flex flex-col items-center w-full max-w-[560px] gap-12 z-10">
                    {/* Heading Section */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-[#111418] dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.03em] drop-shadow-lg">
                            Finding Players...
                        </h1>
                        <p className="text-[#637588] dark:text-[#9ca3af] text-lg font-medium leading-normal flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                            </span>
                            Matchmaking in progress
                        </p>
                    </div>

                    {/* Visualization of Players (Dots) */}
                    <div className="flex flex-col items-center gap-6 w-full py-8">
                        {/* Visual Slots representing 8 players */}
                        <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
                            {/* Render slots based on playersFound */}
                            {Array.from({ length: MAX_PLAYERS }).map((_, i) => (
                                i < playersFound ? (
                                    <div key={i} className={`size-6 md:size-8 rounded-full bg-primary shadow-[0_0_15px_rgba(230,55,67,0.6)] animate-pulse ${i > 0 ? `delay-${Math.min(i*75, 700)}` : ''}`}></div>
                                ) : (
                                    <div key={i} className="size-6 md:size-8 rounded-full border-2 border-dashed border-[#e63743]/30 bg-white/5"></div>
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

                    {/* Progress Bar (Subtle) */}
                    <div className="w-full max-w-[320px] flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-medium text-white/50 uppercase tracking-wider">
                            <span>Estimated Wait</span>
                            <span>0:30</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary/50 to-primary w-1/3 rounded-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-shimmer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Cancel Action */}
                    <div className="pt-8">
                        <button 
                            onClick={handleCancel}
                            className="group flex min-w-[160px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl h-14 px-8 border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/50 text-[#c79497] hover:text-white transition-all duration-300"
                        >
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">close</span>
                            <span className="text-base font-bold tracking-wide">CANCEL</span>
                        </button>
                    </div>
                </div>
            </main>
            {/* Simple footer for visual balance */}
            <footer className="p-6 text-center">
                <p className="text-white/20 text-xs font-medium uppercase tracking-widest">Tip: Trust no one, not even your neighbors.</p>
            </footer>
        </div>
    );
}                    
                    <div className="flex flex-col items-center gap-8 py-4">
                        <div className="flex justify-center gap-4 flex-wrap">
                            {Array.from({ length: MAX_PLAYERS }).map((_, i) => (
                                <div 
                                    key={i}
                                    className={`w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-500 ${
                                        i < playersFound 
                                            ? 'bg-primary shadow-[0_0_15px_rgba(230,57,70,0.6)] animate-pulse' 
                                            : 'bg-white/5 border-2 border-dashed border-primary/30'
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Lobby Status</p>
                            <p className="text-3xl font-mono font-bold text-white tracking-widest">
                                <span className="text-primary">{playersFound}</span> / {MAX_PLAYERS}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button variant="ghost" onClick={handleCancel} className="px-12 text-muted hover:text-white hover:bg-white/5 decoration-slice">
                            CANCEL SEARCH
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
