import { v4 as uuidv4 } from 'uuid';
import { store } from './store';
import { RoomState, Player, Role, Phase, ChatMessage, Winner } from '../types';

export class GameService {
    private timers: Map<string, NodeJS.Timeout> = new Map();

    // Helper to generate room codes
    private generateRoomCode(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async createRoom(
        hostId: string, 
        username: string, 
        isPublic: boolean = false, 
        maxPlayers: number = 10,
        customSettings?: {
            discussionTime?: number;
            votingTime?: number;
            nightTime?: number;
        }
    ): Promise<RoomState> {
        const roomId = uuidv4();
        const roomCode = this.generateRoomCode();
        
        const host: Player = {
            id: hostId,
            username,
            isHost: true,
            isAlive: true,
            connected: true,
            ready: false
        };

        const room: RoomState = {
            id: roomId,
            code: roomCode,
            phase: 'lobby',
            players: { [hostId]: host },
            settings: {
                maxPlayers,
                discussionTime: customSettings?.discussionTime || 90,
                votingTime: customSettings?.votingTime || 30,
                nightTime: customSettings?.nightTime || 30,
                isPublic
            },
            isPublic,
            votes: {},
            actions: {},
            currentRound: 0,
            chatHistory: []
        };

        await store.createRoom(room);
        return room;
    }

    async joinRoom(code: string, userId: string, username: string): Promise<RoomState> {
        const room = await store.getRoomByCode(code);
        if (!room) throw new Error("Room not found");
        if (room.phase !== 'lobby') throw new Error("Game already started");
        
        // If player is already in THIS room, just return success (e.g., rejoin after create)
        if (room.players[userId]) {
            console.log(`Player ${userId} already in room ${room.id}, returning room state`);
            return room;
        }
        
        if (Object.keys(room.players).length >= room.settings.maxPlayers) throw new Error("Room full");

        const player: Player = {
            id: userId,
            username,
            isHost: false,
            isAlive: true,
            connected: true,
            ready: false
        };

        room.players[userId] = player;
        await store.updateRoom(room.id, room);
        return room;
    }

    async resetRoomToLobby(roomId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");

        // Reset room state
        room.phase = 'lobby';
        room.currentRound = 0;
        room.votes = {};
        room.actions = {};
        room.chatHistory = [];
        room.nightResult = undefined;
        room.eliminatedThisRound = undefined;
        room.winner = undefined;
        room.timerEnd = undefined;

        // Reset all players
        Object.values(room.players).forEach(player => {
            player.isAlive = true;
            player.ready = false;
            delete player.role;
        });

        // Clear any running timers
        const timer = this.timers.get(roomId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(roomId);
        }

        await store.updateRoom(roomId, room);
        return room;
    }

    async setReady(roomId: string, userId: string, ready: boolean): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        if (room.phase !== 'lobby') throw new Error("Game already started");
        
        const player = room.players[userId];
        if (!player) throw new Error("Player not in room");
        
        player.ready = ready;
        await store.updateRoom(room.id, room);
        return room;
    }

    async kickPlayer(roomId: string, hostId: string, targetId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        if (!room.players[hostId]?.isHost) throw new Error("Only host can kick");
        if (!room.players[targetId]) throw new Error("Player not in room");
        
        delete room.players[targetId];
        await store.updateRoom(room.id, room);
        return room;
    }

    async updateSettings(roomId: string, hostId: string, settings: Partial<RoomState['settings']>): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        if (!room.players[hostId]?.isHost) throw new Error("Only host can change settings");
        if (room.phase !== 'lobby') throw new Error("Cannot change settings after game start");
        
