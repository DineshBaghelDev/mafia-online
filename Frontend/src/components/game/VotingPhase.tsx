'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState } from '@/types';

interface VotingPhaseProps {
    room: RoomState;
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

export function VotingPhase({ room, chatMessages: externalMessages, setChatMessages: setExternalMessages }: VotingPhaseProps) {
    const { socket, playerId, username } = useGame();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(externalMessages || []);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const me = playerId ? room.players[playerId] : null;
    const isAlive = me?.isAlive ?? false;

    // Initialize chat with existing messages or add system message
    useEffect(() => {
        if (externalMessages && externalMessages.length > 0) {
            setMessages(externalMessages);
        } else {
            const initialMsg = [{ id: 'system-voting', sender: 'System', text: 'Voting Phase Started - Continue Discussion', timestamp: Date.now(), isSystem: true }];
            setMessages(initialMsg);
            if (setExternalMessages) setExternalMessages(initialMsg);
        }
    }, []);

    const handleSelectPlayer = (targetId: string) => {
        if (hasConfirmed || !me?.isAlive) return;
        setSelectedPlayerId(targetId);
    };

    const handleSkip = () => {
        if (hasConfirmed || !me?.isAlive) return;
        setSelectedPlayerId(null);
    };

    const handleConfirm = () => {
        if (hasConfirmed || !me?.isAlive) return;
        
        if (selectedPlayerId) {
            socket?.emit('vote:cast', { targetId: selectedPlayerId });
        } else {
            socket?.emit('vote:skip');
        }
        setHasConfirmed(true);
    };

    // Listen for chat messages
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

    // Auto-scroll chat
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

    // Calculate voting progress
    const totalVoters = Object.values(room.players).filter(p => p.isAlive).length;
    const votedCount = Object.keys(room.votes || {}).length;
    const progressPercent = (votedCount / totalVoters) * 100;

    // Sort players: Alive first, then Dead
    const sortedPlayers = Object.values(room.players).sort((a, b) => {
        if (a.isAlive === b.isAlive) return a.username.localeCompare(b.username);
        return a.isAlive ? -1 : 1;
    });

    return (
        <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto p-4 md:p-6 gap-4">
            {/* Page Heading & Context */}
            <div className="flex flex-col gap-3 text-center">
                <div className="space-y-2">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">VOTING</h2>
                    <p className="text-primary font-medium text-base tracking-wide uppercase">Who should be eliminated?</p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto">
                    <div className="flex justify-between text-xs font-medium text-text-secondary mb-2 px-1">
                        <span>Voting Progress</span>
                        <span>{votedCount}/{totalVoters} Voted</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-red-400 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content: Tiles + Discussion View */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                {/* Left: Voting Tiles */}
                <div className="flex flex-col w-full md:w-80 shrink-0 gap-3">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center justify-between">
                        <span>Vote to Eliminate</span>
                        {hasConfirmed && <span className="text-green-400 text-xs">✓ Confirmed</span>}
                    </h3>
                    
                    {/* Skip and Confirm Buttons */}
                    {me?.isAlive && !hasConfirmed && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSkip}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                                    selectedPlayerId === null
                                        ? 'bg-blue-500/30 border-2 border-blue-500 text-blue-400'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                Skip Vote
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-2 px-3 rounded-lg text-sm font-bold bg-green-500 hover:bg-green-600 text-white transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar p-1">
                        {sortedPlayers.map(player => {
                            if (!player.isAlive) {
                                return (
                                    <div key={player.id} className="relative opacity-40 cursor-not-allowed">
                                        <div className="flex items-center p-3 rounded-xl border border-white/5 bg-black/20">
                                            <div className="mr-3 flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                                                    <span className="material-symbols-outlined text-gray-400 text-xl">skull</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-gray-500 line-through truncate">{player.username}</p>
                                                <p className="text-xs text-gray-600 uppercase tracking-wider">Eliminated</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            const isSelected = selectedPlayerId === player.id;
                            const isMe = player.id === playerId;
                            const canSelect = me?.isAlive && !hasConfirmed;

                            return (
                                <button
                                    key={player.id}
                                    disabled={!canSelect || isMe}
                                    onClick={() => canSelect && !isMe && handleSelectPlayer(player.id)}
                                    className={`flex items-center p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                                        isSelected
                                            ? 'bg-primary/20 border-primary shadow-lg scale-[1.02]'
                                            : canSelect && !isMe
                                            ? 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                            : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <div className="mr-3 flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                            isSelected 
                                                ? 'bg-primary/30 border-primary text-primary' 
                                                : 'bg-white/10 border-white/20 text-white'
                                        }`}>
                                            <span className="font-bold text-lg">{player.username[0].toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold text-sm truncate ${
                                            isSelected ? 'text-white' : 'text-white/90'
                                        }`}>
                                            {player.username} {isMe && '(You)'}
                                        </p>
                                        {isSelected && (
                                            <p className="text-xs text-primary font-medium">Selected</p>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <span className="material-symbols-outlined text-primary animate-pulse">check_circle</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Chat (continues from discussion) */}
                <div className="flex-1 flex flex-col min-h-0 bg-surface-dark/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
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
                                    placeholder="Continue discussing while voting..."
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
