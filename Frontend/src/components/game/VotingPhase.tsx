'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState } from '@/types';

interface VotingPhaseProps {
    room: RoomState;
}

export function VotingPhase({ room }: VotingPhaseProps) {
    const { socket, playerId } = useGame();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = () => {
        if (!selectedPlayerId || hasVoted) return;
        
        socket?.emit('game:vote', { 
            roomId: room.id, 
            voteFor: selectedPlayerId 
        });
        setHasVoted(true);
    };

    const maxTime = room.settings.votingDuration;
    const timeLeft = room.timer;
    const progressPercent = Math.min(100, Math.max(0, (timeLeft / maxTime) * 100));

    // Sort players: Alive first, then Dead
    const sortedPlayers = Object.values(room.players).sort((a, b) => {
        if (a.isAlive === b.isAlive) return a.username.localeCompare(b.username);
        return a.isAlive ? -1 : 1;
    });

    return (
        <div className="flex flex-col h-full w-full max-w-[600px] mx-auto p-4 md:p-6 pb-24 relative">
             {/* Header / Timer Bar */}
             <div className="w-full mb-8">
                <div className="flex justify-between items-end mb-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Voting Session</h2>
                    <span className="text-primary font-mono text-xl font-bold">{timeLeft}s</span>
                </div>
                <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden border border-white/10">
                    <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(230,55,67,0.5)]" 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            {/* Players List */}
            <div className="flex flex-col gap-3 overflow-y-auto pb-4 custom-scrollbar">
                {sortedPlayers.map(player => {
                    if (!player.isAlive) {
                        return (
                             <div key={player.id} className="relative opacity-50 grayscale select-none cursor-not-allowed">
                                <div className="flex items-center p-4 rounded-xl border border-white/5 bg-black/20">
                                    <div className="mr-4 flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                                            <span className="material-symbols-outlined text-gray-400">skull</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-base text-gray-500 line-through decoration-primary decoration-2">{player.username}</p>
                                        <p className="text-xs text-gray-600">Eliminated</p>
                                    </div>
                                    <div className="w-5 h-5 flex items-center justify-center text-red-900">
                                        <span className="material-symbols-outlined text-lg">block</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    const isSelected = selectedPlayerId === player.id;
                    const isMe = player.id === playerId;

                    return (
                        <label key={player.id} className={`group relative cursor-pointer ${isMe ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input 
                                type="radio" 
                                name="vote" 
                                className="peer sr-only" 
                                disabled={isMe || hasVoted}
                                checked={isSelected}
                                onChange={() => setSelectedPlayerId(player.id)}
                            />
                            <div className={`flex items-center p-4 rounded-xl border transition-all duration-200 ${
                                isSelected 
                                ? 'border-primary bg-primary/10' 
                                : 'border-white/10 bg-surface-dark hover:border-primary/50 hover:bg-surface-dark/80 active:scale-[0.99]'
                            }`}>
                                <div className="mr-4 flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                                        isSelected ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-gray-400 border-white/10'
                                    }`}>
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className={`font-bold text-base transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {player.username} {isMe && '(You)'}
                                    </p>
                                    <p className="text-xs text-gray-500">Alive</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                                    isSelected ? 'border-primary' : 'border-gray-600'
                                }`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Action Button */}
            <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 w-full max-w-[600px] mx-auto z-40">
                 <button 
                    disabled={!selectedPlayerId || hasVoted}
                    onClick={handleVote}
                    className="w-full relative group overflow-hidden rounded-xl bg-primary disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-red-600 transition-colors duration-300 h-14 shadow-[0_0_20px_rgba(230,55,67,0.3)] disabled:shadow-none"
                >
                    {!hasVoted && <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_2s_infinite]"></div>}
                    <span className="relative flex items-center justify-center gap-2 font-black text-white tracking-widest text-lg uppercase">
                        <span className="material-symbols-outlined">how_to_vote</span>
                        {hasVoted ? 'Vote Cast' : 'Confirm Vote'}
                    </span>
                </button>
                {hasVoted && (
                    <p className="text-center text-xs text-gray-500 mt-3 animate-pulse">Waiting for other players...</p>
                )}
            </div>
        </div>
    );
}