        Object.assign(room.settings, settings);
        await store.updateRoom(room.id, room);
        return room;
    }

    async startGame(roomId: string, hostId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        if (!room.players[hostId]?.isHost) throw new Error("Only host can start game");
        if (room.phase !== 'lobby') throw new Error("Game already started");
        
        const playerCount = Object.keys(room.players).length;
        if (playerCount < 4) throw new Error("Need at least 4 players to start");

        // Assign roles
        this.assignRoles(room);
        
        room.phase = 'role_reveal';
        room.currentRound = 1;
        room.gameStartedAt = Date.now();
        
        await store.updateRoom(roomId, room);
        
        // Auto-transition to night after 8 seconds
        this.schedulePhaseTransition(roomId, 8000, async () => {
            await this.transitionToNight(roomId);
        });
        
        return room;
    }
    
    private assignRoles(room: RoomState): void {
        const playerIds = Object.keys(room.players);
        const playerCount = playerIds.length;
        
        // Role distribution based on player count
        let mafiaCount = Math.floor(playerCount / 3); // ~33% mafia
        if (mafiaCount < 1) mafiaCount = 1;
        if (mafiaCount > 3) mafiaCount = 3;
        
        const roles: Role[] = [];
        
        // Add mafia
        for (let i = 0; i < mafiaCount; i++) {
            roles.push('mafia');
        }
        
        // Add special roles
        if (playerCount >= 5) roles.push('doctor');
        if (playerCount >= 5) roles.push('detective');
        
        // Fill rest with villagers
        while (roles.length < playerCount) {
            roles.push('villager');
        }
        
        // Shuffle roles
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }
        
        // Shuffle player IDs
        for (let i = playerIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
        }
        
        // Assign to players
        playerIds.forEach((id, index) => {
            if (room.players[id]) {
                room.players[id].role = roles[index];
            }
        });
    }

    async transitionToNight(roomId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        room.phase = 'night';
        room.actions = {}; // Reset actions
        room.nightResult = undefined;
        room.timerEnd = Date.now() + (room.settings.nightTime * 1000);
        
        await store.updateRoom(roomId, room);
        
        // Auto-resolve night after timer
        this.schedulePhaseTransition(roomId, room.settings.nightTime * 1000, async () => {
            await this.resolveNightActions(roomId);
        });
        
        return room;
    }

    async submitNightAction(roomId: string, userId: string, action: 'mafiaKill' | 'doctorSave' | 'detectiveInspect', targetId: string): Promise<void> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        if (room.phase !== 'night') throw new Error("Not night phase");
        
        const player = room.players[userId];
        if (!player || !player.isAlive) throw new Error("Invalid player");
        
        const target = room.players[targetId];
        if (!target || !target.isAlive) throw new Error("Invalid target");
        
        // Validate role-based actions
        if (action === 'mafiaKill' && player.role !== 'mafia') {
            throw new Error("Only mafia can kill");
        }
        if (action === 'doctorSave' && player.role !== 'doctor') {
            throw new Error("Only doctor can save");
        }
        if (action === 'detectiveInspect' && player.role !== 'detective') {
            throw new Error("Only detective can inspect");
        }
        
        room.actions[action] = targetId;
        await store.updateRoom(roomId, room);
    }

    async resolveNightActions(roomId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        const { mafiaKill, doctorSave, detectiveInspect } = room.actions;
        
        room.nightResult = {};
        
        // Resolve kill/save
        if (mafiaKill) {
            const saved = mafiaKill === doctorSave;
            if (!saved) {
                const target = room.players[mafiaKill];
                if (target) {
                    target.isAlive = false;
                    room.nightResult.killed = mafiaKill;
                }
            } else {
                room.nightResult.saved = true;
                room.nightResult.killed = mafiaKill; // Still show who was targeted
            }
        }
        
        // Detective inspect result (stored for private reveal)
        if (detectiveInspect) {
            const target = room.players[detectiveInspect];
            if (target) {
                room.nightResult.inspectResult = {
                    targetId: detectiveInspect,
                    isMafia: target.role === 'mafia'
                };
            }
        }
        
        // Check win condition
        if (this.checkWinCondition(room)) {
            room.phase = 'game_end';
            await store.updateRoom(roomId, room);
            return room;
        }
        
        // Transition to day
        room.phase = 'day';
        room.timerEnd = Date.now() + (room.settings.discussionTime * 1000);
        await store.updateRoom(roomId, room);
        
        // Auto-transition to voting
        this.schedulePhaseTransition(roomId, room.settings.discussionTime * 1000, async () => {
            await this.transitionToVoting(roomId);
        });
        
        return room;
    }

    async transitionToVoting(roomId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        room.phase = 'voting';
        room.votes = {}; // Reset votes
        room.timerEnd = Date.now() + (room.settings.votingTime * 1000);
        
        await store.updateRoom(roomId, room);
        
        // Auto-resolve voting after timer
        this.schedulePhaseTransition(roomId, room.settings.votingTime * 1000, async () => {
            await this.resolveVoting(roomId);
        });
        
        return room;
    }

    async castVote(roomId: string, voterId: string, targetId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        if (room.phase !== 'voting') throw new Error("Not voting phase");
        
        const voter = room.players[voterId];
        if (!voter || !voter.isAlive) throw new Error("Cannot vote");
        
        const target = room.players[targetId];
        if (!target || !target.isAlive) throw new Error("Invalid target");
        
        room.votes[voterId] = targetId;
        await store.updateRoom(roomId, room);
        return room;
    }

    async resolveVoting(roomId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        // Count votes
        const voteCounts: Record<string, number> = {};
        Object.values(room.votes).forEach(targetId => {
            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        });
        
        // Find player(s) with most votes
        let maxVotes = 0;
        let eliminated: string[] = [];
        
        Object.entries(voteCounts).forEach(([playerId, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                eliminated = [playerId];
            } else if (count === maxVotes && count > 0) {
                eliminated.push(playerId);
            }
        });
        
        // Handle elimination (random if tie, or no elimination if no votes)
        if (eliminated.length === 1 && maxVotes > 0) {
            const target = room.players[eliminated[0]];
            if (target) {
                target.isAlive = false;
                room.eliminatedThisRound = eliminated[0];
            }
        } else if (eliminated.length > 1) {
            // Tie - random elimination
            const randomIndex = Math.floor(Math.random() * eliminated.length);
            const target = room.players[eliminated[randomIndex]];
            if (target) {
                target.isAlive = false;
                room.eliminatedThisRound = eliminated[randomIndex];
            }
        } else {
            room.eliminatedThisRound = undefined; // No elimination
        }
        
        // Check win condition
        if (this.checkWinCondition(room)) {
            room.phase = 'game_end';
            await store.updateRoom(roomId, room);
            return room;
        }
        
        // Next round
        room.currentRound++;
        await this.transitionToNight(roomId);
        
        return room;
    }

    private checkWinCondition(room: RoomState): boolean {
        const alivePlayers = Object.values(room.players).filter(p => p.isAlive);
        const aliveMafia = alivePlayers.filter(p => p.role === 'mafia');
        const aliveVillagers = alivePlayers.filter(p => p.role !== 'mafia');
        
        if (aliveMafia.length === 0) {
            room.winner = 'villagers';
            return true;
        }
        
        if (aliveMafia.length >= aliveVillagers.length) {
            room.winner = 'mafia';
            return true;
        }
        
        return false;
    }

    async addChatMessage(roomId: string, senderId: string, message: string, isPrivate: boolean = false): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        const sender = room.players[senderId];
        if (!sender) throw new Error("Player not in room");
        
        // Validate chat permissions
        if (room.phase === 'night' && isPrivate) {
            // Only mafia can chat privately at night
            if (sender.role !== 'mafia') throw new Error("Only mafia can chat at night");
        } else if (room.phase === 'night') {
            throw new Error("No public chat during night");
        }
        
        // Dead players can't chat (optional rule)
        if (!sender.isAlive && room.phase !== 'game_end') {
            throw new Error("Dead players cannot chat");
        }
        
        const chatMessage: ChatMessage = {
            id: uuidv4(),
            senderId,
            senderName: sender.username,
            message: message.substring(0, 500), // Limit message length
            timestamp: Date.now(),
            isPrivate
        };
        
        room.chatHistory.push(chatMessage);
        
        // Keep only last 100 messages
        if (room.chatHistory.length > 100) {
            room.chatHistory = room.chatHistory.slice(-100);
        }
        
        await store.updateRoom(roomId, room);
        return room;
    }

    async removePlayer(roomId: string, userId: string): Promise<RoomState | null> {
        const room = await store.getRoom(roomId);
        if (!room) return null;
        
        const player = room.players[userId];
        if (!player) return room;
        
        delete room.players[userId];
        
        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
            await store.deleteRoom(roomId);
            this.clearTimer(roomId);
            return null;
        }
        
        // If host left, assign new host
        const players = Object.values(room.players);
        if (players.length > 0 && !players.some(p => p.isHost)) {
            players[0].isHost = true;
        }
        
        // If game is in progress and player was alive, mark as dead
        if (room.phase !== 'lobby' && room.phase !== 'game_end') {
            // Check win condition after player leaves
            if (this.checkWinCondition(room)) {
                room.phase = 'game_end';
            }
        }

        await store.updateRoom(roomId, room);
        return room;
    }

    async reconnectPlayer(roomId: string, userId: string): Promise<RoomState> {
        const room = await store.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        const player = room.players[userId];
        if (!player) throw new Error("Player not in room");
        
        player.connected = true;
        await store.updateRoom(roomId, room);
        return room;
    }

    async disconnectPlayer(roomId: string, userId: string): Promise<RoomState | null> {
        const room = await store.getRoom(roomId);
        if (!room) return null;
        
        const player = room.players[userId];
        if (!player) return room;
        
        player.connected = false;
        await store.updateRoom(roomId, room);
        
        // Give 30 second grace period for reconnection
        setTimeout(async () => {
            const currentRoom = await store.getRoom(roomId);
            if (currentRoom && currentRoom.players[userId] && !currentRoom.players[userId].connected) {
                await this.removePlayer(roomId, userId);
            }
        }, 30000);
        
        return room;
    }

    // Timer management
    private schedulePhaseTransition(roomId: string, delay: number, callback: () => Promise<void>): void {
        this.clearTimer(roomId);
        
        const timer = setTimeout(async () => {
            try {
                await callback();
            } catch (error) {
                console.error(`Error in phase transition for room ${roomId}:`, error);
            }
        }, delay);
        
        this.timers.set(roomId, timer);
    }

    private clearTimer(roomId: string): void {
        const timer = this.timers.get(roomId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(roomId);
        }
    }

    async getPublicRooms(): Promise<RoomState[]> {
        return store.getPublicRooms();
    }
}

export const gameService = new GameService();
