export type Role = 'mafia' | 'detective' | 'doctor' | 'villager';
export type Phase = 'lobby' | 'role_reveal' | 'night' | 'day' | 'voting' | 'elimination_result' | 'game_end';
export type Winner = 'mafia' | 'villagers';

export interface Player {
    id: string; // socketId or userId
    username: string;
    isHost: boolean;
    role?: Role;
    isAlive: boolean;
    connected: boolean;
    ready?: boolean;
    wantsRematch?: boolean;
}

export interface RoomSettings {
    maxPlayers: number;
    discussionTime: number; // seconds
    votingTime: number; // seconds
    nightTime: number; // seconds
    eliminationResultTime: number; // seconds
    roleRevealTime: number; // seconds
    enableDoctor: boolean;
    enableDetective: boolean;
    isPublic: boolean;
}

export interface GameActions {
    mafiaKill?: string;
    mafiaVotes?: Record<string, string>; // mafiaId -> targetId
    doctorSave?: string;
    detectiveInspect?: string;
}

export interface RoomState {
    id: string;
    code: string;
    phase: Phase;
    players: Record<string, Player>;
    settings: RoomSettings;
    timerEnd?: number; // timestamp in ms
    votes: Record<string, string>; // voterId -> targetId
    actions: GameActions;
    winner?: Winner;
    isPublic: boolean;
    currentRound: number;
    eliminatedThisRound?: string;
    nightResult?: {
        killed?: string;
        saved?: boolean;
        inspectResult?: { targetId: string; isMafia: boolean };
    };
    chatHistory: ChatMessage[];
    gameStartedAt?: number;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: number;
    isPrivate?: boolean; // For mafia chat
}

export interface MatchmakingPlayer {
    userId: string;
    username: string;
    joinedAt: number;
}
