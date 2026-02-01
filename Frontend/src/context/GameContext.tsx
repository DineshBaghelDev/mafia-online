
'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ui/Toast';
import { BackendConnectionStatus } from '@/components/BackendConnectionStatus';

interface GameContextType {
    socket: Socket | null;
    username: string;
    setUsername: (name: string) => void;
    roomId: string | null;
    playerId: string | null;
    isConnected: boolean;
    setRoomId: (id: string | null) => void;
    leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function generateTestUsername() {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `Player${suffix}`;
}

export function GameProvider({ children, mockPlayerId }: { children: React.ReactNode, mockPlayerId?: string }) {
    const { user } = useAuth();

    const [socket, setSocket] = useState<Socket | null>(null);
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize username - only use sessionStorage for per-tab sessions
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check sessionStorage first (per-tab) - this is the source of truth
        let stored = sessionStorage.getItem('username');
        
        // If no session username and user is authenticated, use their auth username
        if (!stored && user?.username) {
            stored = user.username;
            sessionStorage.setItem('username', stored);
        }
        
        if (stored) {
            setUsername(stored);
        }
        // Don't fallback to localStorage - force fresh username entry per tab
    }, [user?.username]);

    // Persist username to sessionStorage only (per-tab)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!username) return;

        sessionStorage.setItem('username', username);
    }, [username]);

    // Socket lifecycle
    useEffect(() => {
        // If mockPlayerId is provided, set it and skip socket initialization
        if (mockPlayerId) {
            setPlayerId(mockPlayerId);
            setIsConnected(true);
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const s = io(socketUrl, { autoConnect: true });
        setSocket(s);

        const onConnect = () => {
            setIsConnected(true);
            setPlayerId(s.id ?? null);
        };

        const onDisconnect = () => {
            setIsConnected(false);
            setPlayerId(null);
        };

        const onRoomJoined = (data: { roomId: string; playerId?: string; code?: string }) => {
            setRoomId(data.roomId);
            if (data.playerId) setPlayerId(data.playerId);

            if (typeof window !== 'undefined') {
                localStorage.setItem('currentRoomId', data.roomId);
                if (data.code) localStorage.setItem('currentRoomCode', data.code);
            }
        };

        const onRoomError = (data: { reason: string }) => {
            showToast(data.reason, 'error');
        };

        const onRoomKicked = () => {
            setRoomId(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('currentRoomId');
                localStorage.removeItem('currentRoomCode');
            }
            showToast('You were kicked from the room', 'warning');
        };

        const onRoomClosed = () => {
            setRoomId(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('currentRoomId');
                localStorage.removeItem('currentRoomCode');
            }
            showToast('Room was closed', 'warning');
        };

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('room:joined', onRoomJoined);
        s.on('room:error', onRoomError);
        s.on('room:kicked', onRoomKicked);
        s.on('room:closed', onRoomClosed);

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('room:joined', onRoomJoined);
            s.off('room:error', onRoomError);
            s.off('room:kicked', onRoomKicked);
            s.off('room:closed', onRoomClosed);
            s.disconnect();
        };
    }, [mockPlayerId]);

    const leaveRoom = useCallback(() => {
        if (socket) {
            socket.emit('room:leave');
        }
        setRoomId(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentRoomId');
            localStorage.removeItem('currentRoomCode');
        }
    }, [socket]);

    return (
        <GameContext.Provider value={{ socket, username, setUsername, roomId, playerId, isConnected, setRoomId, leaveRoom }}>
            <BackendConnectionStatus isConnected={isConnected} />
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used within a GameProvider');
    return ctx;
}
