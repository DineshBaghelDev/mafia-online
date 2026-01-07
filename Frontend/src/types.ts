export type Role = 'mafia' | 'sheriff' | 'doctor' | 'villager'; // Changed detective to sheriff to match designs
export type Phase = 'lobby' | 'role_reveal' | 'day' | 'voting' | 'night' | 'game_end';

export interface Player {
    id: string; // socketId or userId
    username: string;
    isHost: boolean;
    role?: Role;
    isAlive: boolean;
    connected: boolean;
    avatar?: string; // Add avatar support
    isReady?: boolean; // Add ready state support
}

export interface RoomState {
    id: string;
    code: string;
    phase: Phase;
    players: Record<string, Player>;
    settings: {
        maxPlayers: number;
        dayDuration: number;
        nightDuration: number;
        votingDuration: number;
    };
    timer: number; // Current remaining seconds
    votes?: Record<string, string>; 
    actions?: {
        mafiaKill?: string;
        doctorSave?: string;
        sheriffInspect?: string; // Check sheriff
    };
    winner?: 'mafia' | 'villagers';
}
