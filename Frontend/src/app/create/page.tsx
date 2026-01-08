'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { showToast } from '@/components/ui/Toast';

export default function CreateGamePage() {
    const router = useRouter();
    const { socket, username, setUsername, leaveRoom } = useGame();

    useEffect(() => {
        // Redirect to username if not set
        if (!username) {
            router.push('/username?next=/create');
        }
    }, [username, router]);

    if (!username) {
        return null;
    } 

    const [mafiaCount, setMafiaCount] = useState(2);
    const [doctorCount, setDoctorCount] = useState(1);
    const [discussionTime, setDiscussionTime] = useState(90);
    const [votingTime, setVotingTime] = useState(60);
    const [confirmEjects, setConfirmEjects] = useState(true);
    const [anonymousVotes, setAnonymousVotes] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = () => {
        if (!socket || !socket.connected) {
            showToast('Not connected to server. Please refresh the page.', 'error');
            return;
        }
        
        if (isCreating) {
            return; // Prevent double-click
        }
        
        setIsCreating(true);
        console.log('Creating room with username:', username);
        
        // Leave any existing room first
        leaveRoom();
        
        // Small delay to ensure leave is processed
        setTimeout(() => {
            // Emitting create room event with settings
            socket.emit('room:create', { 
                username,
                isPublic: isPublic,
                maxPlayers: 10,
                settings: {
                    discussionTime,
                    votingTime,
                    nightTime: 30 // Fixed for now
                }
            });
            
            // Listen for room joined (server responds with room:joined)
            socket.once('room:joined', (data: { roomId: string; roomCode: string; playerId: string }) => {
                console.log('Room created, joining lobby:', data);
                showToast('Lobby created!', 'success');
                router.push(`/lobby/${data.roomCode}`);
            });
            
            // Timeout fallback
            setTimeout(() => {
                setIsCreating(false);
            }, 3000);
        }, 100);
    };

    return (
        <div className="bg-background-dark min-h-screen text-white flex items-center justify-center p-6 relative font-display overflow-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="fixed top-8 left-8 z-20 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-medium">Back</span>
            </button>

            <main className="relative w-full max-w-[720px] bg-[#12161D] border border-white/5 shadow-2xl rounded-2xl overflow-hidden flex flex-col z-10 h-full max-h-[90vh]">
                <header className="px-8 py-6 border-b border-white/5 bg-[#161B22] flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">settings_applications</span>
                            GAME SETTINGS
                        </h1>
                        <p className="text-[#8B949E] text-sm mt-1">Configure the rules for the lobby.</p>
                    </div>
                </header>

                <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
                    <section>
                        <h2 className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-5 ml-1">Composition</h2>
                        <div className="space-y-4">
                            {/* Mafia Count */}
                            <div className="bg-[#161B22] hover:bg-[#1C2128] transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-2xl">theater_comedy</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">Number of Mafia</h3>
                                        <p className="text-sm text-[#8B949E]">Impostors hiding in plain sight.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-background-dark p-1.5 rounded-xl border border-white/5">
                                    <button 
                                        onClick={() => setMafiaCount(Math.max(1, mafiaCount - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 text-white transition"
                                    >
                                        <span className="material-symbols-outlined text-lg">remove</span>
                                    </button>
                                    <span className="w-10 text-center font-bold text-xl font-mono">{mafiaCount}</span>
                                    <button 
                                        onClick={() => setMafiaCount(Math.min(5, mafiaCount + 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary hover:bg-[#D02835] active:scale-95 text-white shadow-lg shadow-primary/20 transition"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                            </div>

                            {/* Doctor Count */}
                            <div className="bg-[#161B22] hover:bg-[#1C2128] transition-colors p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-2xl">medical_services</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">Doctors</h3>
                                        <p className="text-sm text-[#8B949E]">Can save one person per night.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-background-dark p-1.5 rounded-xl border border-white/5">
                                    <button 
                                        onClick={() => setDoctorCount(Math.max(0, doctorCount - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 text-white transition"
                                    >
                                        <span className="material-symbols-outlined text-lg">remove</span>
                                    </button>
                                    <span className="w-10 text-center font-bold text-xl font-mono">{doctorCount}</span>
                                    <button 
                                        onClick={() => setDoctorCount(Math.min(3, doctorCount + 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 text-white transition"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-5 ml-1">Timers</h2>
                        <div className="space-y-4">
                            <div className="bg-[#161B22] p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#8B949E]">forum</span>
                                        Discussion Time
                                    </label>
                                    <span className="px-2 py-1 rounded bg-primary/10 text-primary font-bold font-mono text-sm border border-primary/20">{discussionTime}s</span>
                                </div>
                                <input 
                                    className="w-full" 
                                    max="180" 
                                    min="15" 
                                    step="15" 
                                    type="range" 
                                    value={discussionTime}
                                    onChange={(e) => setDiscussionTime(Number(e.target.value))}
                                />
                                <div className="flex justify-between text-xs text-[#8B949E] font-medium uppercase tracking-wider">
                                    <span>15s</span>
                                    <span>180s</span>
                                </div>
                            </div>
                            <div className="bg-[#161B22] p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#8B949E]">how_to_vote</span>
                                        Voting Time
                                    </label>
                                    <span className="px-2 py-1 rounded bg-primary/10 text-primary font-bold font-mono text-sm border border-primary/20">{votingTime}s</span>
                                </div>
                                <input 
                                    className="w-full" 
                                    max="120" 
                                    min="10" 
                                    step="10" 
                                    type="range" 
                                    value={votingTime}
                                    onChange={(e) => setVotingTime(Number(e.target.value))}
                                />
                                <div className="flex justify-between text-xs text-[#8B949E] font-medium uppercase tracking-wider">
                                    <span>10s</span>
                                    <span>120s</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-5 ml-1">Gameplay Rules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                onClick={() => setIsPublic(!isPublic)}
                                className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
                            >
                                <div className="pr-4">
                                    <h3 className="font-bold text-sm text-white mb-1">Public Lobby</h3>
                                    <p className="text-xs text-[#8B949E] leading-snug">Visible to all players.</p>
                                </div>
                                <div className={`relative w-12 h-7 rounded-full transition-colors flex items-center px-1 ${isPublic ? 'bg-primary' : 'bg-[#1C2128] border border-white/10'}`}>
                                    <div className={`w-5 h-5 rounded-full shadow-sm transform transition-transform ${isPublic ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[#8B949E]/50'}`}></div>
                                </div>
                            </div>
                            <div 
                                onClick={() => setConfirmEjects(!confirmEjects)}
                                className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
                            >
                                <div className="pr-4">
                                    <h3 className="font-bold text-sm text-white mb-1">Confirm Ejects</h3>
                                    <p className="text-xs text-[#8B949E] leading-snug">Reveal role upon ejection.</p>
                                </div>
                                <div className={`relative w-12 h-7 rounded-full transition-colors flex items-center px-1 ${confirmEjects ? 'bg-primary' : 'bg-[#1C2128] border border-white/10'}`}>
                                    <div className={`w-5 h-5 rounded-full shadow-sm transform transition-transform ${confirmEjects ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[#8B949E]/50'}`}></div>
                                </div>
                            </div>
                            <div 
                                onClick={() => setAnonymousVotes(!anonymousVotes)}
                                className="bg-[#161B22] p-5 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
                            >
                                <div className="pr-4">
                                    <h3 className="font-bold text-sm text-white mb-1">Anonymous Votes</h3>
                                    <p className="text-xs text-[#8B949E] leading-snug">Hide voting results.</p>
                                </div>
                                <div className={`relative w-12 h-7 rounded-full transition-colors flex items-center px-1 ${anonymousVotes ? 'bg-primary' : 'bg-[#1C2128] border border-white/10'}`}>
                                    <div className={`w-5 h-5 rounded-full shadow-sm transform transition-transform ${anonymousVotes ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[#8B949E]/50'}`}></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="p-8 border-t border-white/5 bg-[#161B22]/95 backdrop-blur-sm z-20 flex-shrink-0">
                    <button 
                        onClick={handleCreate}
                        disabled={isCreating}
                        className={`group w-full h-14 ${isCreating ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-[#D02835]'} text-white rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(230,57,70,0.3)] hover:shadow-[0_4px_25px_rgba(230,57,70,0.5)] transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600`}
                    >
                        {isCreating ? (
                            <>
                                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                <span>CREATING...</span>
                            </>
                        ) : (
                            <>
                                <span>CREATE LOBBY</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </>
                        )}
                    </button>
                    <button className="w-full mt-4 text-sm text-[#8B949E] hover:text-white font-medium transition-colors">
                        Reset to Defaults
                    </button>
                </footer>
            </main>
        </div>
    );
}
