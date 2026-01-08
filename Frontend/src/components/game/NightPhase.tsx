'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState, Player } from '@/types';
import { Timer } from './Timer';

interface NightPhaseProps {
    room: RoomState;
}

export function NightPhase({ room }: NightPhaseProps) {
    const { socket, playerId, username } = useGame();
    const me = playerId ? room.players[playerId] : null;

    if (!me) return <div>Loading...</div>;

    if (me.role === 'mafia') {
        return <MafiaNightView room={room} me={me} socket={socket} username={username} />;
    }
    
    if (me.role === 'doctor' || me.role === 'detective') {
        return <ActionNightView room={room} me={me} socket={socket} />;
    }

    return <VillagerNightView room={room} />;
}

function VillagerNightView({ room }: { room: RoomState }) {
    return (
        <div className="relative z-10 flex flex-col h-full w-full max-w-5xl mx-auto px-6 pt-8 pb-32 md:px-12 md:pt-12">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Red glow top left */}
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                {/* Darker fog bottom right */}
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#2a1a1b] rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Header Section */}
            <header className="flex flex-col items-center justify-center gap-6 mb-8">
                {/* Timer Component */}
                <div className="bg-[#1a1d24] border border-white/5 rounded-full px-5 py-2 flex items-center gap-3 shadow-lg">
                    <span className="material-symbols-outlined text-primary animate-pulse" style={{fontVariationSettings: "'FILL' 1"}}>timer</span>
                    <Timer timerEnd={room.timerEnd} duration={room.settings.nightTime} />
                </div>
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
        if (!input.trim() || !socket) return;
        socket.emit('mafia:message', { message: input });
        setInput("");
    };

    const handleAction = (pid: string) => {
        setTargetId(pid);
        socket?.emit('action:mafiaKill', { targetId: pid });
    };

    return (
        <div className="relative z-10 flex flex-col h-full w-full max-w-7xl mx-auto px-6 pt-8 pb-8 md:px-12 md:pt-12">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#2a1a1b] rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Header Section */}
            <header className="flex flex-col items-center justify-center gap-6 mb-8">
                {/* Timer Component */}
                <div className="bg-[#1a1d24] border border-white/5 rounded-full px-5 py-2 flex items-center gap-3 shadow-lg">
                    <span className="material-symbols-outlined text-primary animate-pulse" style={{fontVariationSettings: "'FILL' 1"}}>timer</span>
                    <Timer timerEnd={room.timerEnd} duration={room.settings.nightTime} />
                </div>
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
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
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
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:border-primary outline-none transition-colors"
                                placeholder="Coordinate with your team..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg text-sm font-bold transition-colors">
                                <span className="material-symbols-outlined text-lg">send</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Target Selection */}
                <div className="flex-1 flex flex-col min-h-[400px]">
                    <h2 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(230,55,67,0.5)]"></span>
                        Choose a target:
                    </h2>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar">
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
                                        <span className="material-symbols-outlined text-2xl">person</span>
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

function ActionNightView({ room, me, socket }: { room: RoomState, me: Player, socket: any }) {
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
        <div className="relative z-10 flex flex-col h-full w-full max-w-5xl mx-auto px-6 pt-8 pb-32 md:px-12 md:pt-12">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen opacity-10`} style={{backgroundColor: roleColor}}></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#2a1a1b] rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Header Section */}
            <header className="flex flex-col items-center justify-center gap-6 mb-8">
                {/* Timer Component */}
                <div className="bg-[#1a1d24] border border-white/5 rounded-full px-5 py-2 flex items-center gap-3 shadow-lg">
                    <span className={`material-symbols-outlined ${actionColor} animate-pulse`} style={{fontVariationSettings: "'FILL' 1"}}>timer</span>
                    <Timer timerEnd={room.timerEnd} duration={room.settings.nightTime} />
                </div>
                {/* Title Group */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm leading-tight">
                        NIGHT
                    </h1>
                    <p className="text-[#c79497] font-medium text-lg tracking-wide uppercase opacity-80">The city sleeps...</p>
                </div>
            </header>

            {/* Role Context */}
            <div className="w-full flex justify-center mb-10">
                <div className={`border ${borderColor}/20 rounded-lg px-4 py-2 flex items-center gap-2`} style={{backgroundColor: `${roleColor}10`}}>
                    <span className={`material-symbols-outlined ${actionColor} text-sm`}>visibility_off</span>
                    <span className={`${actionColor} text-sm font-bold tracking-wide`}>ROLE: {isDoctor ? 'DOCTOR' : 'DETECTIVE'}</span>
                </div>
            </div>

            {/* Selection Grid */}
            <main className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3 self-start md:self-center">
                    <span className={`w-1.5 h-6 ${actionBg} rounded-full`} style={{boxShadow: `0 0 10px ${roleColor}80`}}></span>
                    {isDoctor ? 'Choose a player to save:' : 'Choose a player to investigate:'}
                </h2>
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.values(room.players).map(p => {
                        if (!p.isAlive) return null;
                        const isSelected = targetId === p.id;

                        return (
                            <button
                                key={p.id}
                                onClick={() => handleAction(p.id)}
                                className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 transform ${
                                    isSelected
                                        ? `${borderColor} shadow-[0_0_25px_rgba(59,130,246,0.2)] scale-[1.02]`
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
                                    <span className="material-symbols-outlined text-3xl">person</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-white text-lg leading-tight">{p.username}</p>
                                    <p className="text-xs text-white/40 uppercase mt-1">{isDoctor ? 'Protect' : 'Inspect'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}