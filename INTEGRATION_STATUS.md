# Mafia Game - Integration Status & Remaining Work

## ✅ COMPLETED WORK

### Backend
- ✅ Fixed matchmaking service to emit `matchmaking:found` to clients
- ✅ Integrated matchmaking service with Socket.IO in `sockets/index.ts`
- ✅ Fixed phase types to use `role_reveal` and `game_end` consistently
- ✅ All socket events from DB schema are implemented
- ✅ Room management, player ready/kick/start logic working

### Frontend Core
- ✅ GameContext enhanced with:
  - Reconnection handling
  - Room state management (`setRoomId`)
  - Proper event listeners (room:joined, room:kicked, room:closed, auth:reconnect)
  - LocalStorage persistence for userId, roomId, roomCode
- ✅ Type definitions synced between frontend and backend
- ✅ Matchmaking page fully integrated with backend sockets
- ✅ Username flow complete with redirects

### Design System  
- ✅ Colors: #0E1117 background, #E63946 primary red
- ✅ Font: Manrope loaded via next/font/google
- ✅ Dark mode enforced with `className="dark"` on html
- ✅ Tailwind config with full color palette

## 🔧 REMAINING CRITICAL WORK

### 1. Lobby Page (`Frontend/src/app/lobby/[code]/page.tsx`)
**Current Status:** Basic placeholder  
**Needs:** Complete rewrite with proper socket integration

**Required Functionality:**
- Join room via `socket.emit('room:join', { code, username })`
- Listen to `room:update` and update UI in real-time
- Display player list with ready status
- Ready/Unready button (emit `room:ready`)
- Host: Start Game button (emit `room:start`)
- Host: Kick player functionality
- Copy room code button
- Navigate to `/game/[code]` when phase changes from 'lobby'
- Handle room:error, room:kicked, room:closed events

**Design Requirements:**
- Match `Design and Inspirational code/lobby_screen/code.html`
- Show room code prominently with copy button
- Grid layout for players (2 columns on desktop)
- Show host badge, ready status, player avatars (initials)
- Action buttons at bottom
- Max width 720px, centered
- Mobile: single column, full width

### 2. Create Page (`Frontend/src/app/create/page.tsx`)
**Current Status:** Has UI but no socket integration  
**Needs:** Connect settings UI to backend

**Required Changes:**
```typescript
const handleCreate = () => {
    if (!socket) return;
    
    socket.emit('room:create', { 
        username,
        isPublic: false,
        maxPlayers: 10
    });
    
    socket.once('room:joined', (data) => {
        router.push(`/lobby/${data.roomCode}`);
    });
};
```

**Settings to implement:**
- maxPlayers
- discussionTime
- votingTime
- nightTime
- Emit `room:settings` after room creation if needed

### 3. Game Phase Components
**Location:** `Frontend/src/components/game/*`

**Files exist but need socket integration:**

#### RoleRevealPhase.tsx
- Show role with icon and description
- Auto-transition after 5 seconds
- Role-specific colors (mafia=red, detective=blue, doctor=green)

#### NightPhase.tsx
- Mafia: Show target selection, emit `action:mafiaKill`
- Doctor: Show save selection, emit `action:doctorSave`
- Detective: Show inspect selection, emit `action:detectiveInspect`
- Listen for `action:submitted`
- Show timer countdown

#### DayPhase.tsx
- Display chat messages from `room.chatHistory`
- Show night result (`room.nightResult`)
- Chat input with send button
- Emit `chat:send`
- Listen for `chat:message`
- Dead players can read but not send

#### VotingPhase.tsx
- Show alive players as vote options
- Emit `vote:cast`
- Listen for `vote:update` (real-time vote counts)
- Show timer
- Display result when phase ends

#### GameEndPhase.tsx
- Show winner (mafia/villagers)
- Reveal all player roles
- Play Again button → navigate to `/`
- Show game stats

### 4. Responsive Design
**All pages need:**
- Mobile-first approach
- Max width 720px on desktop
- Single column on mobile
- Touch-friendly buttons (min 44px)
- Responsive text sizes
- Test on viewport widths: 375px, 768px, 1024px

### 5. Environment Setup
**Create `.env.local` in Frontend:**
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Create `.env` in Backend:**
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🚀 TESTING FLOW

