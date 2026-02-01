'use client';

import { useState } from 'react';
import { RoleRevealPhase } from '@/components/game/RoleRevealPhase';
import { DayPhase } from '@/components/game/DayPhase';
import { VotingPhase } from '@/components/game/VotingPhase';
import { NightPhase } from '@/components/game/NightPhase';
import { EliminationResultPhase } from '@/components/game/EliminationResultPhase';
import { GameEndPhase } from '@/components/game/GameEndPhase';
import { RoomState } from '@/types';
import { GameProvider } from '@/context/GameContext';

// Mock room data for design preview
const mockRoom: RoomState = {
    id: 'design-room',
    code: 'DESIGN',
    phase: 'day',
    players: {
        '1': { id: '1', username: 'Alice', isHost: true, role: 'detective', isAlive: true, connected: true },
        '2': { id: '2', username: 'Bob', isHost: false, role: 'mafia', isAlive: true, connected: true },
        '3': { id: '3', username: 'Charlie', isHost: false, role: 'doctor', isAlive: true, connected: true },
        '4': { id: '4', username: 'Diana', isHost: false, role: 'villager', isAlive: true, connected: true },
        '5': { id: '5', username: 'Eve', isHost: false, role: 'mafia', isAlive: false, connected: true },
        '6': { id: '6', username: 'Frank', isHost: false, role: 'villager', isAlive: true, connected: true },
    },
    settings: {
        maxPlayers: 10,
        discussionTime: 90,
        votingTime: 60,
        nightTime: 30,
        eliminationResultTime: 5,
        roleRevealTime: 8,
        enableDoctor: true,
        enableDetective: true,
        isPublic: false,
    },
    timerEnd: Date.now() + 60000,
    votes: { '1': '2', '3': '2', '4': '5' },
    actions: {},
    isPublic: false,
    currentRound: 2,
    chatHistory: [],
    nightResult: { killed: '5' },
    eliminatedThisRound: '5',
};

export default function DesignPreviewPage() {
    const [selectedPhase, setSelectedPhase] = useState<string>('day');
    const [mockPlayerId, setMockPlayerId] = useState('1');

    const phases = [
        { id: 'role_reveal', name: 'Role Reveal' },
        { id: 'day', name: 'Day Phase' },
        { id: 'voting', name: 'Voting Phase' },
        { id: 'night', name: 'Night Phase' },
        { id: 'elimination_result', name: 'Elimination Result' },
        { id: 'game_end', name: 'Game End' },
    ];

    const renderPhase = () => {
        const room = { ...mockRoom, phase: selectedPhase as any };
        const me = room.players[mockPlayerId];

        switch (selectedPhase) {
            case 'role_reveal':
                return <RoleRevealPhase room={room} role={me?.role || 'villager'} />;
            case 'day':
                return <DayPhase room={room} inspectResult={null} investigationHistory={new Map()} chatMessages={[]} setChatMessages={() => {}} />;
            case 'voting':
                return <VotingPhase room={room} chatMessages={[]} setChatMessages={() => {}} />;
            case 'night':
                return <NightPhase room={room} inspectResult={null} investigationHistory={new Map()} />;
            case 'elimination_result':
                return <EliminationResultPhase room={room} />;
            case 'game_end':
                return <GameEndPhase room={{ ...room, winner: 'villagers' }} />;
            default:
                return <div className="text-white">Select a phase</div>;
        }
    };

    return (
        <GameProvider mockPlayerId={mockPlayerId}>
            <div className="bg-background-dark text-white min-h-screen flex flex-col">
                {/* Control Panel */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 p-4">
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">palette</span>
                            <h1 className="text-lg font-bold">Design Preview</h1>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Phase:</span>
                            <select
                                value={selectedPhase}
                                onChange={(e) => setSelectedPhase(e.target.value)}
                                className="bg-surface-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium"
                            >
                                {phases.map(phase => (
                                    <option key={phase.id} value={phase.id}>{phase.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">View as:</span>
                            <select
                                value={mockPlayerId}
                                onChange={(e) => setMockPlayerId(e.target.value)}
                                className="bg-surface-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium"
                            >
                                {Object.values(mockRoom.players).map(player => (
                                    <option key={player.id} value={player.id}>
                                        {player.username} ({player.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <a
                            href="/"
                            className="ml-auto px-4 py-1.5 bg-primary hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            Back to Home
                        </a>
                    </div>
                </div>

                {/* Phase Preview */}
                <div className="mt-20">
                    {renderPhase()}
                </div>
            </div>
        </GameProvider>
    );
}
