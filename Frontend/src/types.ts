export type Role = 'mafia' | 'detective' | 'doctor' | 'villager';
export type Phase = 'lobby' | 'night' | 'day' | 'voting' | 'ended';

export interface Player {
    id: string; // socketId or userId
    username: string;
    isHost: boolean;
    role?: Role;
    isAlive: boolean;
    connected: boolean;
}

export interface RoomState {
    id: string;
    code: string;
    phase: Phase;
    players: Record<string, Player>;
    settings: {
        maxPlayers: number;
        discussionTime: number; // seconds
        votingTime: number; // seconds
    };
    timerEnd?: number; 
    votes: Record<string, string>; 
    actions: {
        mafiaKill?: string;
        doctorSave?: string;
        detectiveInspect?: string;
    };
    winner?: 'mafia' | 'villagers';
}
