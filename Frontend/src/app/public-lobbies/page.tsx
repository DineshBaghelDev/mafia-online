'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { RoomState } from '@/types';

export default function PublicLobbiesPage() {
    const router = useRouter();
    const { socket, username } = useGame();
    const [lobbies, setLobbies] = useState<RoomState[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) {
            router.push('/username?next=/public-lobbies');
            return;
        }

        if (!socket) return;

        // Request public lobbies
        socket.emit('matchmaking:getPublicRooms');

        socket.on('matchmaking:publicRooms', (data: { rooms: RoomState[] }) => {
            setLobbies(data.rooms);
            setLoading(false);
        });

        // Refresh lobbies every 3 seconds
        const interval = setInterval(() => {
            socket.emit('matchmaking:getPublicRooms');
        }, 3000);

        return () => {
            clearInterval(interval);
            socket.off('matchmaking:publicRooms');
        };
    }, [socket, username, router]);

    const handleJoin = (code: string) => {
        router.push(`/lobby/${code}`);
    };

    const handleCreateNew = () => {
        router.push('/create');
    };

    return (
        <div className="bg-background-dark text-white min-h-screen flex flex-col font-display">
            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="fixed top-8 left-8 z-20 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-medium">Back</span>
            </button>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center p-6 md:p-10 pt-24 w-full max-w-[900px] mx-auto">
                <div className="w-full flex flex-col gap-8">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2 flex items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-primary text-5xl md:text-6xl">skull</span>
                            Public Lobbies
                        </h1>
                        <p className="text-gray-400 text-lg">Join an existing game or create your own</p>
                    </div>

                    {/* Create New Button */}
                    <button
                        onClick={handleCreateNew}
                        className="w-full h-14 bg-primary hover:bg-[#ff4d5a] text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Create New Lobby
                    </button>

                    {/* Lobbies List */}
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : lobbies.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-white/10 mb-4">inbox</span>
                                <p className="text-gray-500 text-lg">No public lobbies available</p>
                                <p className="text-gray-600 text-sm mt-2">Be the first to create one!</p>
                            </div>
                        ) : (
                            lobbies.map(lobby => {
                                const playerCount = Object.keys(lobby.players).length;
                                const isFull = playerCount >= lobby.settings.maxPlayers;
                                
                                return (
                                    <div
                                        key={lobby.id}
                                        className="bg-surface-dark border border-border-dark rounded-xl p-5 hover:border-primary/30 transition-all"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-white font-bold text-xl truncate">Room {lobby.code}</h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                                                        isFull ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                                    }`}>
                                                        {isFull ? 'Full' : 'Open'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-500 text-xs">Players</span>
                                                        <span className="text-white font-bold">{playerCount}/{lobby.settings.maxPlayers}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-500 text-xs">Discussion</span>
                                                        <span className="text-white font-bold">{lobby.settings.discussionTime}s</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-500 text-xs">Voting</span>
                                                        <span className="text-white font-bold">{lobby.settings.votingTime}s</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-500 text-xs">Night</span>
                                                        <span className="text-white font-bold">{lobby.settings.nightTime}s</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleJoin(lobby.code)}
                                                disabled={isFull}
                                                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                                    isFull
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-[#ff4d5a] text-white shadow-lg shadow-primary/20'
                                                }`}
                                            >
                                                {isFull ? 'Full' : 'Join'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
