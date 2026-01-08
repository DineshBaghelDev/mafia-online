import { Server, Socket } from 'socket.io';
import { gameService } from '../services/gameService';
import { matchmakingService } from '../services/matchmakingService';
import { store } from '../services/store';
import { RoomState } from '../types';

// Track user sessions
const userSessions = new Map<string, string>(); // socketId -> userId
const socketToRoom = new Map<string, string>(); // socketId -> roomId

export const setupSockets = (io: Server) => {
    // Connect matchmaking service to io
    matchmakingService.setIoServer(io);
    
    io.on('connection', (socket: Socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // ===== AUTHENTICATION & IDENTITY =====
        
        socket.on('auth:identify', async (data: { username: string; userId?: string }) => {
            try {
                const userId = data.userId || socket.id;
                userSessions.set(socket.id, userId);
                
                socket.emit('auth:success', { userId });
                
                // Check if user was in a room (reconnection)
                const rooms = await store.getAllRooms();
                for (const room of rooms) {
                    if (room.players[userId]) {
                        await gameService.reconnectPlayer(room.id, userId);
                        socket.join(room.id);
                        socketToRoom.set(socket.id, room.id);
                        
                        const updatedRoom = await store.getRoom(room.id);
                        socket.emit('auth:reconnect', { 
                            roomId: room.id, 
                            gameState: updatedRoom 
                        });
                        io.to(room.id).emit('room:update', updatedRoom);
                        break;
                    }
                }
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== MATCHMAKING (PUBLIC GAMES) =====
        
        socket.on('matchmaking:join', async (data: { username: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                await matchmakingService.addToQueue(userId, data.username);
                
                const queueSize = await matchmakingService.getQueueSize();
                socket.emit('matchmaking:queued', { queueSize });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('matchmaking:leave', async () => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                await matchmakingService.removeFromQueue(userId);
                socket.emit('matchmaking:left');
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('matchmaking:getPublicRooms', async () => {
            try {
                const publicRooms = await store.getPublicRooms();
                socket.emit('matchmaking:publicRooms', { rooms: publicRooms });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== ROOM / LOBBY =====
        
        socket.on('room:create', async (data: { 
            username: string; 
            isPublic?: boolean; 
            maxPlayers?: number;
            settings?: {
                discussionTime?: number;
                votingTime?: number;
                nightTime?: number;
            }
        }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const room = await gameService.createRoom(
                    userId, 
                    data.username, 
                    data.isPublic || false,
                    data.maxPlayers || 10,
                    data.settings
                );
                
                socket.join(room.id);
                socketToRoom.set(socket.id, room.id);
                
                socket.emit('room:joined', { 
                    roomId: room.id, 
                    roomCode: room.code,
                    playerId: userId 
                });
                io.to(room.id).emit('room:update', room);
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('room:join', async (data: { code: string; username: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const room = await gameService.joinRoom(data.code, userId, data.username);
                
                socket.join(room.id);
                socketToRoom.set(socket.id, room.id);
                
                socket.emit('room:joined', { 
                    roomId: room.id, 
                    roomCode: room.code,
                    playerId: userId 
                });
                io.to(room.id).emit('room:update', room);
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('room:leave', async () => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (roomId) {
                    const room = await gameService.removePlayer(roomId, userId);
                    socket.leave(roomId);
                    socketToRoom.delete(socket.id);
                    
                    if (room) {
                        io.to(roomId).emit('room:update', room);
                    } else {
                        // Room deleted
                        io.to(roomId).emit('room:closed');
                    }
                }
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('room:ready', async (data: { ready: boolean }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.setReady(roomId, userId, data.ready);
                io.to(roomId).emit('room:update', room);
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('room:reset', async () => {
            try {
                const roomId = socketToRoom.get(socket.id);
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.resetRoomToLobby(roomId);
                io.to(roomId).emit('room:update', room);
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('room:kick', async (data: { targetId: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.kickPlayer(roomId, userId, data.targetId);
                
                // Notify kicked player
                const kickedSockets = await io.in(roomId).fetchSockets();
                for (const s of kickedSockets) {
                    const sUserId = userSessions.get(s.id);
                    if (sUserId === data.targetId) {
                        s.leave(roomId);
                        socketToRoom.delete(s.id);
                        s.emit('room:kicked');
                    }
                }
                
                io.to(roomId).emit('room:update', room);
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('room:settings', async (data: { 
            maxPlayers?: number;
            discussionTime?: number;
            votingTime?: number;
            nightTime?: number;
        }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.updateSettings(roomId, userId, data);
                io.to(roomId).emit('room:update', room);
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('room:start', async () => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.startGame(roomId, userId);
                
                // Send role reveal to each player
                Object.entries(room.players).forEach(([playerId, player]) => {
                    const playerSockets = Array.from(io.sockets.sockets.values())
                        .filter(s => userSessions.get(s.id) === playerId);
                    
                    playerSockets.forEach(s => {
                        s.emit('game:role', { role: player.role });
                    });
                });
                
                io.to(roomId).emit('room:update', room);
                io.to(roomId).emit('game:phase', { 
                    phase: room.phase,
                    duration: 5 // roleReveal duration
                });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== GAME PHASES =====

        socket.on('game:getState', async () => {
            try {
                const roomId = socketToRoom.get(socket.id);
                if (!roomId) throw new Error('Not in a room');
                
                const room = await store.getRoom(roomId);
                socket.emit('room:update', room);
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== NIGHT ACTIONS =====
        
        socket.on('action:mafiaKill', async (data: { targetId: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                await gameService.submitNightAction(roomId, userId, 'mafiaKill', data.targetId);
                socket.emit('action:submitted', { action: 'mafiaKill' });
                
                // Notify other mafia members
                const room = await store.getRoom(roomId);
                if (room) {
                    Object.entries(room.players).forEach(([playerId, player]) => {
                        if (player.role === 'mafia' && playerId !== userId) {
                            const mafiaSocket = Array.from(io.sockets.sockets.values())
                                .find(s => userSessions.get(s.id) === playerId);
                            if (mafiaSocket) {
                                mafiaSocket.emit('action:mafia_choice', { 
                                    targetId: data.targetId,
                                    chosenBy: userId
                                });
                            }
                        }
                    });
                }
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('action:doctorSave', async (data: { targetId: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                await gameService.submitNightAction(roomId, userId, 'doctorSave', data.targetId);
                socket.emit('action:submitted', { action: 'doctorSave' });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        socket.on('action:detectiveInspect', async (data: { targetId: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                await gameService.submitNightAction(roomId, userId, 'detectiveInspect', data.targetId);
                socket.emit('action:submitted', { action: 'detectiveInspect' });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== CHAT =====
        
        socket.on('chat:send', async (data: { message: string; isPrivate?: boolean; isGhost?: boolean }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.addChatMessage(
                    roomId, 
                    userId, 
                    data.message, 
                    data.isPrivate || false
                );
                
                const sender = room.players[userId];
                if (!sender) throw new Error('Player not found');
                
                const messageData = {
                    senderId: userId,
                    senderName: sender.username,
                    message: data.message,
                    timestamp: Date.now(),
                    isGhost: data.isGhost || false
                };
                
                if (data.isGhost) {
                    // Ghost chat: only send to dead players
                    Object.entries(room.players).forEach(([playerId, player]) => {
                        if (!player.isAlive) {
                            const playerSocket = Array.from(io.sockets.sockets.values())
                                .find(s => userSessions.get(s.id) === playerId);
                            if (playerSocket) {
                                playerSocket.emit('chat:message', messageData);
                            }
                        }
                    });
                } else if (data.isPrivate) {
                    // Send only to mafia members
                    Object.entries(room.players).forEach(([playerId, player]) => {
                        if (player.role === 'mafia') {
                            const playerSocket = Array.from(io.sockets.sockets.values())
                                .find(s => userSessions.get(s.id) === playerId);
                            if (playerSocket) {
                                playerSocket.emit('chat:message', messageData);
                            }
                        }
                    });
                } else {
                    // Public chat: send to alive players only
                    Object.entries(room.players).forEach(([playerId, player]) => {
                        if (player.isAlive) {
                            const playerSocket = Array.from(io.sockets.sockets.values())
                                .find(s => userSessions.get(s.id) === playerId);
                            if (playerSocket) {
                                playerSocket.emit('chat:message', messageData);
                            }
                        }
                    });
                }
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== MAFIA PRIVATE CHAT =====
        
        socket.on('mafia:message', async (data: { message: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.getRoom(roomId);
                if (!room) throw new Error('Room not found');
                
                const sender = room.players[userId];
                if (!sender || sender.role !== 'mafia') {
                    throw new Error('Only Mafia can use this chat');
                }
                
                // Broadcast to all mafia members
                Object.entries(room.players).forEach(([playerId, player]) => {
                    if (player.role === 'mafia') {
                        const playerSocket = Array.from(io.sockets.sockets.values())
                            .find(s => userSessions.get(s.id) === playerId);
                        if (playerSocket) {
                            playerSocket.emit('mafia:message', {
                                senderId: userId,
                                senderName: sender.username,
                                message: data.message,
                                timestamp: Date.now()
                            });
                        }
                    }
                });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== VOTING =====
        
        socket.on('vote:cast', async (data: { targetId: string }) => {
            try {
                const userId = userSessions.get(socket.id) || socket.id;
                const roomId = socketToRoom.get(socket.id);
                
                if (!roomId) throw new Error('Not in a room');
                
                const room = await gameService.castVote(roomId, userId, data.targetId);
                
                // Send vote update with counts
                const voteCounts: Record<string, number> = {};
                Object.values(room.votes).forEach(targetId => {
                    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
                });
                
                io.to(roomId).emit('vote:update', { 
                    votes: room.votes,
                    counts: voteCounts
                });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });

        // ===== DISCONNECT =====
        
        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);
            
            try {
                const userId = userSessions.get(socket.id);
                const roomId = socketToRoom.get(socket.id);
                
                if (userId && roomId) {
                    const room = await gameService.disconnectPlayer(roomId, userId);
                    if (room) {
                        io.to(roomId).emit('room:update', room);
                    }
                }
                
                // Clean up session
                if (userId) {
                    await matchmakingService.removeFromQueue(userId);
                }
                userSessions.delete(socket.id);
                socketToRoom.delete(socket.id);
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });

        // ===== PUBLIC ROOMS LIST =====
        
        socket.on('rooms:list', async () => {
            try {
                const rooms = await gameService.getPublicRooms();
                socket.emit('rooms:list', { rooms });
            } catch (error: any) {
                socket.emit('room:error', { reason: error.message });
            }
        });
    });

    // Phase transition broadcasts (called by gameService)
    const originalTransitionToNight = gameService.transitionToNight.bind(gameService);
    gameService.transitionToNight = async (roomId: string) => {
        const room = await originalTransitionToNight(roomId);
        io.to(roomId).emit('room:update', room);
        io.to(roomId).emit('game:phase', { 
            phase: 'night',
            duration: room.settings.nightTime
        });
        return room;
    };

    const originalResolveNightActions = gameService.resolveNightActions.bind(gameService);
    gameService.resolveNightActions = async (roomId: string) => {
        const room = await originalResolveNightActions(roomId);
        
        // Send night results
        if (room.nightResult) {
            io.to(roomId).emit('night:result', {
                killed: room.nightResult.killed,
                saved: room.nightResult.saved
            });
            
            // Send detective result privately
            if (room.nightResult.inspectResult) {
                Object.entries(room.players).forEach(([playerId, player]) => {
                    if (player.role === 'detective') {
                        const detectiveSocket = Array.from(io.sockets.sockets.values())
                            .find(s => userSessions.get(s.id) === playerId);
                        if (detectiveSocket) {
                            detectiveSocket.emit('action:result', {
                                inspectResult: room.nightResult!.inspectResult
                            });
                        }
                    }
                });
            }
        }
        
        io.to(roomId).emit('room:update', room);
        
        if (room.phase !== 'game_end') {
            io.to(roomId).emit('game:phase', { 
                phase: 'day',
                duration: room.settings.discussionTime
            });
        } else {
            io.to(roomId).emit('game:end', {
                winner: room.winner,
                players: room.players
            });
        }
        
        return room;
    };

    const originalTransitionToVoting = gameService.transitionToVoting.bind(gameService);
    gameService.transitionToVoting = async (roomId: string) => {
        const room = await originalTransitionToVoting(roomId);
        io.to(roomId).emit('room:update', room);
        io.to(roomId).emit('game:phase', { 
            phase: 'voting',
            duration: room.settings.votingTime
        });
        return room;
    };

    const originalResolveVoting = gameService.resolveVoting.bind(gameService);
    gameService.resolveVoting = async (roomId: string) => {
        const room = await originalResolveVoting(roomId);
        
        if (room.eliminatedThisRound) {
            io.to(roomId).emit('vote:result', {
                eliminatedUserId: room.eliminatedThisRound,
                role: room.players[room.eliminatedThisRound]?.role
            });
        }
        
        io.to(roomId).emit('room:update', room);
        
        if (room.phase === 'game_end') {
            io.to(roomId).emit('game:end', {
                winner: room.winner,
                players: room.players
            });
        } else {
            io.to(roomId).emit('game:phase', { 
                phase: 'night',
                duration: room.settings.nightTime
            });
        }
        
        return room;
    };
};

