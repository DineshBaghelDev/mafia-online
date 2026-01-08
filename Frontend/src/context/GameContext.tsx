'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { showToast } from '@/components/ui/Toast';

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

const GameContext = createContext<GameContextType>(null!);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Load username from localStorage on mount
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // Save username to localStorage when it changes
    useEffect(() => {
        if (username) {
            localStorage.setItem('username', username);
        }
    }, [username]);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const s = io(socketUrl, { 
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });
        setSocket(s);
        
        s.on('connect', () => {
             console.log('Connected to server');
             setIsConnected(true);
             
             // Identify user on connection
             const storedUsername = localStorage.getItem('username');
             const storedUserId = localStorage.getItem('userId');
             if (storedUsername) {
                 s.emit('auth:identify', { username: storedUsername, userId: storedUserId });
             }
        });

        s.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        s.on('auth:success', (data: { userId: string }) => {
            console.log('Auth success:', data);
            setPlayerId(data.userId);
            localStorage.setItem('userId', data.userId);
        });

        s.on('auth:reconnect', (data: { roomId: string; gameState: any }) => {
            console.log('Reconnected to room:', data);
            setRoomId(data.roomId);
        });

        s.on('room:joined', (data: { roomId: string; roomCode: string; playerId: string }) => {
            console.log('Room joined:', data);
            setRoomId(data.roomId);
            setPlayerId(data.playerId);
            localStorage.setItem('currentRoomId', data.roomId);
            localStorage.setItem('currentRoomCode', data.roomCode);
        });

        s.on('room:error', (data: { reason: string }) => {
            console.error('Room error:', data.reason);
            showToast(data.reason, 'error');
        });

        s.on('room:kicked', () => {
            console.log('You were kicked from the room');
            setRoomId(null);
            localStorage.removeItem('currentRoomId');
            localStorage.removeItem('currentRoomCode');
            showToast('You were kicked from the room', 'warning');
        });

        s.on('room:closed', () => {
            console.log('Room was closed');
            setRoomId(null);
            localStorage.removeItem('currentRoomId');
            localStorage.removeItem('currentRoomCode');
        });

        return () => {
            s.disconnect();
        }
    }, []);

    const leaveRoom = useCallback(() => {
        if (socket && roomId) {
            socket.emit('room:leave', { roomId });
        }
        setRoomId(null);
        localStorage.removeItem('currentRoomId');
        localStorage.removeItem('currentRoomCode');
    }, [socket, roomId]);

    return (
        <GameContext.Provider value={{ 
            socket, 
            username, 
            setUsername, 
            roomId, 
            playerId, 
            isConnected,
            setRoomId,
            leaveRoom 
        }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
