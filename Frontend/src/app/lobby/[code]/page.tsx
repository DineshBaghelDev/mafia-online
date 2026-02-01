'use client';

import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RoomState } from '@/types';
import { showToast } from '@/components/ui/Toast';

export default function LobbyPage() {
    const params = useParams();
    const router = useRouter();
    const { socket, username, playerId } = useGame();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const code = params.code as string;
    
    const [room, setRoom] = useState<RoomState | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    
    // Editable settings state
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [discussionTime, setDiscussionTime] = useState(90);
    const [votingTime, setVotingTime] = useState(60);
    const [nightTime, setNightTime] = useState(30);
    const [eliminationResultTime, setEliminationResultTime] = useState(5);
    const [roleRevealTime, setRoleRevealTime] = useState(8);
    const [enableDoctor, setEnableDoctor] = useState(true);
    const [enableDetective, setEnableDetective] = useState(true);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        
        if (!username) {
            router.push(`/username?next=/lobby/${code}`);
            return;
        }

        if (!socket) return;

        // Join the room (backend will handle if we're already in it)
        socket.emit('room:join', { code: code.toUpperCase(), username });

        socket.on('room:update', (updatedRoom: RoomState) => {
            // If game started, redirect immediately without updating state
            if (updatedRoom.phase !== 'lobby') {
                router.push(`/game/${code}`);
                return;
            }
            
            setRoom(updatedRoom);
            setLoading(false);
            
            // Update local settings state from room
            setMaxPlayers(updatedRoom.settings.maxPlayers);
            setDiscussionTime(updatedRoom.settings.discussionTime);
            setVotingTime(updatedRoom.settings.votingTime);
            setNightTime(updatedRoom.settings.nightTime);
            setEliminationResultTime(updatedRoom.settings.eliminationResultTime);
            setRoleRevealTime(updatedRoom.settings.roleRevealTime);
            setEnableDoctor(updatedRoom.settings.enableDoctor);
            setEnableDetective(updatedRoom.settings.enableDetective);
            setIsPublic(updatedRoom.settings.isPublic);
            
            if (updatedRoom.phase !== 'lobby') {
                router.push(`/game/${code}`);
            }
        });

        socket.on('room:error', (err: { reason: string }) => {
            showToast(err.reason, 'error');
            router.push('/');
        });

        socket.on('room:kicked', () => {
            showToast('You were kicked from the room', 'warning');
            router.push('/');
        });

        socket.on('room:closed', () => {
            showToast('Room was closed', 'info');
            router.push('/');
        });

        return () => {
            socket.off('room:update');
            socket.off('room:error');
            socket.off('room:kicked');
            socket.off('room:closed');
        };
    }, [socket, username, code, router, isAuthenticated, authLoading]);

    const handleReady = () => {
        if (!socket || !room) return;
        const me = room.players[playerId!];
        socket.emit('room:ready', { ready: !me?.ready });
    };

    const handleStart = () => {
        if (!socket) return;
        socket.emit('room:start');
    };

    const handleKick = (targetId: string) => {
        if (!socket) return;
        if (confirm('Kick this player?')) {
            socket.emit('room:kick', { targetId });
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(room?.code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = () => {
        if (socket) {
            socket.emit('room:leave');
        }
        router.push('/');
    };

    const handleUpdateSettings = (setting: string, value: number | boolean) => {
        if (!socket || !room || !isHost) return;
        
        const newSettings = {
            maxPlayers: setting === 'maxPlayers' ? (value as number) : maxPlayers,
            discussionTime: setting === 'discussionTime' ? (value as number) : discussionTime,
            votingTime: setting === 'votingTime' ? (value as number) : votingTime,
            nightTime: setting === 'nightTime' ? (value as number) : nightTime,
            eliminationResultTime: setting === 'eliminationResultTime' ? (value as number) : eliminationResultTime,
            roleRevealTime: setting === 'roleRevealTime' ? (value as number) : roleRevealTime,
            enableDoctor: setting === 'enableDoctor' ? (value as boolean) : enableDoctor,
            enableDetective: setting === 'enableDetective' ? (value as boolean) : enableDetective,
            isPublic: setting === 'isPublic' ? (value as boolean) : isPublic
        };
        
        socket.emit('room:updateSettings', { settings: newSettings });
    };

    if (loading || !room) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex items-center justify-center font-display">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="tracking-widest uppercase text-sm text-muted">Joining Lobby...</div>
                </div>
            </div>
        );
    }

    const me = room.players[playerId!];
    const isHost = me?.isHost;
    const players = Object.values(room.players);
    const canStart = players.length >= 4;

    return (
        <div className="bg-background-dark text-white font-display min-h-screen flex flex-col">
            <nav className="w-full px-6 py-4 border-b border-white/5 bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-3xl">skull</span>
                        <h1 className="text-xl font-bold tracking-tight">M<span className="text-primary">A</span>FIA</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Mobile Settings Button */}
                        <button 
                            onClick={() => setShowSettingsModal(true)}
                            className="lg:hidden text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <button onClick={handleLeave} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined">logout</span>
                            <span className="hidden sm:inline">Leave</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow flex flex-col lg:flex-row items-start justify-start py-8 px-4 md:px-6 w-full max-w-7xl mx-auto gap-6">
                {/* Left Column: Players */}
                <div className="w-full lg:flex-1 flex flex-col gap-6">
                    <div className="w-full text-center">
                        <p className="text-gray-500 uppercase tracking-[0.2em] text-xs font-bold mb-3">Lobby Access</p>
                        <div className="relative group inline-block">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-red-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-surface-dark border border-border-dark rounded-xl px-6 sm:px-8 py-4 flex items-center gap-4 sm:gap-6 shadow-2xl">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-widest font-mono">{room.code}</h2>
                                <div className="h-8 sm:h-10 w-px bg-gray-700"></div>
                                <button 
                                    onClick={handleCopyCode}
                                    className="flex items-center justify-center size-9 sm:size-10 rounded-lg hover:bg-white/10 text-gray-400 hover:text-primary transition-colors" 
                                    title="Copy Room Code"
                                >
                                    <span className="material-symbols-outlined text-xl sm:text-2xl">{copied ? 'check' : 'content_copy'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                            Players 
                            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-sm font-mono">{players.length}/{room.settings.maxPlayers}</span>
                        </h3>

                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {players.map(player => (
                            <div 
                                key={player.id}
                                className={`relative bg-surface-dark border border-border-dark rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-colors ${player.id === playerId ? 'ring-2 ring-primary/20' : ''}`}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="size-10 sm:size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-base sm:text-lg border-2 border-primary/20 flex-shrink-0">
                                        {player.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold flex items-center gap-2 flex-wrap">
                                            <span className="truncate">{player.username}</span>
                                            {player.isHost && <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded uppercase font-bold whitespace-nowrap">Host</span>}
                                            {player.id === playerId && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded uppercase font-bold whitespace-nowrap">You</span>}
                                        </span>
                                    </div>
                                </div>
                                {isHost && player.id !== playerId && (
                                    <button 
                                        onClick={() => handleKick(player.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 flex-shrink-0 ml-2"
                                        title="Kick player"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                    {isHost && (
                        <button
                            onClick={handleStart}
                            disabled={!canStart}
                            className={`flex-1 h-12 sm:h-14 rounded-xl font-bold text-base sm:text-lg transition-all ${
                                canStart
                                    ? 'bg-primary hover:bg-[#ff4d5a] text-white shadow-lg shadow-primary/20'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            START GAME
                        </button>
                    )}
                </div>

                {!canStart && (
                    <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
                        Need at least 4 players to start
                    </p>
                )}
                </div>

                {/* Right Column: Game Settings (Desktop) */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-24 bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col gap-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Game Settings
                        </h3>
                        <div className="flex flex-col gap-4">
                            {/* Max Players */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Max Players</span>
                                {isHost ? (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setMaxPlayers(Math.max(4, maxPlayers - 1)); handleUpdateSettings('maxPlayers', Math.max(4, maxPlayers - 1)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-white font-bold text-lg flex-1 text-center">{maxPlayers}</span>
                                        <button 
                                            onClick={() => { setMaxPlayers(Math.min(20, maxPlayers + 1)); handleUpdateSettings('maxPlayers', Math.min(20, maxPlayers + 1)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-white font-bold text-lg">{room.settings.maxPlayers}</span>
                                )}
                            </div>
                            
                            {/* Discussion Time */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Discussion Time</span>
                                {isHost ? (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setDiscussionTime(Math.max(30, discussionTime - 15)); handleUpdateSettings('discussionTime', Math.max(30, discussionTime - 15)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-white font-bold text-lg flex-1 text-center">{discussionTime}s</span>
                                        <button 
                                            onClick={() => { setDiscussionTime(Math.min(180, discussionTime + 15)); handleUpdateSettings('discussionTime', Math.min(180, discussionTime + 15)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-white font-bold text-lg">{room.settings.discussionTime}s</span>
                                )}
                            </div>
                            
                            {/* Voting Time */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Voting Time</span>
                                {isHost ? (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setVotingTime(Math.max(20, votingTime - 10)); handleUpdateSettings('votingTime', Math.max(20, votingTime - 10)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-white font-bold text-lg flex-1 text-center">{votingTime}s</span>
                                        <button 
                                            onClick={() => { setVotingTime(Math.min(120, votingTime + 10)); handleUpdateSettings('votingTime', Math.min(120, votingTime + 10)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-white font-bold text-lg">{room.settings.votingTime}s</span>
                                )}
                            </div>
                            
                            {/* Night Time */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Night Time</span>
                                {isHost ? (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setNightTime(Math.max(15, nightTime - 5)); handleUpdateSettings('nightTime', Math.max(15, nightTime - 5)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-white font-bold text-lg flex-1 text-center">{nightTime}s</span>
                                        <button 
                                            onClick={() => { setNightTime(Math.min(60, nightTime + 5)); handleUpdateSettings('nightTime', Math.min(60, nightTime + 5)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-white font-bold text-lg">{room.settings.nightTime}s</span>
                                )}
                            </div>
                            
                            {/* Elimination Result Time */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Result Screen Time</span>
                                {isHost ? (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setEliminationResultTime(Math.max(3, eliminationResultTime - 1)); handleUpdateSettings('eliminationResultTime', Math.max(3, eliminationResultTime - 1)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-white font-bold text-lg flex-1 text-center">{eliminationResultTime}s</span>
                                        <button 
                                            onClick={() => { setEliminationResultTime(Math.min(15, eliminationResultTime + 1)); handleUpdateSettings('eliminationResultTime', Math.min(15, eliminationResultTime + 1)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-white font-bold text-lg">{room.settings.eliminationResultTime}s</span>
                                )}
                            </div>
                            
                            {/* Role Reveal Time */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Role Reveal Time</span>
                                {isHost ? (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setRoleRevealTime(Math.max(3, roleRevealTime - 1)); handleUpdateSettings('roleRevealTime', Math.max(3, roleRevealTime - 1)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-white font-bold text-lg flex-1 text-center">{roleRevealTime}s</span>
                                        <button 
                                            onClick={() => { setRoleRevealTime(Math.min(20, roleRevealTime + 1)); handleUpdateSettings('roleRevealTime', Math.min(20, roleRevealTime + 1)); }}
                                            className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-white font-bold text-lg">{room.settings.roleRevealTime}s</span>
                                )}
                            </div>
                            
                            <div className="border-t border-white/10 my-2"></div>
                            
                            {/* Enable Doctor */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Doctor Role</span>
                                {isHost ? (
                                    <button
                                        onClick={() => { setEnableDoctor(!enableDoctor); handleUpdateSettings('enableDoctor', !enableDoctor); }}
                                        className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                            enableDoctor 
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                        }`}
                                    >
                                        {enableDoctor ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                ) : (
                                    <span className={`text-lg font-bold ${room.settings.enableDoctor ? 'text-green-400' : 'text-red-400'}`}>
                                        {room.settings.enableDoctor ? 'Enabled' : 'Disabled'}
                                    </span>
                                )}
                            </div>
                            
                            {/* Enable Detective */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Detective Role</span>
                                {isHost ? (
                                    <button
                                        onClick={() => { setEnableDetective(!enableDetective); handleUpdateSettings('enableDetective', !enableDetective); }}
                                        className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                                            enableDetective 
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                        }`}
                                    >
                                        {enableDetective ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                ) : (
                                    <span className={`text-lg font-bold ${room.settings.enableDetective ? 'text-green-400' : 'text-red-400'}`}>
                                        {room.settings.enableDetective ? 'Enabled' : 'Disabled'}
                                    </span>
                                )}
                            </div>
                            
                            {/* Lobby Visibility */}
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Lobby Visibility</span>
                                {isHost ? (
                                    <button
                                        onClick={() => { setIsPublic(!isPublic); handleUpdateSettings('isPublic', !isPublic); }}
                                        className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all ${
                                            isPublic 
                                                ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                                                : 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                                        }`}
                                    >
                                        {isPublic ? 'PUBLIC' : 'PRIVATE'}
                                    </button>
                                ) : (
                                    <span className={`text-lg font-bold ${
                                        room.settings.isPublic ? 'text-green-400' : 'text-blue-400'
                                    }`}>
                                        {room.settings.isPublic ? 'Public' : 'Private'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Settings Modal */}
                {showSettingsModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettingsModal(false)}>
                        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-bold text-lg uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl">settings</span>
                                    Game Settings
                                </h3>
                                <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="flex flex-col gap-4">
                                {/* Max Players */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Max Players</span>
                                    {isHost ? (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setMaxPlayers(Math.max(4, maxPlayers - 1)); handleUpdateSettings('maxPlayers', Math.max(4, maxPlayers - 1)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className="text-white font-bold text-xl flex-1 text-center">{maxPlayers}</span>
                                            <button 
                                                onClick={() => { setMaxPlayers(Math.min(20, maxPlayers + 1)); handleUpdateSettings('maxPlayers', Math.min(20, maxPlayers + 1)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-xl">{room.settings.maxPlayers}</span>
                                    )}
                                </div>
                                
                                {/* Discussion Time */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Discussion Time</span>
                                    {isHost ? (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setDiscussionTime(Math.max(30, discussionTime - 15)); handleUpdateSettings('discussionTime', Math.max(30, discussionTime - 15)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className="text-white font-bold text-xl flex-1 text-center">{discussionTime}s</span>
                                            <button 
                                                onClick={() => { setDiscussionTime(Math.min(180, discussionTime + 15)); handleUpdateSettings('discussionTime', Math.min(180, discussionTime + 15)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-xl">{room.settings.discussionTime}s</span>
                                    )}
                                </div>
                                
                                {/* Voting Time */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Voting Time</span>
                                    {isHost ? (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setVotingTime(Math.max(20, votingTime - 10)); handleUpdateSettings('votingTime', Math.max(20, votingTime - 10)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className="text-white font-bold text-xl flex-1 text-center">{votingTime}s</span>
                                            <button 
                                                onClick={() => { setVotingTime(Math.min(120, votingTime + 10)); handleUpdateSettings('votingTime', Math.min(120, votingTime + 10)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-xl">{room.settings.votingTime}s</span>
                                    )}
                                </div>
                                
                                {/* Night Time */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Night Time</span>
                                    {isHost ? (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setNightTime(Math.max(15, nightTime - 5)); handleUpdateSettings('nightTime', Math.max(15, nightTime - 5)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className="text-white font-bold text-xl flex-1 text-center">{nightTime}s</span>
                                            <button 
                                                onClick={() => { setNightTime(Math.min(60, nightTime + 5)); handleUpdateSettings('nightTime', Math.min(60, nightTime + 5)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-xl">{room.settings.nightTime}s</span>
                                    )}
                                </div>
                                
                                {/* Elimination Result Time */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Result Screen Time</span>
                                    {isHost ? (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setEliminationResultTime(Math.max(3, eliminationResultTime - 1)); handleUpdateSettings('eliminationResultTime', Math.max(3, eliminationResultTime - 1)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className="text-white font-bold text-xl flex-1 text-center">{eliminationResultTime}s</span>
                                            <button 
                                                onClick={() => { setEliminationResultTime(Math.min(15, eliminationResultTime + 1)); handleUpdateSettings('eliminationResultTime', Math.min(15, eliminationResultTime + 1)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-xl">{room.settings.eliminationResultTime}s</span>
                                    )}
                                </div>
                                
                                {/* Role Reveal Time */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Role Reveal Time</span>
                                    {isHost ? (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setRoleRevealTime(Math.max(3, roleRevealTime - 1)); handleUpdateSettings('roleRevealTime', Math.max(3, roleRevealTime - 1)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <span className="text-white font-bold text-xl flex-1 text-center">{roleRevealTime}s</span>
                                            <button 
                                                onClick={() => { setRoleRevealTime(Math.min(20, roleRevealTime + 1)); handleUpdateSettings('roleRevealTime', Math.min(20, roleRevealTime + 1)); }}
                                                className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-xl">{room.settings.roleRevealTime}s</span>
                                    )}
                                </div>
                                
                                <div className="border-t border-white/10 my-2"></div>
                                
                                {/* Enable Doctor */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Doctor Role</span>
                                    {isHost ? (
                                        <button
                                            onClick={() => { setEnableDoctor(!enableDoctor); handleUpdateSettings('enableDoctor', !enableDoctor); }}
                                            className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all ${
                                                enableDoctor 
                                                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                                                    : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                                            }`}
                                        >
                                            {enableDoctor ? 'ENABLED' : 'DISABLED'}
                                        </button>
                                    ) : (
                                        <span className={`text-xl font-bold ${room.settings.enableDoctor ? 'text-green-400' : 'text-red-400'}`}>
                                            {room.settings.enableDoctor ? 'Enabled' : 'Disabled'}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Enable Detective */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Detective Role</span>
                                    {isHost ? (
                                        <button
                                            onClick={() => { setEnableDetective(!enableDetective); handleUpdateSettings('enableDetective', !enableDetective); }}
                                            className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all ${
                                                enableDetective 
                                                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                                                    : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                                            }`}
                                        >
                                            {enableDetective ? 'ENABLED' : 'DISABLED'}
                                        </button>
                                    ) : (
                                        <span className={`text-xl font-bold ${room.settings.enableDetective ? 'text-green-400' : 'text-red-400'}`}>
                                            {room.settings.enableDetective ? 'Enabled' : 'Disabled'}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Lobby Visibility */}
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Lobby Visibility</span>
                                    {isHost ? (
                                        <button
                                            onClick={() => { setIsPublic(!isPublic); handleUpdateSettings('isPublic', !isPublic); }}
                                            className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all ${
                                                isPublic 
                                                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                                                    : 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                                            }`}
                                        >
                                            {isPublic ? 'PUBLIC' : 'PRIVATE'}
                                        </button>
                                    ) : (
                                        <span className={`text-xl font-bold ${
                                            room.settings.isPublic ? 'text-green-400' : 'text-blue-400'
                                        }`}>
                                            {room.settings.isPublic ? 'Public' : 'Private'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}