1. Start backend: `cd Backend && npm run dev`
2. Start frontend: `cd Frontend && npm run dev`
3. Test flow:
   - Landing page → Username entry
   - Click "Play Public Game" → Matchmaking → Lobby
   - Or click "Create Private" → Settings → Lobby
   - Or enter code → Lobby
   - In lobby: Ready up → Start game → Game phases
   - Complete game → End screen

## 📋 CHECKLIST FOR COMPLETION

- [ ] Lobby page fully functional with socket events
- [ ] Create page emits room:create correctly
- [ ] All game phase components integrated with sockets
- [ ] Chat system working in day phase
- [ ] Voting system with real-time updates
- [ ] Role reveal with proper styling per role
- [ ] Night actions functional for all roles
- [ ] Game end screen shows results
- [ ] Responsive on mobile (375px width)
- [ ] Responsive on tablet (768px width)
- [ ] No console errors in browser
- [ ] Backend handles disconnections gracefully
- [ ] Reconnection works (refresh page in lobby)

## 🐛 KNOWN ISSUES TO FIX

1. **Lobby Page:** Not reading room state from socket events properly
2. **Create Page:** Settings UI doesn't emit to backend
3. **Game Components:** Exist but not wired to socket events
4. **Matchmaking:** Needs to handle player leaving queue
5. **Mobile Layout:** Some pages not optimized for small screens

## 💡 QUICK REFERENCE

### Socket Events (Client → Server)
- `auth:identify` - Identify user
- `matchmaking:join` - Join queue
- `matchmaking:leave` - Leave queue
- `room:create` - Create room
- `room:join` - Join room
- `room:leave` - Leave room
- `room:ready` - Toggle ready
- `room:kick` - Kick player (host)
- `room:settings` - Update settings (host)
- `room:start` - Start game (host)
- `chat:send` - Send message
- `vote:cast` - Cast vote
- `action:mafiaKill` - Mafia kill
- `action:doctorSave` - Doctor save
- `action:detectiveInspect` - Detective inspect

### Socket Events (Server → Client)
- `auth:success` - Auth confirmed
- `auth:reconnect` - Reconnection data
- `room:joined` - Successfully joined
- `room:update` - Room state changed
- `room:error` - Error occurred
- `room:kicked` - You were kicked
- `room:closed` - Room deleted
- `matchmaking:queued` - Queue status
- `matchmaking:found` - Game found
- `game:phase` - Phase changed
- `game:role` - Your role (private)
- `game:end` - Game ended
- `chat:message` - New message
- `vote:update` - Vote counts
- `action:submitted` - Action confirmed
- `night:result` - Night results

## 📁 FILE PRIORITIES

1. **HIGH PRIORITY (Must fix):**
   - `Frontend/src/app/lobby/[code]/page.tsx` - Complete rewrite
   - `Frontend/src/app/create/page.tsx` - Add socket integration
   - `Frontend/src/components/game/DayPhase.tsx` - Chat + night results
   - `Frontend/src/components/game/VotingPhase.tsx` - Vote system

2. **MEDIUM PRIORITY:**
   - `Frontend/src/components/game/NightPhase.tsx` - Night actions
   - `Frontend/src/components/game/RoleRevealPhase.tsx` - Polish styling
   - `Frontend/src/components/game/GameEndPhase.tsx` - Results display

3. **LOW PRIORITY (Polish):**
   - Add loading states
   - Add error toasts (replace alerts)
   - Optimize animations
   - Add sound effects
   - Improve mobile touch feedback

## 🎨 DESIGN COMPLIANCE

Ensure all pages match the design specifications:
- Background: #0E1117 (near-black)
- Primary: #E63946 (red)
- Surface: #161B22
- Border: #30363d
- Text: #F1F1F1
- Muted: #9CA3AF
- Font: Manrope, sans-serif
- Border radius: 12-16px
- No bright colors except primary red
- Dark, moody, suspenseful theme
- Clean and modern, not cartoonish

## ⚡ PERFORMANCE NOTES

- Lobby updates should be instant (<100ms)
- Chat messages should appear in real-time
- Vote counts should update live
- Phase transitions should be smooth
- Reconnection should restore full state
- No memory leaks from socket listeners (always clean up in useEffect)

---

**Next Step:** Start with the Lobby page rewrite, as it's the critical hub connecting all other flows.
