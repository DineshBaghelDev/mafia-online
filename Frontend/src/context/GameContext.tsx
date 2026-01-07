'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameContextType {
    socket: Socket | null;
    username: string;
    setUsername: (name: string) => void;
    roomId: string | null;
    playerId: string | null;
    isConnected: boolean;
}

const GameContext = createContext<GameContextType>(null!);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [username, setUsername] = useState("");
    const [roomId, setRoomId] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const s = io('http://localhost:3001', { autoConnect: true });
        setSocket(s);
        
        s.on('connect', () => {
             console.log('Connected to server');
             setIsConnected(true);
        });

        s.on('disconnect', () => {
            console.log('Disconnected');
            setIsConnected(false);
        });

        s.on('room:joined', (data) => {
            setRoomId(data.roomId);
            setPlayerId(data.playerId);
        });

        return () => {
            s.disconnect();
        }
    }, []);

    return (
        <GameContext.Provider value={{ socket, username, setUsername, roomId, playerId, isConnected }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
