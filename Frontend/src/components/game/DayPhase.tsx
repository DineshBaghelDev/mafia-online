'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState } from '@/types';

interface DayPhaseProps {
    room: RoomState;
    inspectResult?: { targetId: string; isMafia: boolean } | null;
    onClearInspect?: () => void;
    investigationHistory?: Map<string, boolean>;
    chatMessages?: ChatMessage[];
    setChatMessages?: (messages: ChatMessage[]) => void;
}

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
    isGhost?: boolean;
}

export function DayPhase({ room, inspectResult, onClearInspect, investigationHistory, chatMessages: externalMessages, setChatMessages: setExternalMessages }: DayPhaseProps) {
    const { socket, username, playerId } = useGame();
    const [messages, setMessages] = useState<ChatMessage[]>(externalMessages || []);
    const [inputText, setInputText] = useState('');
    const [showChatMobile, setShowChatMobile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const me = playerId ? room.players[playerId] : null;
    const isAlive = me?.isAlive ?? false;

    useEffect(() => {
        if (messages.length === 0) {
            const initialMsg = [{ id: 'system-start', sender: 'System', text: 'Discussion Started', timestamp: Date.now(), isSystem: true }];
            setMessages(initialMsg);
            if (setExternalMessages) setExternalMessages(initialMsg);
        }
    }, []);

    useEffect(() => {
        if (!socket) return;

        const onMessage = (data: { senderId: string; senderName: string; message: string; timestamp: number; isGhost?: boolean }) => {
            const newMessage = {
                id: `${data.timestamp}-${data.senderId}`,
                sender: data.senderName,
                text: data.message,
                timestamp: data.timestamp,
                isGhost: !!data.isGhost,
                isSystem: false,
            };
            setMessages(prev => {
                const updated = [...prev, newMessage];
                if (setExternalMessages) setExternalMessages(updated);
                return updated;
            });
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
        if (!socket) return;
        if (!inputText.trim()) return;

        socket.emit('chat:send', { message: inputText, isGhost: !isAlive });
        setInputText('');
    };

    const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const leftPaneClass = (showChatMobile ? 'hidden ' : 'flex ') + 'md:flex flex-col w-full md:w-80 shrink-0 gap-3';
    const rightPaneClass = (showChatMobile ? 'flex ' : 'hidden ') + 'md:flex flex-col flex-1 min-h-0 bg-surface-dark/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl';

    return (
        <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto p-4 md:p-6 gap-4">
            <div className="w-full flex flex-col items-center justify-center gap-3 py-2 animate-fade-in shrink-0">
                <div className="text-center">
                    <h1 className="text-primary text-4xl md:text-5xl font-black tracking-tighter drop-shadow-lg">DAY {room.currentRound}</h1>
                    <p className="text-muted text-base font-medium tracking-widest uppercase mt-1">Discussion Phase</p>
                </div>
            </div>

            {room.nightResult && (
                room.nightResult.saved ? (
                    <div className="w-full shrink-0">
                        <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/20 via-green-500/5 to-transparent p-1">
                            <div className="flex flex-col md:flex-row items-center gap-3 p-3 bg-background-dark/80 backdrop-blur-sm rounded-lg">
                                <div className="flex items-center justify-center size-10 rounded-full bg-green-500/20 shrink-0">
                                    <span className="material-symbols-outlined text-green-400 text-2xl">nights_stay</span>
                                </div>
                                <div className="flex flex-1 flex-col gap-1 text-center md:text-left">
                                    <p className="text-white text-lg font-bold leading-tight">A quiet night...</p>
                                    <p className="text-green-300 text-xs font-medium">The doctor saved someone!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : room.nightResult.killed ? (
                    <div className="w-full shrink-0">
                        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent p-1">
                            <div className="flex flex-col md:flex-row items-center gap-3 p-3 bg-background-dark/80 backdrop-blur-sm rounded-lg">
                                <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 shrink-0">
                                    <span className="material-symbols-outlined text-primary text-2xl">skull</span>
                                </div>
                                <div className="flex flex-1 flex-col gap-1 text-center md:text-left">
                                    <p className="text-white text-lg font-bold leading-tight">{room.players[room.nightResult.killed]?.username} was eliminated</p>
                                    <p className="text-muted text-xs font-medium">The Mafia struck during the night.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full shrink-0">
                        <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent p-1">
                            <div className="flex flex-col md:flex-row items-center gap-3 p-3 bg-background-dark/80 backdrop-blur-sm rounded-lg">
                                <div className="flex items-center justify-center size-10 rounded-full bg-blue-500/20 shrink-0">
                                    <span className="material-symbols-outlined text-blue-400 text-2xl">nights_stay</span>
                                </div>
                                <div className="flex flex-1 flex-col gap-1 text-center md:text-left">
                                    <p className="text-white text-lg font-bold leading-tight">A quiet night...</p>
                                    <p className="text-blue-300 text-xs font-medium">No one died tonight.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}

            {inspectResult && me?.role === 'detective' && (
                <div className="w-full shrink-0 animate-fade-in">
                    <div className="relative overflow-hidden rounded-xl border-2 border-blue-500/50 bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent p-3">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-400 text-2xl">badge</span>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-sm mb-1">Investigation Result</h3>
                                <p className="text-blue-200 text-xs">
                                    <span className="font-bold">{room.players[inspectResult.targetId]?.username || 'Unknown'}</span> is{' '}
                                    {inspectResult.isMafia ? <span className="text-red-400 font-bold">MAFIA</span> : <span className="text-green-400 font-bold">INNOCENT</span>}
                                </p>
                            </div>
                            {onClearInspect && (
                                <button onClick={onClearInspect} className="text-white/40 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setShowChatMobile(prev => !prev)}
                className="md:hidden w-full bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-xl py-3 flex items-center justify-center gap-2 text-white font-bold transition-colors"
            >
                <span className="material-symbols-outlined">chat</span>
                {showChatMobile ? 'Hide Chat' : 'Show Chat'}
            </button>

            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                <div className={leftPaneClass}>
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Players</h3>
                    <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                        {Object.values(room.players).map(player => {
                            const isInvestigated = !!inspectResult && me?.role === 'detective' && inspectResult.targetId === player.id;
                            const previouslyInvestigated = me?.role === 'detective' && investigationHistory?.has(player.id);
                            const investigationResult = previouslyInvestigated ? investigationHistory!.get(player.id) : null;
                            
                            const tileClass =
                                'relative p-3 rounded-lg border transition-all ' +
                                (!player.isAlive
                                    ? 'bg-gray-900/50 border-gray-700/30 opacity-50'
                                    : isInvestigated
                                        ? inspectResult!.isMafia
                                            ? 'bg-red-500/20 border-red-500/50'
                                            : 'bg-green-500/20 border-green-500/50'
                                        : previouslyInvestigated
                                            ? investigationResult
                                                ? 'bg-red-500/10 border-red-500/30'
                                                : 'bg-green-500/10 border-green-500/30'
                                            : 'bg-white/5 border-white/10 hover:border-white/20');

                            return (
                                <div key={player.id} className={tileClass}>
                                    <div className="flex items-center gap-3">
                                        <div className={'w-10 h-10 rounded-full flex items-center justify-center shrink-0 ' + (!player.isAlive ? 'bg-gray-800' : 'bg-white/10')}>
                                            <span className={'material-symbols-outlined text-xl ' + (!player.isAlive ? 'text-gray-500' : 'text-white')}>
                                                {player.isAlive ? 'person' : 'skull'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={'text-sm font-bold truncate ' + (!player.isAlive ? 'text-gray-500 line-through' : 'text-white')}>
                                                {player.username}
                                            </p>
                                            {isInvestigated && (
                                                <span className={'text-xs font-bold uppercase ' + (inspectResult!.isMafia ? 'text-red-400' : 'text-green-400')}>
                                                    {inspectResult!.isMafia ? 'MAFIA' : 'INNOCENT'}
                                                </span>
                                            )}
                                            {!isInvestigated && previouslyInvestigated && investigationResult !== null && (
                                                <span className={'text-xs font-bold uppercase ' + (investigationResult ? 'text-red-400/70' : 'text-green-400/70')}>
                                                    {investigationResult ? 'MAFIA' : 'INNOCENT'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={rightPaneClass}>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col custom-scrollbar max-h-[600px]">
                        <div className="flex-1" />
                        {messages.map(msg => {
                            if (msg.isGhost && isAlive) return null;
                            const isMine = msg.sender === username;

                            return (
                                <div key={msg.id} className={'flex flex-col gap-1 ' + (isMine ? 'items-end' : 'items-start')}>
                                    {msg.isSystem ? (
                                        <div className="flex justify-center py-2 w-full">
                                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-muted font-medium uppercase tracking-wider">{msg.text}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-baseline gap-2">
                                                <span
                                                    className={
                                                        (isMine ? 'text-primary' : msg.isGhost ? 'text-gray-500' : 'text-white') +
                                                        ' font-bold text-sm flex items-center gap-1'
                                                    }
                                                >
                                                    {msg.sender}
                                                    {msg.isGhost && <span className="material-symbols-outlined text-xs">skull</span>}
                                                </span>
                                                <span className="text-gray-500 text-xs">{formatTime(msg.timestamp)}</span>
                                            </div>
                                            <div
                                                className={
                                                    'p-3 rounded-xl text-base leading-relaxed w-fit max-w-[85%] whitespace-pre-wrap ' +
                                                    (msg.isGhost
                                                        ? 'bg-gray-800/30 border border-gray-700/30 text-gray-400 italic'
                                                        : isMine
                                                            ? 'bg-primary/20 border border-primary/20 text-white rounded-tr-none'
                                                            : 'bg-white/5 border border-white/5 text-white rounded-tl-none')
                                                }
                                            >
                                                {msg.text}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-surface-dark border-t border-white/10 shrink-0">
                        {!isAlive && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                                <span className="material-symbols-outlined text-sm">skull</span>
                                <span>Ghost Chat - Only visible to other ghosts</span>
                            </div>
                        )}

                        <form className="flex gap-3" onSubmit={handleSendMessage}>
                            <div className="relative grow">
                                <input
                                    className="w-full h-12 pl-4 pr-10 bg-black/30 text-white placeholder-gray-500 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                                    placeholder="Type your message..."
                                    type="text"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
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
        </div>
    );
}