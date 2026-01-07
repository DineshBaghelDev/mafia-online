import { Server, Socket } from 'socket.io';
import { gameService } from '../services/gameService';

export const setupSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        socket.on('room:create', async (data: { username: string }) => {
            try {
                const room = await gameService.createRoom(socket.id, data.username);
                socket.join(room.id);
                socket.emit('room:joined', { roomId: room.id, playerId: socket.id });
                io.to(room.id).emit('room:update', room);
            } catch (e: any) {
                socket.emit('error', { message: e.message });
            }
        });

        socket.on('room:join', async (data: { code: string, username: string }) => {
            try {
                const room = await gameService.joinRoom(data.code, socket.id, data.username);
                socket.join(room.id);
                socket.emit('room:joined', { roomId: room.id, playerId: socket.id });
                io.to(room.id).emit('room:update', room);
            } catch (e: any) {
                socket.emit('error', { message: e.message });
            }
        });
        
        socket.on('room:start', async (data: { roomId: string }) => {
            try {
                const room = await gameService.startGame(data.roomId);
                io.to(room.id).emit('room:update', room);
            } catch (e: any) {
                socket.emit('error', { message: e.message });
            }
        });

        socket.on('disconnect', async () => {
             // Placeholder for proper disconnect handling
        });
    });
};
