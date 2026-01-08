'use client';

import { useGame } from '@/context/GameContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GameHeader } from '@/components/game/GameHeader';
import { RoleRevealPhase } from '@/components/game/RoleRevealPhase';
import { DayPhase } from '@/components/game/DayPhase';
import { NightPhase } from '@/components/game/NightPhase';
import { VotingPhase } from '@/components/game/VotingPhase';
import { GameEndPhase } from '@/components/game/GameEndPhase';
import { RoomState } from '@/types';
import { showToast } from '@/components/ui/Toast';

// No mock needed - we'll use real socket data

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const { socket, username, playerId } = useGame();
    const [room, setRoom] = useState<RoomState | null>(null);
    const [loading, setLoading] = useState(true);

    const code = params.code as string;
    const me = (room && playerId) ? room.players[playerId] : undefined;

    useEffect(() => {
        if (!socket || !username) {
            router.push(`/username?next=/game/${code}`);
            return;
        }

        // Listen for room updates
        socket.on('room:update', (updatedRoom: RoomState) => {
            setRoom(updatedRoom);
            setLoading(false);
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
            socket.off('room:error');
        };
    }, [socket, code, username, router, playerId, room]);

    // Simple Render Logic based on Phase
    const renderPhase = () => {
        if (!room) return null;

        switch (room.phase) {
            case 'role_reveal':
                return <RoleRevealPhase role={me?.role} />;
            case 'day': // Discussion
                return <DayPhase room={room} />;
            case 'voting':
                return <VotingPhase room={room} />;
            case 'night':
                return <NightPhase room={room} />;
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
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col overflow-hidden">
            <GameHeader 
                roomCode={room.code} 
                timeLeft={room.timer}
                phase={room.phase}
            />
            <main className="flex-1 overflow-hidden relative">
                 {renderPhase()}
            </main>
        </div>
    );
}