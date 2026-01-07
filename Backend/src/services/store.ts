import Redis from 'ioredis';
import { RoomState, MatchmakingPlayer } from '../types';

class Store {
    private redis: Redis;
    private rooms: Map<string, RoomState> = new Map(); // Fallback in-memory
    private matchmakingQueue: MatchmakingPlayer[] = [];

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy: (times) => {
                console.warn(`Redis connection failed. Retrying... (${times})`);
                if (times > 10) {
                    console.error('Redis connection failed after 10 attempts. Using in-memory fallback.');
                    return null;
                }
                return Math.min(times * 100, 3000);
            }
        });

        this.redis.on('error', (err) => {
            console.error('Redis error:', err);
        });

        this.redis.on('connect', () => {
            console.log('Redis connected successfully');
        });
    }

    private async useRedis(): Promise<boolean> {
        return this.redis.status === 'ready';
    }

    async createRoom(room: RoomState): Promise<RoomState> {
        if (await this.useRedis()) {
            await this.redis.set(`room:${room.id}`, JSON.stringify(room));
            await this.redis.set(`room:code:${room.code}`, room.id);
            await this.redis.expire(`room:${room.id}`, 3600 * 4); // 4 hour expiry
        } else {
            this.rooms.set(room.id, room);
        }
        return room;
    }

    async getRoom(id: string): Promise<RoomState | null> {
        if (await this.useRedis()) {
            const data = await this.redis.get(`room:${id}`);
            return data ? JSON.parse(data) : null;
        }
        return this.rooms.get(id) || null;
    }
    
    async getRoomByCode(code: string): Promise<RoomState | null> {
        if (await this.useRedis()) {
            const roomId = await this.redis.get(`room:code:${code}`);
            if (!roomId) return null;
            return this.getRoom(roomId);
        }
        
        for (const room of this.rooms.values()) {
            if (room.code === code) return room;
        }
        return null;
    }

    async updateRoom(id: string, room: RoomState): Promise<RoomState | null> {
        if (await this.useRedis()) {
            await this.redis.set(`room:${id}`, JSON.stringify(room));
            return room;
        }
        
        this.rooms.set(id, room);
        return room;
    }

    async deleteRoom(id: string): Promise<void> {
        const room = await this.getRoom(id);
        if (await this.useRedis()) {
            if (room) {
                await this.redis.del(`room:code:${room.code}`);
            }
            await this.redis.del(`room:${id}`);
        } else {
            this.rooms.delete(id);
        }
    }

    async saveRoom(room: RoomState): Promise<void> {
        await this.updateRoom(room.id, room);
    }

    // Matchmaking queue operations
    async addToMatchmaking(player: MatchmakingPlayer): Promise<void> {
        if (await this.useRedis()) {
            await this.redis.lpush('matchmaking:public', JSON.stringify(player));
        } else {
            this.matchmakingQueue.push(player);
        }
    }

    async removeFromMatchmaking(userId: string): Promise<void> {
        if (await this.useRedis()) {
            const queue = await this.redis.lrange('matchmaking:public', 0, -1);
            for (const item of queue) {
                const player = JSON.parse(item);
                if (player.userId === userId) {
                    await this.redis.lrem('matchmaking:public', 0, item);
                    break;
                }
            }
        } else {
            this.matchmakingQueue = this.matchmakingQueue.filter(p => p.userId !== userId);
        }
    }

    async getMatchmakingQueue(): Promise<MatchmakingPlayer[]> {
        if (await this.useRedis()) {
            const queue = await this.redis.lrange('matchmaking:public', 0, -1);
            return queue.map(item => JSON.parse(item));
        }
        return [...this.matchmakingQueue];
    }

    async clearMatchmakingQueue(count: number): Promise<void> {
        if (await this.useRedis()) {
            for (let i = 0; i < count; i++) {
                await this.redis.rpop('matchmaking:public');
            }
        } else {
            this.matchmakingQueue.splice(0, count);
        }
    }

    async getAllRooms(): Promise<RoomState[]> {
        if (await this.useRedis()) {
            const keys = await this.redis.keys('room:*');
            const rooms: RoomState[] = [];
            for (const key of keys) {
                if (!key.includes('room:code:')) {
                    const data = await this.redis.get(key);
                    if (data) rooms.push(JSON.parse(data));
                }
            }
            return rooms;
        }
        return Array.from(this.rooms.values());
    }

    async getPublicRooms(): Promise<RoomState[]> {
        const allRooms = await this.getAllRooms();
        return allRooms.filter(r => r.isPublic && r.phase === 'lobby');
    }

    async disconnect(): Promise<void> {
        await this.redis.quit();
    }
}

export const store = new Store();
