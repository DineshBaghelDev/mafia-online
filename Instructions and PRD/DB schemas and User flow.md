# 1. SYSTEM OVERVIEW (MULTI-GAME, MULTI-ROOM)

### Core Principles (Among Us–style)

* **Room = isolated game state**
* **Server authoritative**
* **Stateless frontend**
* **Ephemeral game state in Redis**
* **Persistent minimal DB writes**
* **Matchmaking ≠ game logic**

### Separation of Concerns

```
Client
  ↓ WebSocket
Gateway (Socket Server)
  ↓
Matchmaking Service
  ↓
Game Engine (Room-scoped)
  ↓
Redis (Live State)
  ↓
PostgreSQL (Persistence)
```

---

# 2. DATABASE SCHEMAS (POSTGRES)

Only persist what matters long-term. Everything else lives in Redis.

---

## 2.1 Users (Anonymous-first, Upgradeable)

```sql
users (
  id UUID PRIMARY KEY,
  username VARCHAR(20),
  is_guest BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  last_seen TIMESTAMP
)
```

Notes:

* No password in MVP
* UUID generated server-side
* Cookie or localStorage maps client → user_id

---

## 2.2 Rooms (Lobbies + Games)

```sql
rooms (
  id UUID PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE,
  is_public BOOLEAN,
  status ENUM('lobby','in_game','ended'),
  max_players INT,
  host_id UUID,
  created_at TIMESTAMP,
  ended_at TIMESTAMP
)
```

Room code = short, human-readable (Among Us style).

---

## 2.3 Room Players (Snapshot, Not Live State)

```sql
room_players (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  was_kicked BOOLEAN DEFAULT false
)
```

Used for:

* Analytics
* Abuse tracing
* Reconnect validation

---

## 2.4 Games (Historical Record)

```sql
games (
  id UUID PRIMARY KEY,
  room_id UUID,
  winner ENUM('mafia','villagers'),
  total_rounds INT,
  started_at TIMESTAMP,
  ended_at TIMESTAMP
)
```

---

## 2.5 Game Roles (Post-Game Reveal)

```sql
game_roles (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  user_id UUID,
  role ENUM('mafia','detective','doctor','villager')
)
```

---

# 3. REDIS LIVE STATE (CRITICAL)

Redis holds **everything active**.

---

## 3.1 Room State (Key: `room:{roomId}`)

```json
{
  "phase": "lobby | night | day | voting | ended",
  "players": {
    "userId": {
      "alive": true,
      "role": "mafia",
      "connected": true
    }
  },
  "settings": {
    "discussionTime": 90,
    "voteTime": 30
  },
  "timers": {
    "phaseEndsAt": 1730000000
  }
}
```

---

## 3.2 Actions (Key: `room:{roomId}:actions`)

```json
{
  "mafiaKill": "userId",
  "doctorSave": "userId",
  "detectiveInspect": "userId"
}
```

---

## 3.3 Votes (Key: `room:{roomId}:votes`)

```json
{
  "voterUserId": "targetUserId"
}
```

---

## 3.4 Matchmaking Queue (Key: `matchmaking:public`)

```json
[
  "userId1",
  "userId2",
  ...
]
```

---

# 4. SOCKET EVENT MAP (COMPLETE)

Everything is explicit. No magic.

---

## 4.1 Connection & Identity

### Client → Server

```
socket.connect()
auth:identify { username }
```

### Server → Client

```
auth:success { userId }
auth:reconnect { roomId, gameState }
```

---

## 4.2 Matchmaking (Public Games)

### Client

```
matchmaking:join
matchmaking:leave
```

### Server

```
matchmaking:found { roomId }
```

Logic:

* Server groups players until `minPlayers` reached
* Auto-creates room
* Assigns host internally

---

## 4.3 Room / Lobby

### Client

```
room:create { isPublic, maxPlayers }
room:join { roomCode }
room:leave
room:ready
room:unready
room:kick { userId } (host only)
room:start (host only)
```

### Server

```
room:update { players, status }
room:error { reason }
```

---

## 4.4 Game Phases

### Server → Client

```
game:phase { phase, duration }
game:role { role } (private)
```

---

## 4.5 Night Actions

### Client → Server

```
action:mafiaKill { targetId }
action:doctorSave { targetId }
action:detectiveInspect { targetId }
```

### Server → Client

```
action:result { inspectResult } (detective only)
```

---

## 4.6 Day / Chat

### Client

```
chat:send { message }
```

### Server

```
chat:message { userId, message }
chat:mute { userId }
```

---

## 4.7 Voting

### Client

```
vote:cast { targetId }
```

### Server

```
vote:update { counts }
vote:result { eliminatedUserId }
```

---

## 4.8 Game End

### Server

```
game:end {
  winner,
  roles,
  stats
}
```

---

# 5. COMPLETE USER FLOW (SITE-LEVEL)

---

## 5.1 Landing Page

Options:

* **Play Public Game**
* **Create Private Lobby**
* **Join with Code**

No login wall.

---

## 5.2 Public Matchmaking Flow (Among Us Inspired)

1. User clicks **Play Public**
2. Added to matchmaking queue
3. System groups users (6–10)
4. Room auto-created
5. User auto-joins lobby
6. Short countdown
7. Game starts automatically

Key detail:

* No waiting for manual host action
* Prevents dead lobbies

---

## 5.3 Private Lobby Flow

1. User clicks **Create Lobby**
2. Chooses:

   * Max players
   * Public / Private
3. Room code generated
4. Share link
5. Players join
6. Ready up
7. Host starts game

---

## 5.4 In-Game Flow (Player POV)

```
Role Reveal (private)
   ↓
Night (restricted UI)
   ↓
Day (discussion)
   ↓
Voting
   ↓
Repeat
   ↓
End Screen
```

---

## 5.5 Reconnect Flow

If user disconnects:

* Server marks `connected=false`
* 30s grace period
* On reconnect:

```
auth:reconnect
→ restore room + state
```

After grace:

* Player eliminated or ignored depending on role

---

# 6. MATCHMAKING LOGIC (CRITICAL DETAIL)

### Public Matchmaking Rules

* Minimum players: 6
* Maximum wait: 30 seconds
* If timeout:

  * Start with fewer players OR
  * Merge queues

### Skill Matching (Optional Later)

* Games played
* Win rate
* Disconnect rate

---

# 7. SCALING STRATEGY

* One Socket Gateway per region
* Redis clustered
* Rooms sharded by roomId hash
* Sticky WebSocket sessions
* Stateless frontend deployment

---

# 8. WHY THIS WORKS

* Same model used by Among Us, Skribbl, Gartic
* No global locks
* Room-level isolation
* Redis prevents DB thrashing
* Socket events stay small and predictable
