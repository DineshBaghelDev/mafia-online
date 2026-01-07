'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

export default function MatchmakingPage() {
    const router = useRouter();
    const { socket, username, setUsername } = useGame();
    const [localUsername, setLocalUsername] = useState(username);
    const [searching, setSearching] = useState(false);
    const [playersFound, setPlayersFound] = useState(1); // Self
    const MAX_PLAYERS = 8;

    useEffect(() => {
        if (!socket) return;
        
        socket.on('room:update', (room) => {
             // Redirect when "found" (created for mock)
             router.push(`/lobby/${room.code}`);
        });

        // Cleanup listener on unmount
        return () => {
             socket.off('room:update');
        };
    }, [socket, router]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (searching) {
            // Simulate players joining
            interval = setInterval(() => {
                setPlayersFound(prev => {
                    if (prev >= MAX_PLAYERS) return prev;
                    // Random chance to find player
                    return Math.random() > 0.3 ? prev + 1 : prev;
                });
            }, 800);
            
            // Create room when full-ish (simulated)
            const timeout = setTimeout(() => {
                 if (socket) socket.emit('room:create', { username: localUsername });
            }, 5000); // Wait 5s total approx

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        } else {
            setPlayersFound(1);
        }
    }, [searching, localUsername, socket]);

    const handleSearch = () => {
        if (!localUsername) return;
        setUsername(localUsername);
        setSearching(true);
    };

    const handleCancel = () => {
        setSearching(false);
        setPlayersFound(1);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            {!searching ? (
                <div className="w-full max-w-md space-y-8 text-center bg-black/20 p-8 rounded-2xl backdrop-blur-sm border border-white/5 shadow-2xl">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-white">Enter your name</h1>
                    </div>
                    <input 
                        className="w-full bg-white/5 border-2 border-muted rounded-xl px-4 py-4 text-center text-xl text-white placeholder-muted/50 outline-none focus:border-primary transition-all duration-300"
                        placeholder="Username"
                        value={localUsername}
                        maxLength={12}
                        autoFocus
                        onChange={(e) => setLocalUsername(e.target.value)}
                    />
                    <Button fullWidth onClick={handleSearch} disabled={!localUsername}>
                        CONTINUE
                    </Button>
                </div>
            ) : (
                <div className="w-full max-w-md space-y-12 text-center relative z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                    
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
                            Finding Players...
                        </h2>
                        <p className="text-muted text-lg font-medium flex items-center justify-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                            Matchmaking in progress
                        </p>
                    </div>
                    
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
