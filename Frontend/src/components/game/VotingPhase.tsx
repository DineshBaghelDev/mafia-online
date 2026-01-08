'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState } from '@/types';
import { Timer } from './Timer';

interface VotingPhaseProps {
    room: RoomState;
}

export function VotingPhase({ room }: VotingPhaseProps) {
    const { socket, playerId } = useGame();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = () => {
        if (!selectedPlayerId || hasVoted) return;
        
        socket?.emit('vote:cast', { targetId: selectedPlayerId });
        setHasVoted(true);
    };

    // Calculate voting progress
    const totalVoters = Object.values(room.players).filter(p => p.isAlive).length;
    const votedCount = Object.keys(room.votes || {}).length;
    const progressPercent = (votedCount / totalVoters) * 100;

    // Sort players: Alive first, then Dead
    const sortedPlayers = Object.values(room.players).sort((a, b) => {
        if (a.isAlive === b.isAlive) return a.username.localeCompare(b.username);
        return a.isAlive ? -1 : 1;
    });

    return (
        <div className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-6 bg-background-dark">
            <div className="w-full max-w-2xl flex flex-col gap-8">
                {/* Page Heading & Context */}
                <div className="flex flex-col gap-4 text-center mt-4">
                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">VOTING</h2>
                        <p className="text-primary font-medium text-lg tracking-wide uppercase">Who should be eliminated?</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto mt-2">
                        <div className="flex justify-between text-xs font-medium text-text-secondary mb-2 px-1">
                            <span>Voting Progress</span>
                            <span>{votedCount}/{totalVoters} Voted</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-red-600 transition-all duration-500 rounded-full"
                                style={{width: `${progressPercent}%`}}
                            ></div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="mt-4">
                        <Timer timerEnd={room.timerEnd} duration={room.settings.votingTime} />
                    </div>
                </div>

                {/* Players List */}
                <div className="flex flex-col gap-3 overflow-y-auto pb-24 custom-scrollbar">
                    {sortedPlayers.map(player => {
                        if (!player.isAlive) {
                            return (
                                <div key={player.id} className="relative opacity-40 grayscale select-none cursor-not-allowed">
                                    <div className="flex items-center p-4 rounded-xl border border-white/5 bg-black/20">
                                        <div className="mr-4 flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                                                <span className="material-symbols-outlined text-gray-400 text-2xl">skull</span>
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-lg text-gray-500 line-through decoration-primary decoration-2">{player.username}</p>
                                            <p className="text-xs text-gray-600 uppercase tracking-wider">Eliminated</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        const isSelected = selectedPlayerId === player.id;
                        const isMe = player.id === playerId;

                        return (
                            <label key={player.id} className="group relative cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="vote" 
                                    className="peer sr-only" 
                                    disabled={hasVoted}
                                    checked={isSelected}
                                    onChange={() => setSelectedPlayerId(player.id)}
                                />
                                <div className={`flex items-center p-5 rounded-2xl border-2 transition-all duration-200 ${
                                    isSelected 
                                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(230,55,67,0.2)]' 
                                        : 'border-border-dark bg-surface-dark hover:border-primary/30 hover:bg-surface-dark/80'
                                }`}>
                                    <div className="mr-4 flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                                            isSelected ? 'bg-primary/20 text-primary border-primary' : 'bg-white/5 text-gray-400 border-white/10 group-hover:border-primary/30'
                                        }`}>
                                            <span className="material-symbols-outlined text-3xl">person</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`font-bold text-lg transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                            {player.username} {isMe && '(You)'}
                                        </p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Alive • Eligible</p>
                                    </div>
                                    {/* Radio indicator */}
                                    <div className={`w-6 h-6 rounded-full border-3 transition-all flex items-center justify-center ${
                                        isSelected ? 'border-primary bg-primary' : 'border-gray-600 group-hover:border-primary/50'
                                    }`}>
                                        {isSelected && (
                                            <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                                        )}
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Action Button */}
                <div className="fixed bottom-6 left-0 right-0 px-4 md:px-0 w-full max-w-2xl mx-auto z-40">
                    <button 
                        disabled={!selectedPlayerId || hasVoted}
                        onClick={handleVote}
                        className="w-full relative group overflow-hidden rounded-xl bg-primary disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-red-600 transition-colors duration-300 h-16 shadow-[0_0_30px_rgba(230,55,67,0.4)] disabled:shadow-none"
                    >
                        {!hasVoted && (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer"></div>
                        )}
                        <span className="relative flex items-center justify-center gap-3 font-black text-white tracking-widest text-lg uppercase">
                            <span className="material-symbols-outlined text-2xl">how_to_vote</span>
                            {hasVoted ? 'Vote Cast' : 'Cast Vote'}
                        </span>
                    </button>
                    {hasVoted && (
                        <p className="text-center text-sm text-gray-400 mt-3 animate-pulse">Waiting for other players to vote...</p>
                    )}
                </div>
            </div>
        </div>
    );
}