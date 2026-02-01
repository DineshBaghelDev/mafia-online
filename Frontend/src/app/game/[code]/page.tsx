'use client';

import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GameHeader } from '@/components/game/GameHeader';
import { RoleRevealPhase } from '@/components/game/RoleRevealPhase';
import { DayPhase } from '@/components/game/DayPhase';
import { NightPhase } from '@/components/game/NightPhase';
import { VotingPhase } from '@/components/game/VotingPhase';
import { EliminationResultPhase } from '@/components/game/EliminationResultPhase';
import { GameEndPhase } from '@/components/game/GameEndPhase';
import { Timer } from '@/components/game/Timer';
import { RoomState } from '@/types';
import { showToast } from '@/components/ui/Toast';

// No mock needed - we'll use real socket data

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const { socket, username, playerId } = useGame();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [room, setRoom] = useState<RoomState | null>(null);
    const [loading, setLoading] = useState(true);
    const [inspectResult, setInspectResult] = useState<{targetId: string, isMafia: boolean} | null>(null);
    const [investigationHistory, setInvestigationHistory] = useState<Map<string, boolean>>(new Map());
    const [chatMessages, setChatMessages] = useState<Array<{id: string; sender: string; text: string; timestamp: number; isSystem?: boolean; isGhost?: boolean}>>([]);

    const code = params.code as string;
    const me = (room && playerId) ? room.players[playerId] : undefined;

    useEffect(() => {
        if (authLoading) return;
        
        if (!socket || !username) {
            router.push(`/username?next=/game/${code}`);
            return;
        }

        // Listen for room updates
        socket.on('room:update', (updatedRoom: RoomState) => {
            setRoom(updatedRoom);
            setLoading(false);
            
            // If room reset to lobby, redirect there
            if (updatedRoom.phase === 'lobby') {
                router.push(`/lobby/${code}`);
            }
        });

        // Listen for role assignment (private to this player)
        socket.on('game:role', (data: { role: string }) => {
            console.log('Received role:', data.role);
            if (room) {
                setRoom(prev => prev ? {
                    ...prev,
                    players: {
                        ...prev.players,
                        [playerId!]: {
                            ...prev.players[playerId!],
                            role: data.role as any
                        }
                    }
                } : null);
            }
        });

        // Listen for phase changes
        socket.on('game:phase', (data: { phase: string; duration: number }) => {
            console.log('Phase changed to:', data.phase);
        });

        // Listen for game end
        socket.on('game:end', (data: any) => {
            console.log('Game ended:', data);
            if (room) {
                setRoom(prev => prev ? { ...prev, phase: 'game_end', winner: data.winner } : null);
            }
        });

        // Listen for detective inspect result
        socket.on('action:result', (data: { inspectResult?: {targetId: string, isMafia: boolean} }) => {
            console.log('Action result received:', data);
            if (data.inspectResult) {
                setInspectResult(data.inspectResult);
                // Add to investigation history
                setInvestigationHistory(prev => {
                    const newMap = new Map(prev);
                    newMap.set(data.inspectResult!.targetId, data.inspectResult!.isMafia);
                    return newMap;
                });
            }
        });

        socket.on('room:error', (err: { reason: string }) => {
            console.error('Game error:', err);
            showToast(err.reason, 'error');
        });

        // Request current game state
        socket.emit('game:getState');

        return () => {
            socket.off('room:update');
            socket.off('game:role');
            socket.off('game:phase');
            socket.off('game:end');
            socket.off('action:result');
            socket.off('room:error');
        };
    }, [socket, code, username, router, playerId, room, isAuthenticated, authLoading]);

    // Simple Render Logic based on Phase
    const renderPhase = () => {
        if (!room) return null;

        switch (room.phase) {
            case 'role_reveal':
                return <RoleRevealPhase role={me?.role} />;
            case 'day': // Discussion
                return <DayPhase room={room} inspectResult={inspectResult} onClearInspect={() => setInspectResult(null)} investigationHistory={investigationHistory} chatMessages={chatMessages} setChatMessages={setChatMessages} />;
            case 'voting':
                return <VotingPhase room={room} chatMessages={chatMessages} setChatMessages={setChatMessages} />;
            case 'elimination_result':
                return <EliminationResultPhase room={room} />;
            case 'night':
                return <NightPhase room={room} inspectResult={inspectResult} investigationHistory={investigationHistory} />;
            case 'game_end':
                return <GameEndPhase room={room} />;
            case 'lobby':
                router.push(`/lobby/${code}`);
                return null;
            default:
                return (
                     <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                         <p>Unknown Game Phase: {room.phase}</p>
                     </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                     <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                     <div className="tracking-widest uppercase text-sm">Loading Game World...</div>
                </div>
            </div>
        );
    }

    if (!room) {
         return (
             <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
                 <div className="text-center">
                     <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
                     <button onClick={() => router.push('/')} className="px-4 py-2 bg-primary rounded">Go Home</button>
                 </div>
             </div>
         );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col overflow-hidden relative">
            <GameHeader 
                roomCode={room.code} 
                phase={room.phase}
            />
            <main className="flex-1 overflow-hidden relative">
                {/* Timer in top-right corner of content area */}
                {(room.timerEnd || room.timer !== undefined) && room.phase !== 'lobby' && room.phase !== 'game_end' && (
                    <div className="absolute top-6 right-6 z-40 animate-fade-in">
                        <Timer 
                            timerEnd={room.timerEnd} 
                            duration={
                                room.phase === 'day' ? room.settings.discussionTime :
                                room.phase === 'voting' ? room.settings.votingTime :
                                room.phase === 'night' ? room.settings.nightTime :
                                room.phase === 'elimination_result' ? room.settings.eliminationResultTime :
                                room.phase === 'role_reveal' ? room.settings.roleRevealTime :
                                undefined
                            }
                            label=""
                        />
                    </div>
                )}
                 {renderPhase()}
            </main>
        </div>
    );
}