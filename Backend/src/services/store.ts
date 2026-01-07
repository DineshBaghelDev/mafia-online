import { RoomState } from '../types';

class Store {
    // In-memory storage for MVP
    private rooms: Map<string, RoomState> = new Map();

    async createRoom(room: RoomState): Promise<RoomState> {
        this.rooms.set(room.id, room);
        return room;
    }

    async getRoom(id: string): Promise<RoomState | undefined> {
        return this.rooms.get(id);
    }
    
    async getRoomByCode(code: string): Promise<RoomState | undefined> {
        for (const room of this.rooms.values()) {
            if (room.code === code) return room;
        }
        return undefined;
    }

    async updateRoom(id: string, update: Partial<RoomState>): Promise<RoomState | undefined> {
        const room = await this.getRoom(id);
        if (!room) return undefined;
        
        Object.assign(room, update);
        // Ensure nested updates like players are handled if needed, for now simple Object.assign
        // For deep updates, we'd need better logic or just overwrite the whole state
        this.rooms.set(id, room);
        return room;
    }

    async deleteRoom(id: string): Promise<void> {
        this.rooms.delete(id);
    }

    async saveRoom(room: RoomState): Promise<void> {
        this.rooms.set(room.id, room);
    }
}

export const store = new Store();
