'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState, Player } from '@/types';

interface DayPhaseProps {
    room: RoomState;
}

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
}

export function DayPhase({ room }: DayPhaseProps) {
    const { socket, username } = useGame();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Mock Messages to match design
    useEffect(() => {
        setMessages([
            { id: '1', sender: 'System', text: 'Discussion Started', timestamp: Date.now(), isSystem: true },
             // Mock messages for preview
            { id: '2', sender: 'Sam', text: 'No way, I was doing tasks in Electrical with Blue. We were together the whole round!', timestamp: Date.now() - 60000 },
            { id: '3', sender: 'Maya', text: "It's obviously Sam. He was acting super sus near the vents.", timestamp: Date.now() - 120000 },
        ]);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const onMessage = (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        };

        socket.on('chat:message', onMessage);

        return () => {
            socket.off('chat:message', onMessage);
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Optimistic update
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: username || 'You',
            text: inputText,
            timestamp: Date.now()
        };
        
        // In real app, we emit and wait for server to broadcast back, but for fluidity we can add it local too (or de-dupe)
        // socket?.emit('chat:message', { text: inputText });
        
        // For this demo without backend chat logic:
        setMessages(prev => [...prev, newMessage]);
        setInputText("");
    };

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full w-full max-w-[960px] mx-auto p-4 md:p-6 gap-6">
            {/* Phase Indicator */}
            <div className="w-full flex flex-col items-center justify-center py-2 animate-fade-in shrink-0">
                <h1 className="text-primary text-5xl md:text-6xl font-black tracking-tighter drop-shadow-lg">DAY 1</h1>
                <p className="text-muted text-lg font-medium tracking-widest uppercase mt-1">Discussion Phase</p>
            </div>

            {/* Elimination Banner (Mock) */}
            {/* 
            <div className="w-full shrink-0">
                <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent p-1">
                    <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-background-dark/80 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 shrink-0">
                            <span className="material-symbols-outlined text-primary text-3xl">skull</span>
                        </div>
                        <div className="flex flex-1 flex-col gap-1 text-center md:text-left">
                            <p className="text-white text-xl font-bold leading-tight">Alex was eliminated</p>
                            <p className="text-muted text-sm font-medium">The town wakes up to find one less villager. Discussion is now open.</p>
                        </div>
                    </div>
                </div>
            </div>
            */}

            {/* Chat Container */}
            <div className="flex flex-col w-full min-h-0 grow bg-surface-dark/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col custom-scrollbar">
                     <div className="flex-1"></div> {/* Spacer to push messages down if few */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-1 ${msg.sender === username ? 'items-end' : 'items-start'}`}>
                            {msg.isSystem ? (
                                <div className="flex justify-center py-2 w-full">
                                    <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-muted font-medium uppercase tracking-wider">{msg.text}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`${msg.sender === username ? 'text-primary' : 'text-white'} font-bold text-sm`}>{msg.sender}</span>
                                        <span className="text-gray-500 text-xs">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div className={`p-3 rounded-xl text-white text-base leading-relaxed w-fit max-w-[85%] ${
                                        msg.sender === username 
                                          ? 'bg-primary/20 border border-primary/20 rounded-tr-none' 
                                          : 'bg-white/5 border border-white/5 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface-dark border-t border-white/10 shrink-0">
                    <form className="flex gap-3" onSubmit={handleSendMessage}>
                        <div className="relative grow">
                            <input 
                                className="w-full h-12 pl-4 pr-10 bg-black/30 text-white placeholder-gray-500 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium" 
                                placeholder="Type your defense..." 
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <span className="material-symbols-outlined text-sm">sentiment_satisfied</span>
                            </div>
                        </div>
                        <button 
                            className="h-12 px-6 bg-primary hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20" 
                            type="submit"
                        >
                            <span className="hidden md:inline">SEND</span>
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}