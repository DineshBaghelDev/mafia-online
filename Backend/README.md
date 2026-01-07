# Mafia Game Backend

Real-time multiplayer Mafia game server built with Fastify and Socket.IO.

## Features

- ✅ Real-time WebSocket communication
- ✅ Room-based game isolation
- ✅ Redis for live state (with in-memory fallback)
- ✅ PostgreSQL schemas for future persistence
- ✅ Public matchmaking system
- ✅ Private and public lobbies
- ✅ Complete game state machine
- ✅ Role-based night actions
- ✅ Voting system with tie resolution
- ✅ Chat system (public & mafia private)
- ✅ Player reconnection support
- ✅ Host migration on disconnect

## Prerequisites

- Node.js 18+ 
- Redis (optional - will fallback to in-memory)
- PostgreSQL (optional - for future persistence)

## Installation

```bash
cd Backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
NODE_ENV=development

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# PostgreSQL (for future use)
DATABASE_URL=postgresql://user:password@localhost:5432/mafia_db

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Socket Events

### Authentication
- `auth:identify` - Identify user and handle reconnection
- `auth:success` - Successful authentication
- `auth:reconnect` - Reconnect to existing game

### Matchmaking
- `matchmaking:join` - Join public matchmaking queue
- `matchmaking:leave` - Leave matchmaking queue
- `matchmaking:queued` - Queue status update

### Room/Lobby
- `room:create` - Create new room
- `room:join` - Join room by code
- `room:leave` - Leave current room
- `room:ready` - Toggle ready status
- `room:kick` - Kick player (host only)
- `room:settings` - Update room settings (host only)
- `room:start` - Start game (host only)
- `room:update` - Room state update
- `room:error` - Error message

### Game Phases
- `game:phase` - Phase transition notification
- `game:role` - Private role reveal
- `game:getState` - Request current game state
- `game:end` - Game ended

### Night Actions
- `action:mafiaKill` - Mafia selects kill target
- `action:doctorSave` - Doctor selects save target
- `action:detectiveInspect` - Detective selects inspect target
- `action:submitted` - Action confirmed
- `action:result` - Detective inspect result (private)
- `night:result` - Night phase results

### Chat
- `chat:send` - Send chat message
- `chat:message` - Receive chat message

### Voting
- `vote:cast` - Cast vote
- `vote:update` - Vote counts update
- `vote:result` - Voting result

## Game Flow

1. **Lobby Phase** - Players join and ready up
2. **Role Reveal** - Players see their assigned roles (5s)
3. **Night Phase** - Special roles perform actions (30s)
4. **Day Phase** - Discussion about night results (90s)
5. **Voting Phase** - Vote to eliminate a player (30s)
6. Repeat steps 3-5 until win condition
7. **End Phase** - Show winner and all roles

## Role Distribution

- 4-6 players: 1 Mafia, 1 Doctor, 1 Detective, rest Villagers
- 7-9 players: 2 Mafia, 1 Doctor, 1 Detective, rest Villagers
- 10-12 players: 3 Mafia, 1 Doctor, 1 Detective, rest Villagers

## Win Conditions

- **Villagers win**: All Mafia eliminated
- **Mafia wins**: Mafia count ≥ Villager count

## Architecture

```
Client (WebSocket)
      ↓
Socket Gateway (index.ts)
      ↓
Game Service (gameService.ts)
      ↓
Store (Redis/In-Memory)
```

### Services

- **gameService.ts** - Core game logic and state machine
- **matchmakingService.ts** - Public matchmaking queue
- **store.ts** - Redis/in-memory data layer

### State Management

- Live state: Redis (with in-memory fallback)
- Persistent data: PostgreSQL (future)
- Room isolation: Each room is independent
- Timer management: Automatic phase transitions

## Development Notes

- Server is authoritative - all validation server-side
- Rooms auto-delete when empty
- 30-second grace period for reconnection
- Automatic host migration on disconnect
- Anti-spam: 500 char message limit, dead players can't chat
- Matchmaking: Min 6 players, max 30s wait time

## Testing Redis Connection

```bash
# Install Redis (Windows - using Chocolatey)
choco install redis-64

# Or use Docker
docker run -d -p 6379:6379 redis

# Test connection
redis-cli ping
```

## API Health Check

GET http://localhost:3001/health

## License

MIT
