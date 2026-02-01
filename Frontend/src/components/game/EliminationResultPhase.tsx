'use client';

import React, { useEffect } from 'react';
import { RoomState } from '@/types';

interface EliminationResultPhaseProps {
    room: RoomState;
}

export function EliminationResultPhase({ room }: EliminationResultPhaseProps) {
    const eliminatedPlayerId = room.eliminatedThisRound;
    const eliminatedPlayer = eliminatedPlayerId ? room.players[eliminatedPlayerId] : null;

    // Count votes for each player
    const voteCounts: Record<string, number> = {};
    Object.values(room.votes || {}).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    const maxVotes = eliminatedPlayerId && voteCounts[eliminatedPlayerId] ? voteCounts[eliminatedPlayerId] : 0;

    return (
        <div className="relative flex flex-col items-center justify-center flex-grow w-full max-w-3xl mx-auto px-4 py-8 h-full overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center w-full animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white/60 uppercase mb-2">Voting Results</h2>
                    <p className="text-gray-400 text-sm tracking-wide">The town has spoken</p>
                </div>

                {/* Elimination Card */}
                {eliminatedPlayer ? (
                    <div className="w-full max-w-lg">
                        <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-1">
                            <div className="bg-background-dark/90 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center gap-6">
                                <div className="flex items-center justify-center size-24 rounded-full bg-primary/20 animate-subtle-bounce">
                                    <span className="material-symbols-outlined text-primary" style={{fontSize: '5rem', fontVariationSettings: "'FILL' 1"}}>skull</span>
                                </div>
                                
                                <div className="text-center">
                                    <p className="text-white/60 text-sm uppercase tracking-widest mb-2">Eliminated</p>
                                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{eliminatedPlayer.username}</h1>
                                    <p className="text-primary text-xl font-bold mb-4">{maxVotes} vote{maxVotes !== 1 ? 's' : ''}</p>
                                    <div className={`inline-block px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide ${
                                        eliminatedPlayer.role === 'mafia' 
                                            ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
                                            : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                                    }`}>
                                        {eliminatedPlayer.role === 'mafia' ? 'MAFIA' : eliminatedPlayer.role === 'detective' ? 'SHERIFF' : eliminatedPlayer.role === 'doctor' ? 'DOCTOR' : 'VILLAGER'}
                                    </div>
                                </div>

                                {/* Vote Breakdown */}
                                {Object.keys(voteCounts).length > 0 && (
                                    <div className="w-full border-t border-white/10 pt-4 mt-2">
                                        <p className="text-center text-white/40 text-xs uppercase tracking-wider mb-3">Vote Distribution</p>
                                        <div className="space-y-2">
                                            {Object.entries(voteCounts)
                                                .filter(([playerId]) => playerId !== '__SKIP__' && room.players[playerId])
                                                .sort(([,a], [,b]) => b - a)
                                                .slice(0, 5)
                                                .map(([playerId, count]) => {
                                                    const player = room.players[playerId];
                                                    const isEliminated = playerId === eliminatedPlayerId;
                                                    return (
                                                        <div key={playerId} className={`flex items-center justify-between p-2 rounded-lg ${isEliminated ? 'bg-primary/10 border border-primary/30' : 'bg-white/5'}`}>
                                                            <span className={`text-sm font-medium ${isEliminated ? 'text-white' : 'text-gray-400'}`}>
                                                                {player.username}
                                                            </span>
                                                            <span className={`text-sm font-bold ${isEliminated ? 'text-primary' : 'text-gray-500'}`}>
                                                                {count} vote{count !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-lg">
                        <div className="bg-surface-dark border border-white/10 rounded-2xl p-8 text-center">
                            <div className="flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-6xl text-gray-600">how_to_vote</span>
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2">No Elimination</h1>
                            <p className="text-gray-400">The vote was tied or nobody was eliminated</p>
                        </div>
                    </div>
                )}

                {/* Timer indicator */}
                <p className="mt-8 text-sm text-gray-500 animate-pulse">Moving to next phase...</p>
            </div>
        </div>
    );
}
