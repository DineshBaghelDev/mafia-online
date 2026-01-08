import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import { store } from './store';
import { gameService } from './gameService';
import { MatchmakingPlayer, RoomState } from '../types';

export class MatchmakingService {
    private matchmakingInterval: NodeJS.Timeout | null = null;
    private readonly MIN_PLAYERS = 6;
    private readonly MAX_WAIT_TIME = 30000; // 30 seconds
    private readonly CHECK_INTERVAL = 2000; // Check every 2 seconds
    private io: Server | null = null;

    constructor() {
        this.startMatchmaking();
    }

    setIoServer(io: Server): void {
        this.io = io;
    }

    async addToQueue(userId: string, username: string): Promise<void> {
        const player: MatchmakingPlayer = {
            userId,
            username,
            joinedAt: Date.now()
        };
        
        await store.addToMatchmaking(player);
        console.log(`Player ${username} added to matchmaking queue`);
    }

    async removeFromQueue(userId: string): Promise<void> {
        await store.removeFromMatchmaking(userId);
        console.log(`Player ${userId} removed from matchmaking queue`);
    }

    private startMatchmaking(): void {
        if (this.matchmakingInterval) return;

        this.matchmakingInterval = setInterval(async () => {
            try {
                await this.checkQueue();
            } catch (error) {
                console.error('Error in matchmaking:', error);
            }
        }, this.CHECK_INTERVAL);

        console.log('Matchmaking service started');
    }

    private async checkQueue(): Promise<void> {
        const queue = await store.getMatchmakingQueue();
        
        if (queue.length < this.MIN_PLAYERS) return;

        // Check if oldest player has waited too long
        const oldestPlayer = queue[0];
        const waitTime = Date.now() - oldestPlayer.joinedAt;
        
        // Create game if we have enough players or if max wait time exceeded
        const shouldCreateGame = 
            queue.length >= this.MIN_PLAYERS && 
            (queue.length >= 10 || waitTime >= this.MAX_WAIT_TIME);

        if (shouldCreateGame) {
            await this.createMatchmadeGame(queue);
        }
    }

    private async createMatchmadeGame(queue: MatchmakingPlayer[]): Promise<RoomState> {
        // Take up to 10 players from queue
        const playersToMatch = queue.slice(0, 10);
        
        if (playersToMatch.length < this.MIN_PLAYERS) {
            throw new Error('Not enough players');
        }

        // Create a public room with first player as host
        const host = playersToMatch[0];
        const room = await gameService.createRoom(
            host.userId,
            host.username,
            true, // isPublic
            10 // maxPlayers
        );

        // Add other players to the room
        for (let i = 1; i < playersToMatch.length; i++) {
            const player = playersToMatch[i];
            try {
                await gameService.joinRoom(room.code, player.userId, player.username);
            } catch (error) {
                console.error(`Failed to add player ${player.username} to room:`, error);
            }
        }

        // Remove matched players from queue
        await store.clearMatchmakingQueue(playersToMatch.length);

        console.log(`Created matchmade game ${room.code} with ${playersToMatch.length} players`);

        // Notify all matched players
        if (this.io) {
            playersToMatch.forEach(player => {
                this.io!.emit('matchmaking:found', { roomId: room.id, roomCode: room.code });
            });
        }

        // Auto-start game after 5 seconds to give players time to load
        setTimeout(async () => {
            try {
                const currentRoom = await store.getRoom(room.id);
                if (currentRoom && currentRoom.phase === 'lobby') {
                    await gameService.startGame(room.id, host.userId);
                    console.log(`Auto-started matchmade game ${room.code}`);
                }
            } catch (error) {
                console.error('Failed to auto-start matchmade game:', error);
            }
        }, 5000);

        return room;
    }

    async getQueueSize(): Promise<number> {
        const queue = await store.getMatchmakingQueue();
        return queue.length;
    }

    async getQueuePosition(userId: string): Promise<number> {
        const queue = await store.getMatchmakingQueue();
        const position = queue.findIndex(p => p.userId === userId);
        return position === -1 ? -1 : position + 1;
    }

    stop(): void {
        if (this.matchmakingInterval) {
            clearInterval(this.matchmakingInterval);
            this.matchmakingInterval = null;
            console.log('Matchmaking service stopped');
        }
    }
}

export const matchmakingService = new MatchmakingService();
