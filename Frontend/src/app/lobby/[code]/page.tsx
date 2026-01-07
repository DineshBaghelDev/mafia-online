'use client';

import { useGame } from '@/context/GameContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LobbyPage() {
    const params = useParams();
    const router = useRouter();
    const { socket, username } = useGame();
    const code = params.code as string;

    useEffect(() => {
        if (!username) {
            router.push(`/username?next=/lobby/${code}`);
        }
    }, [username, code, router]);

    if (!username) return null;

    return (
        <div className="min-h-screen bg-background-dark text-white p-6 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Lobby: {code}</h1>
                <p className="text-gray-400 mb-8">Welcome, {username}!</p>
                <button 
                    onClick={() => router.push(`/game/${code}`)}
                    className="px-8 py-3 bg-primary rounded-xl font-bold"
                >
                    Start Game (Demo)
                </button>
            </div>
        </div>
    );
}
