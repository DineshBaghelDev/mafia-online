'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState, Player } from '@/types';

interface NightPhaseProps {
    room: RoomState;
    inspectResult?: {targetId: string, isMafia: boolean} | null;
    investigationHistory?: Map<string, boolean>;
}

export function NightPhase({ room, inspectResult, investigationHistory }: NightPhaseProps) {
    const { socket, playerId, username } = useGame();
    const me = playerId ? room.players[playerId] : null;

    if (!me) return <div>Loading...</div>;

    // Ghost view for dead players
    if (!me.isAlive) {
        return <GhostNightView room={room} socket={socket} />;
    }

    if (me.role === 'mafia') {
        return <MafiaNightView room={room} me={me} socket={socket} username={username} />;
    }
    
    if (me.role === 'doctor' || me.role === 'detective') {
        return <ActionNightView room={room} me={me} socket={socket} inspectResult={inspectResult} investigationHistory={investigationHistory} />;
    }

    return <VillagerNightView room={room} />;
}

function VillagerNightView({ room }: { room: RoomState }) {
    return (
        <div className="relative flex flex-col h-full w-full max-w-5xl mx-auto px-6 pt-8 pb-32 md:px-12 md:pt-12">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                {/* Red glow top left */}
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                {/* Darker fog bottom right */}
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#2a1a1b] rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Header Section */}
            <header className="relative z-10 flex flex-col items-center justify-center gap-6 mb-8">
                {/* Title Group */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm leading-tight">
                        NIGHT
                    </h1>
                    <p className="text-[#c79497] font-medium text-lg tracking-wide uppercase opacity-80">The city sleeps...</p>
                </div>
            </header>

            {/* Body Content */}
            <main className="flex-1 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[120px] text-white/10 animate-pulse mb-6">bedtime</span>
                <p className="text-white/50 text-xl font-medium max-w-md text-center">
                    You are sleeping. The Mafia is choosing their victim.
                    <br /><br />
                    Pray you wake up in the morning.
                </p>
            </main>
        </div>
    );
}

function MafiaNightView({ room, me, socket, username }: { room: RoomState, me: Player, socket: any, username: string | null }) {
    const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
    const [input, setInput] = useState("");
    const [targetId, setTargetId] = useState<string | null>(null);

    // Mock Chat Update
    useEffect(() => {
        // Listen for mafia chat messages
        const handleMafiaMessage = (data: { senderId: string; senderName: string; message: string }) => {
            setMessages(prev => [...prev, { sender: data.senderName, text: data.message }]);
        };

        socket?.on('mafia:message', handleMafiaMessage);
        
        return () => {
            socket?.off('mafia:message', handleMafiaMessage);
        };
    }, [socket]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socket || !me.isAlive) return;
        socket.emit('mafia:message', { message: input });
        setInput("");
    };

    const handleAction = (pid: string) => {
        if (!me.isAlive) return;
        setTargetId(pid);
        socket?.emit('action:mafiaKill', { targetId: pid });
    };

    return (
        <div className="relative flex flex-col h-full w-full max-w-7xl mx-auto px-6 pt-8 pb-8 md:px-12 md:pt-12">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#2a1a1b] rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Header Section */}
            <header className="relative z-10 flex flex-col items-center justify-center gap-6 mb-8">
                {/* Title Group */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm leading-tight">
                        NIGHT
                    </h1>
                    <p className="text-[#c79497] font-medium text-lg tracking-wide uppercase opacity-80">The city sleeps...</p>
                </div>
            </header>

            {/* Role Context */}
            <div className="w-full flex justify-center mb-6">
                <div className="bg-[#e63743]/10 border border-[#e63743]/20 rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">visibility_off</span>
                    <span className="text-primary text-sm font-bold tracking-wide">ROLE: MAFIA (Private Chat Active)</span>
                </div>
            </div>

            {/* Two Column Layout: Chat & Voting */}
            <main className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Left: Mafia Private Chat */}
                <div className="flex-1 flex flex-col bg-[#1a1d24]/50 border border-white/5 rounded-2xl overflow-hidden min-h-[400px]">
                    <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-lg">lock</span>
                        <div>
                            <h3 className="text-white font-bold text-sm uppercase tracking-wide">Mafia Chat</h3>
                            <p className="text-white/40 text-xs">Coordinate with your team</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[400px]">
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full text-white/30 text-sm">
                                No messages yet. Start coordinating!
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col gap-1 ${m.sender === username ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] text-white/40 uppercase font-bold">{m.sender}</span>
                                <div className={`p-3 rounded-xl text-sm max-w-[85%] ${
                                    m.sender === username 
                                        ? 'bg-primary/20 text-white rounded-tr-none' 
                                        : 'bg-white/5 text-white/90 rounded-tl-none'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={handleSend} className="p-3 bg-black/30 border-t border-white/5">
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder={me.isAlive ? "Coordinate with your team..." : "You cannot chat while dead"}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={!me.isAlive}
                            />
                            <button type="submit" disabled={!me.isAlive} className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="material-symbols-outlined text-lg">send</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Target Selection */}
                <div className="flex-1 flex flex-col min-h-[400px]">
                    <h2 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(230,55,67,0.5)]"></span>
                        {me.isAlive ? 'Choose a target:' : 'You cannot act while dead'}
                    </h2>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar p-1">
                        {Object.values(room.players).map(p => {
                            if (!p.isAlive) return null;
                            const isTeammate = p.role === 'mafia';
                            const isSelected = targetId === p.id;

                            if (isTeammate) {
                                return (
                                    <div key={p.id} className="relative flex flex-col items-center gap-3 p-4 rounded-xl bg-[#321a1c]/50 border border-[#e63743]/30 opacity-60 cursor-not-allowed">
                                        <div className="absolute top-2 right-2 text-primary/50">
                                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>skull</span>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-[#e63743]/20 flex items-center justify-center text-[#e63743]">
                                            <span className="material-symbols-outlined text-2xl">person</span>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-white text-sm leading-tight">{p.username}</p>
                                            <p className="text-xs text-[#e63743] font-bold uppercase mt-1">Ally</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => handleAction(p.id)}
                                    className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-[#321a1c] border-[#e63743] shadow-[0_0_15px_rgba(230,55,67,0.3)] scale-[1.02]'
                                            : 'bg-[#1a1d24] border-white/10 hover:border-white/20 hover:bg-[#252932]'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-primary animate-bounce">
                                            <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                        </div>
                                    )}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                                        isSelected ? 'bg-[#e63743]/20 text-[#e63743]' : 'bg-white/5 text-white/60'
                                    }`}>
                                        <span className="font-bold text-xl">{p.username[0].toUpperCase()}</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-white text-sm leading-tight">{p.username}</p>
                                        <p className="text-xs text-white/40 uppercase mt-1">Target</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
function GhostNightView({ room, socket }: { room: RoomState, socket: any }) {
    const [mafiaTarget, setMafiaTarget] = useState<string | null>(null);
    const [doctorTarget, setDoctorTarget] = useState<string | null>(null);
    const [detectiveTarget, setDetectiveTarget] = useState<string | null>(null);
    const [mafiaMessages, setMafiaMessages] = useState<{sender: string, text: string}[]>([]);

    useEffect(() => {
        if (!socket) return;

        // Listen for night actions from other players
        const handleMafiaKill = (data: { playerId: string; targetId: string }) => {
            setMafiaTarget(data.targetId);
        };

        const handleDoctorSave = (data: { playerId: string; targetId: string }) => {
            setDoctorTarget(data.targetId);
        };

        const handleDetectiveInspect = (data: { playerId: string; targetId: string }) => {
            setDetectiveTarget(data.targetId);
        };

        const handleMafiaMessage = (data: { senderId: string; senderName: string; message: string }) => {
            setMafiaMessages(prev => [...prev, { sender: data.senderName, text: data.message }]);
        };

        socket.on('ghost:mafiaKill', handleMafiaKill);
        socket.on('ghost:doctorSave', handleDoctorSave);
        socket.on('ghost:detectiveInspect', handleDetectiveInspect);
        socket.on('ghost:mafiaChat', handleMafiaMessage);

        return () => {
            socket.off('ghost:mafiaKill', handleMafiaKill);
            socket.off('ghost:doctorSave', handleDoctorSave);
            socket.off('ghost:detectiveInspect', handleDetectiveInspect);
            socket.off('ghost:mafiaChat', handleMafiaMessage);
        };
    }, [socket]);

    const getMafiaTargetName = () => {
        if (!mafiaTarget) return 'None yet';
        return room.players[mafiaTarget]?.username || 'Unknown';
    };

    const getDoctorTargetName = () => {
        if (!doctorTarget) return 'None yet';
        return room.players[doctorTarget]?.username || 'Unknown';
    };

    const getDetectiveTargetName = () => {
        if (!detectiveTarget) return 'None yet';
        return room.players[detectiveTarget]?.username || 'Unknown';
    };

    return (
        <div className="relative flex flex-col h-full w-full max-w-6xl mx-auto px-6 pt-8 pb-8 md:px-12 md:pt-12">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#2a1a1b] rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 flex flex-col items-center justify-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400 text-4xl">skull</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-300 to-gray-500">
                        SPECTATING
                    </h1>
                </div>
                <p className="text-gray-400 font-medium text-base tracking-wide">Watch the night unfold as a ghost...</p>
            </header>

            {/* Content Grid */}
            <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Night Actions */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">visibility</span>
                        Night Actions
                    </h3>

                    {/* Mafia Kill */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-red-400 text-xl">dangerous</span>
                            <h4 className="text-red-400 font-bold text-sm uppercase">Mafia Target</h4>
                        </div>
                        <p className="text-white text-lg font-bold">{getMafiaTargetName()}</p>
                    </div>

                    {/* Doctor Save */}
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-cyan-400 text-xl">medical_services</span>
                            <h4 className="text-cyan-400 font-bold text-sm uppercase">Doctor Protecting</h4>
                        </div>
                        <p className="text-white text-lg font-bold">{getDoctorTargetName()}</p>
                    </div>

                    {/* Detective Inspect */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-400 text-xl">search</span>
                            <h4 className="text-blue-400 font-bold text-sm uppercase">Detective Investigating</h4>
                        </div>
                        <p className="text-white text-lg font-bold">{getDetectiveTargetName()}</p>
                    </div>
                </div>

                {/* Mafia Chat */}
                <div className="bg-surface-dark/30 border border-white/5 rounded-xl p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-red-400 text-xl">forum</span>
                        <h3 className="text-xl font-bold text-white">Mafia Chat</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] max-h-[400px]">
                        {mafiaMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 text-sm italic">No messages yet...</p>
                            </div>
                        ) : (
                            mafiaMessages.map((msg, idx) => (
                                <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-red-400 font-bold text-xs mb-1">{msg.sender}</p>
                                    <p className="text-white text-sm">{msg.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
function ActionNightView({ room, me, socket, inspectResult, investigationHistory }: { room: RoomState, me: Player, socket: any, inspectResult?: {targetId: string, isMafia: boolean} | null, investigationHistory?: Map<string, boolean> }) {
    const [targetId, setTargetId] = useState<string | null>(null);
    const isDoctor = me.role === 'doctor';
    const roleColor = isDoctor ? '#20e0d0' : '#3b82f6';
    const actionColor = isDoctor ? 'text-[#20e0d0]' : 'text-blue-500';
    const actionBg = isDoctor ? 'bg-[#20e0d0]' : 'bg-blue-500';
    const borderColor = isDoctor ? 'border-[#20e0d0]' : 'border-blue-500';
    
    const handleAction = (pid: string) => {
        setTargetId(pid);
        if (isDoctor) {
            socket?.emit('action:doctorSave', { targetId: pid });
        } else {
            socket?.emit('action:detectiveInspect', { targetId: pid });
        }
    };

    return (
        <div className="relative flex flex-col h-full w-full max-w-5xl mx-auto px-6 pt-8 pb-32 md:px-12 md:pt-12">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className={`absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen opacity-10`} style={{backgroundColor: roleColor}}></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#2a1a1b] rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Header Section */}
            <header className="relative z-10 flex flex-col items-center justify-center gap-6 mb-8">
                {/* Title Group */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm leading-tight">
                        NIGHT
                    </h1>
                    <p className="text-[#c79497] font-medium text-lg tracking-wide uppercase opacity-80">The city sleeps...</p>
                </div>
            </header>

            {/* Role Context */}
            <div className="w-full flex flex-col items-center gap-4 mb-10">
                <div className={`border ${borderColor}/20 rounded-lg px-4 py-2 flex items-center gap-2`} style={{backgroundColor: `${roleColor}10`}}>
                    <span className={`material-symbols-outlined ${actionColor} text-sm`}>visibility_off</span>
                    <span className={`${actionColor} text-sm font-bold tracking-wide`}>ROLE: {isDoctor ? 'DOCTOR' : 'DETECTIVE'}</span>
                </div>
                
                {/* Detective Inspect Result */}
                {!isDoctor && inspectResult && (
                    <div className={`w-full max-w-md bg-blue-500/20 border-2 border-blue-500/50 rounded-xl p-4 flex items-center gap-3 animate-pulse`}>
                        <span className="material-symbols-outlined text-blue-400 text-2xl">badge</span>
                        <div>
                            <p className="text-white font-bold text-sm">Investigation Result:</p>
                            <p className="text-blue-300 text-xs">
                                {room.players[inspectResult.targetId]?.username || 'Unknown'} is {inspectResult.isMafia ? <span className="text-red-400 font-bold">MAFIA!</span> : <span className="text-green-400">INNOCENT</span>}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Selection Grid */}
            <main className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3 self-start md:self-center">
                    <span className={`w-1.5 h-6 ${actionBg} rounded-full`} style={{boxShadow: `0 0 10px ${roleColor}80`}}></span>
                    {isDoctor ? 'Choose a player to save:' : 'Choose a player to investigate:'}
                </h2>
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                    {Object.values(room.players).map(p => {
                        if (!p.isAlive) return null;
                        const isSelected = targetId === p.id;
                        const previouslyInvestigated = !isDoctor && investigationHistory?.has(p.id);
                        const investigationResult = previouslyInvestigated ? investigationHistory!.get(p.id) : null;

                        return (
                            <button
                                key={p.id}
                                onClick={() => handleAction(p.id)}
                                className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 transform ${
                                    isSelected
                                        ? `${borderColor} shadow-[0_0_25px_rgba(59,130,246,0.2)] scale-[1.02]`
                                        : previouslyInvestigated
                                            ? investigationResult
                                                ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                                                : 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                                            : 'bg-[#1a1d24] border-white/10 hover:border-white/20 hover:bg-[#252932]'
                                }`}
                                style={isSelected ? {backgroundColor: `${roleColor}10`} : {}}
                            >
                                {isSelected && (
                                    <div className={`absolute top-3 right-3 ${actionColor} animate-bounce`}>
                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                    </div>
                                )}
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                                    isSelected ? `${actionColor}` : 'bg-white/5 text-white/60'
                                }`}
                                style={isSelected ? {backgroundColor: `${roleColor}20`} : {}}
                                >
                                    <span className="font-bold text-2xl">{p.username[0].toUpperCase()}</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-white text-lg leading-tight">{p.username}</p>
                                    {previouslyInvestigated && investigationResult !== null && !isDoctor ? (
                                        <p className={`text-xs font-bold uppercase mt-1 ${investigationResult ? 'text-red-400' : 'text-green-400'}`}>
                                            {investigationResult ? 'MAFIA' : 'INNOCENT'}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-white/40 uppercase mt-1">{isDoctor ? 'Protect' : 'Inspect'}</p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}