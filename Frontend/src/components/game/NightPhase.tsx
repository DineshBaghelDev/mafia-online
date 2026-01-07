'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState, Player } from '@/types';

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
    
    if (me.role === 'doctor' || me.role === 'sheriff') {
        return <ActionNightView room={room} me={me} socket={socket} />;
    }

    return <VillagerNightView />;
}

function VillagerNightView() {
    return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-fade-in relative z-10">
            <span className="material-symbols-outlined text-[120px] text-white/10 animate-pulse mb-8">bedtime</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Night has fallen</h2>
            <p className="text-white/50 text-xl font-medium max-w-md">
                You are sleeping. The Mafia is choosing their victim.
                <br /><br />
                Pray you wake up.
            </p>
        </div>
    );
}

function MafiaNightView({ room, me, socket, username }: { room: RoomState, me: Player, socket: any, username: string | null }) {
    const [messages, setMessages] = useState<{sender: string, text: string}[]>([]);
    const [input, setInput] = useState("");
    const [targetId, setTargetId] = useState<string | null>(null);

    // Mock Chat Update
    useEffect(() => {
        // Here we would listen for 'mafia:message'
        setMessages([
            { sender: "System", text: "Discuss who to eliminate" }
        ]);
    }, []);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages(prev => [...prev, { sender: username || 'Me', text: input }]);
        setInput("");
        // socket.emit('mafia:message', { text: input });
    };

    const handleAction = (pid: string) => {
        setTargetId(pid);
        socket?.emit('game:action', { action: 'kill', targetId: pid });
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 gap-6">
            <header className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                        <h2 className="text-white font-bold uppercase tracking-widest text-sm">Mafia Chat</h2>
                        <p className="text-white/40 text-xs">Private Channel</p>
                    </div>
                </div>
                <div className="text-red-500 font-bold text-sm animate-pulse">KILL PHASE</div>
            </header>

            <div className="flex-1 min-h-0 grid md:grid-cols-2 gap-6">
                {/* Chat */}
                <div className="bg-black/40 border border-white/5 rounded-xl flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col gap-1 ${m.sender === username || m.sender === 'Me' ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] text-white/40 uppercase font-bold">{m.sender}</span>
                                <div className={`p-3 rounded-xl text-sm max-w-[85%] ${m.sender === 'System' ? 'bg-white/10 text-center w-full max-w-none' : 'bg-white/5 border border-white/5'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSend} className="p-3 bg-white/5">
                        <input 
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-red-500 outline-none transition-colors"
                            placeholder="Discuss strategy..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </form>
                </div>

                {/* Targets */}
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-white/40 text-xs font-bold uppercase mb-2">Select Target</p>
                    {Object.values(room.players).map(p => {
                        if (!p.isAlive) return null;
                        // Don't kill other mafia? logic depends on variant, usually mafia know each other and don't kill or can't
                        const isTeammate = p.role === 'mafia';
                        if (isTeammate && p.id !== me.id) return (
                            <div key={p.id} className="p-3 bg-red-900/20 border border-red-500/20 rounded-xl opacity-50 flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-500">skull</span>
                                <span className="text-red-400 font-bold text-sm">{p.username} (Ally)</span>
                            </div>
                        );

                        if (isTeammate) return null; // Don't show self in kill list, or show disabled

                        const isSelected = targetId === p.id;
                        return (
                            <button 
                                key={p.id}
                                onClick={() => handleAction(p.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                    isSelected 
                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">person</span>
                                    </div>
                                    <span className="font-bold text-sm">{p.username}</span>
                                </div>
                                {isSelected && <span className="material-symbols-outlined text-sm">check_circle</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ActionNightView({ room, me, socket }: { room: RoomState, me: Player, socket: any }) {
    const [targetId, setTargetId] = useState<string | null>(null);
    const isDoctor = me.role === 'doctor';
    const actionColor = isDoctor ? 'text-green-500' : 'text-blue-500';
    const actionBg = isDoctor ? 'bg-green-500' : 'bg-blue-500';
    const actionBorder = isDoctor ? 'border-green-500' : 'border-blue-500';
    
    const handleAction = (pid: string) => {
        setTargetId(pid);
        socket?.emit('game:action', { action: isDoctor ? 'save' : 'check', targetId: pid });
    };

    return (
        <div className="flex flex-col h-full items-center max-w-lg mx-auto p-6 md:p-10 w-full animate-fade-in relative z-10">
            <div className="text-center mb-10">
                 <h2 className={`text-3xl font-black uppercase tracking-tighter mb-2 ${actionColor}`}>
                    {isDoctor ? 'Protect a Player' : 'Investigate Suspicion'}
                 </h2>
                 <p className="text-white/60 text-sm">
                    {isDoctor ? 'Choose a player to save from the Mafia execution.' : 'Choose a player to reveal their alignment.'}
                 </p>
            </div>

            <div className="w-full grid gap-3 overflow-y-auto custom-scrollbar max-h-[60vh] pb-4 px-2">
                 {Object.values(room.players).map(p => {
                     if (!p.isAlive || p.id === me.id) return null; // Can doctor save self? Depends on rules. Assuming no for now.

                     const isSelected = targetId === p.id;
                      return (
                            <button 
                                key={p.id}
                                onClick={() => handleAction(p.id)}
                                className={`p-4 rounded-xl border flex items-center justify-between transition-all group ${
                                    isSelected 
                                    ? `${actionBg} text-white shadow-lg shadow-current` 
                                    : `bg-white/5 ${actionBorder}/20 hover:bg-white/10 text-gray-300 border-transparent`
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-base">{p.username}</div>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-white bg-white' : 'border-white/20'}`}>
                                    {isSelected && <span className={`material-symbols-outlined text-sm ${isDoctor ? 'text-green-600' : 'text-blue-600'} font-bold`}>check</span>}
                                </div>
                            </button>
                        );
                 })}
            </div>
        </div>
    );
}