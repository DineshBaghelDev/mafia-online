import { v4 as uuidv4 } from 'uuid';
import { store } from './store';
import { RoomState, Player, Role } from '../types';

export class GameService {
    async createRoom(hostId: string, username: string, isPrivate: boolean = true) {
        const roomId = uuidv4();
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        
        const host: Player = {
            id: hostId,
            username,
            isHost: true,
            isAlive: true,
            connected: true
        };

        const room: RoomState = {
            id: roomId,
            code: roomCode,
            phase: 'lobby',
            players: { [hostId]: host },
            settings: {
                maxPlayers: 10,
                discussionTime: 60,
                votingTime: 30
            },
            votes: {},
            actions: {}
        };

        await store.createRoom(room);
        return room;
    }

    async joinRoom(code: string, userId: string, username: string) {
        const room = await store.getRoomByCode(code);
        if (!room) throw new Error("Room not found");
        if (room.phase !== 'lobby') throw new Error("Game already started");
        if (Object.keys(room.players).length >= room.settings.maxPlayers) throw new Error("Room full");

        const player: Player = {
            id: userId,
            username,
            isHost: false,
            isAlive: true,
            connected: true
        };

        room.players[userId] = player;
        await store.updateRoom(room.id, room);
        return room;
    }

    async startGame(roomId: string) {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        // Assign roles
        const playerIds = Object.keys(room.players);
        // Minimum check skipped for MVP flexibility, but ideally check here

        this.assignRoles(room);
        room.phase = 'night';
        // Set timer?
        
        await store.updateRoom(roomId, room);
        return room;
    }
    
    private assignRoles(room: RoomState) {
        const playerIds = Object.keys(room.players);
        // Simple distribution
        // Should scale with player count.
        // For MVP: 1 Mafia, 1 Doctor, 1 Detective, Rest Villagers
        // If > 7 players, 2 Mafia.
        
        let mafiaCount = 1;
        if (playerIds.length >= 7) mafiaCount = 2;
        
        const roles: Role[] = [];
        for(let i=0; i<mafiaCount; i++) roles.push('mafia');
        roles.push('doctor');
        roles.push('detective');

        // Shuffle
        for (let i = playerIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
        }
        
        // Fill rest with villagers
        while (roles.length < playerIds.length) roles.push('villager');

        // Assign to shuffled IDs
        playerIds.forEach((id, index) => {
            if (room.players[id]) {
                room.players[id].role = roles[index] || 'villager';
            }
        });
    }

    async removePlayer(roomId: string, userId: string) {
        const room = await store.getRoom(roomId);
        if (!room) return null;
        
        delete room.players[userId];
        if (Object.keys(room.players).length === 0) {
            await store.deleteRoom(roomId);
            return null;
        }
        
        // If host left, assign new host
        const players = Object.values(room.players);
        if (players.length > 0 && !players.some(p => p.isHost)) {
            players[0].isHost = true;
        }

        await store.updateRoom(roomId, room);
        return room;
    }
}

export const gameService = new GameService();
