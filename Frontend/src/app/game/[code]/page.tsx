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

// Mock Room Data for Development/Preview
const MOCK_ROOM_STATE: RoomState = {
    id: "123",
    code: "TESTCODE",
    phase: "lobby", // Will change
    players: {},
    settings: {
        maxPlayers: 10,
        dayDuration: 90,
        nightDuration: 30,
        votingDuration: 60
    },
    timer: 90
};

export default function GamePage() {
    const params = useParams();
    const router = useRouter();
    const { socket, username, playerId } = useGame();
    const [room, setRoom] = useState<RoomState | null>(null);
    const [loading, setLoading] = useState(true);

    const code = params.code as string;
    const me = (room && playerId) ? room.players[playerId] : undefined;

    useEffect(() => {
        // In a real app, we would fetch initial state via socket or API
        // For now, we simulate connection or use socket if available
        if (socket) {
            socket.emit('room:join', { code, username });
            
            socket.on('room:update', (updatedRoom: RoomState) => {
                setRoom(updatedRoom);
                setLoading(false);
            });

            socket.on('error', (err: any) => {
                console.error("Game Room Error:", err);
                // Optionally redirect home
            });
            
            // Allow manual role reveal testing via query params or similar if needed
        } else {
            // Fallback for UI development without partial backend
            // Mocking a room state after a delay
            setTimeout(() => {
                setRoom({ ...MOCK_ROOM_STATE, code: code.toUpperCase() });
                setLoading(false);
            }, 1000);
        }

        return () => {
             socket?.off('room:update');
             socket?.off('error');
        };
    }, [socket, code, username]);

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
                 // If we are in lobby but on game page, maybe redirect back to lobby or show waiting
                 // But typically game page handles the running game.
                 // For now, redirect to lobby view if phase is lobby
                 return (
                    <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                        <p>Game hasn't started yet.</p>
                        <button onClick={() => router.push(`/lobby/${code}`)} className="text-primary underline">Return to Lobby</button>
                    </div>
                 );
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