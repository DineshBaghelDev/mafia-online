'use client';
import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { RoomState, Player } from '@/types';
import { Button } from '@/components/ui/Button';

export default function LobbyPage({ params }: { params: { code: string } }) {
    const { socket, username, setUsername, playerId } = useGame();
    const [room, setRoom] = useState<RoomState | null>(null);
    const [localUsername, setLocalUsername] = useState(username);
    const [error, setError] = useState("");

    const roomCode = params.code.toUpperCase();

    useEffect(() => {
        if (!socket) return;
        
        const onUpdate = (r: RoomState) => {
            setRoom(r);
            setError("");
        };
        const onError = (e: { message: string }) => setError(e.message);

        socket.on('room:update', onUpdate);
        socket.on('error', onError);

        // Attempt join if we have username and no room yet
        // If we came from Create, we might receive update immediately.
        if (username && !room) {
             socket.emit('room:join', { code: roomCode, username });
        }

        return () => {
            socket.off('room:update', onUpdate);
            socket.off('error', onError);
        };
    }, [socket, username, roomCode, room]);

    const handleJoin = () => {
        if (!localUsername) return;
        setUsername(localUsername);
        socket?.emit('room:join', { code: roomCode, username: localUsername });
    };
    
    if (error) return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="text-center space-y-4">
                <div className="text-red-500 text-xl">{error}</div>
                <Button onClick={() => window.location.href = '/'}>Go Home</Button>
            </div>
        </div>
    );
    
    if (!room) {
         if (!username) {
             return (
                <div className="flex min-h-screen items-center justify-center p-4">
                     <div className="w-full max-w-md space-y-6 text-center">
                        <h1 className="text-3xl font-bold uppercase tracking-widest">Join Room {roomCode}</h1>
                        <input 
                            className="w-full bg-white/5 border-2 border-muted rounded-xl px-4 py-4 text-center text-xl outline-none focus:border-primary transition-colors"
                            placeholder="ENTER USERNAME"
                            value={localUsername}
                            onChange={(e) => setLocalUsername(e.target.value)}
                        />
                         <Button fullWidth onClick={handleJoin} disabled={!localUsername}>JOIN GAME</Button>
                     </div>
                </div>
             )
         }
         return (
            <div className="flex min-h-screen items-center justify-center">
                 <div className="animate-pulse text-xl tracking-widest">CONNECTING TO LOBBY...</div>
            </div>
         );
    }

    const me = playerId ? room.players[playerId] : null; 

    return (
        <div className="min-h-screen bg-background text-text p-4 pb-24">
            <header className="flex justify-between items-center mb-8 px-2">
                 <div className="text-sm text-muted">ROOM: <span className="font-bold text-primary text-lg ml-1">{room.code}</span></div>
                 <div className="text-sm text-muted">PLAYERS: <span className="text-white">{Object.keys(room.players).length}/{room.settings.maxPlayers}</span></div>
            </header>
            
            <main className="max-w-2xl mx-auto">
                {room.phase === 'lobby' && <LobbyView room={room} me={me} />}
                {room.phase !== 'lobby' && <GameView room={room} me={me} />}
            </main>
        </div>
    );
}

function LobbyView({ room, me }: { room: RoomState, me: Player | null | undefined }) {
    const { socket } = useGame();
    const isHost = me?.isHost;
    
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Lobby</h2>
                <p className="text-muted tracking-widest text-sm">WAITING FOR PLAYERS</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(room.players).map(p => (
                    <div key={p.id} className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5 data-[me=true]:border-primary/50" data-me={p.id === me?.id}>
                         <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${p.connected ? 'bg-success text-success' : 'bg-warning text-warning'}`}></div>
                            <span className="font-semibold tracking-wide">{p.username} {p.id === me?.id && '(You)'}</span>
                         </div>
                         {p.isHost && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">HOST</span>}
                    </div>
                ))}
                
                 {/* Placeholders for empty slots */}
                 {Array.from({ length: Math.max(0, room.settings.maxPlayers - Object.keys(room.players).length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-black/20 p-4 rounded-xl flex items-center justify-center border border-white/5 border-dashed text-muted/20">
                        EMPTY SLOT
                    </div>
                 ))}
            </div>
            
            {isHost ? (
                <div className="fixed bottom-8 left-0 right-0 px-4 max-w-md mx-auto">
                    <Button 
                        fullWidth 
                        onClick={() => socket?.emit('room:start', { roomId: room.id })}
                        className="h-16 text-lg tracking-widest shadow-xl shadow-primary/20"
                    >
                        START GAME
                    </Button>
                </div>
            ) : (
                <div className="fixed bottom-8 left-0 right-0 px-4 text-center">
                    <p className="text-muted animate-pulse tracking-widest">WAITING FOR HOST TO START...</p>
                </div>
            )}
        </div>
    )
}

function GameView({ room, me }: { room: RoomState, me: Player | null | undefined }) {
    return (
        <div className="text-center space-y-8 animate-in fade-in duration-500">
             <div className="space-y-2">
                <div className="text-sm tracking-[0.3em] text-muted uppercase">Phase</div>
                <div className="text-5xl font-black uppercase text-primary tracking-widest drop-shadow-[0_0_15px_rgba(230,57,70,0.5)]">
                    {room.phase}
                </div>
             </div>
             
             {me?.role && (
                 <div className="bg-white/5 inline-block px-6 py-3 rounded-full border border-white/10">
                     <span className="text-muted mr-2">YOUR ROLE:</span>
                     <span className={`font-black tracking-wider uppercase ${
                        me.role === 'mafia' ? 'text-primary' : 
                        me.role === 'doctor' ? 'text-success' : 
                        me.role === 'detective' ? 'text-secondary' : 'text-text'
                     }`}>
                        {me.role}
                     </span>
                 </div>
             )}
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(room.players).map(p => (
                    <div key={p.id} className={`p-4 rounded-xl border-2 transition-all ${
                        p.isAlive 
                        ? 'border-muted/20 bg-white/5' 
                        : 'border-red-900/50 bg-red-900/10 grayscale opacity-60'
                    }`}>
                         <div className="font-bold">{p.username}</div>
                         {!p.isAlive && <div className="text-[10px] font-black text-red-500 mt-1 tracking-widest">ELIMINATED</div>}
                    </div>
                ))}
             </div>
             
             <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-muted">
                 Actions and Chat are not implemented in this preview.
             </div>
        </div>
    )
}
