'use client';

import { Button } from "@/components/ui/Button";
import { useGame } from "@/context/GameContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomState } from "@/types";

export default function CreateLobbyPage() {
    const { socket, username, setUsername } = useGame();
    const router = useRouter();
    const [localUsername, setLocalUsername] = useState(username);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!socket) return;
        
        const handleUpdate = (room: RoomState) => {
             // Only redirect if we instigated it (implied by isCreating being true, though weak check)
             if (isCreating) {
                 router.push(`/lobby/${room.code}`);
             }
        };

        socket.on('room:update', handleUpdate);
        return () => {
            socket.off('room:update', handleUpdate);
        }
    }, [socket, router, isCreating]);

    const handleCreate = () => {
        if (!localUsername) return;
        setUsername(localUsername);
        setIsCreating(true);
        socket?.emit('room:create', { username: localUsername });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <h1 className="text-3xl font-bold">Create Lobby</h1>
                <input 
                    className="w-full bg-white/5 border-2 border-muted rounded-xl px-4 py-3 text-center text-xl outline-none focus:border-primary"
                    placeholder="Enter Username"
                    value={localUsername}
                    onChange={(e) => setLocalUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    autoFocus
                />
                <Button 
                    fullWidth 
                    onClick={handleCreate} 
                    disabled={!localUsername || isCreating}
                >
                    {isCreating ? "Creating..." : "Create Room"}
                </Button>
            </div>
        </main>
    );
}
