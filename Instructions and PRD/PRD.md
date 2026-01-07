# Product Requirements Document (PRD)

**Product Name:** Mafia (Web)
**Platform:** Web (Desktop + Mobile Browser)
**Genre:** Social Deduction / Party / Strategy
**Target Users:** 16–35, casual + competitive players
**Session Length:** 10–25 minutes
**Multiplayer:** Real-time, 6–12 players per room

---

## 1. Objective

Build a **real-time online Mafia game** playable directly in a browser with:

* Low latency
* No app install
* Private + public rooms
* Text chat first (voice optional later)
* Clean UX for non-gamers

Primary success metric: **players completing ≥3 games per session**.

---

## 2. Problem Statement

Offline Mafia requires:

* A moderator
* Physical presence
* High friction setup

Existing online versions:

* Overloaded UI
* Paywalled roles
* Poor moderation
* Mobile-unfriendly

This product removes moderator dependency, simplifies UX, and ensures fair gameplay.

---

## 3. Goals & Non-Goals

### Goals

* Fully automated game flow (no human moderator)
* Fast room creation (<5 sec)
* Deterministic rule engine
* Abuse-resistant chat & voting
* Works on low-end devices

### Non-Goals (v1)

* Voice chat
* AI NPC players
* Monetization
* Ranked ladder
* Advanced role packs (>6 roles)

---

## 4. Core Gameplay Rules (Baseline)

### Roles (v1)

| Role      | Count | Description                      |
| --------- | ----- | -------------------------------- |
| Mafia     | 2–3   | Kill one player each night       |
| Detective | 1     | Can inspect one player per night |
| Doctor    | 1     | Can save one player per night    |
| Villager  | Rest  | No special powers                |

Role distribution auto-scales with player count.

---

## 5. User Personas

### 1. Casual Player

* Joins via invite link
* Plays with friends
* Minimal learning curve

### 2. Competitive Player

* Public lobbies
* Fast games
* Wants clean logic and fairness

### 3. Host / Organizer

* Creates private rooms
* Custom rules
* Kicks trolls

---

## 6. User Flow

### Entry Flow

1. Landing Page
2. “Create Room” or “Join Room”
3. Enter username (no auth required)
4. Lobby

### Lobby Flow

* See players list
* Ready / Not Ready toggle
* Host can:

  * Start game
  * Kick players
  * Change rules

### Game Loop

1. **Night Phase**

   * Mafia chooses target
   * Detective inspects
   * Doctor saves
2. **Day Phase**

   * Reveal death (or save)
   * Discussion (timer-based)
3. **Voting Phase**

   * Public vote
   * Player with majority eliminated
4. Repeat until win condition

### End Game

* Winner announcement
* Role reveal
* Play again / Leave

---

## 7. Functional Requirements

### 7.1 Room System

* Create room (private/public)
* 6–12 players
* Shareable invite link
* Auto-close inactive rooms

### 7.2 Lobby

* Player list with status
* Host badge
* Ready indicator
* Game settings panel

### 7.3 Game Engine

* State machine:

  * LOBBY → NIGHT → DAY → VOTE → END
* Server authoritative logic
* Deterministic role assignment
* Action resolution priority:

  1. Doctor save
  2. Mafia kill
  3. Detective inspect

### 7.4 Chat System

* Text-only
* Phase-restricted:

  * Mafia private chat at night
  * Public chat during day
* Anti-spam:

  * Rate limit
  * Mute on vote-out

### 7.5 Voting

* One vote per player
* Live vote count
* Tie resolution:

  * No elimination OR random (configurable)

### 7.6 Win Conditions

* Mafia wins: Mafia ≥ Villagers
* Villagers win: All Mafia eliminated

---

## 8. Non-Functional Requirements

### Performance

* Max latency: 150ms
* Room size ≤12 players
* Scales to 10k concurrent users

### Reliability

* Reconnect support (30 sec grace)
* Host migration if host leaves
* Server crash → room invalidation

### Security

* Server-side validation only
* No client-side authority
* Prevent vote spoofing
* Prevent role leaks

---

## 9. UX / UI Requirements

### Design Principles

* Minimal
* High contrast
* Mobile-first
* No clutter

### Key Screens

1. Landing Page
2. Lobby
3. Night Action Screen (role-specific)
4. Day Discussion
5. Voting Screen
6. End Game Summary

### Accessibility

* Color-blind safe
* Keyboard navigation
* Large tap targets

---

## 10. Tech Stack (Suggested)

### Frontend

* React / Next.js
* Tailwind / CSS Modules
* WebSockets for real-time sync

### Backend

* Node.js + Fastify / NestJS
* WebSocket server (Socket.IO / WS)
* Redis for room state
* Stateless API + in-memory game engine

### State Model

```text
Room
 ├── Players[]
 ├── Roles[]
 ├── Phase
 ├── Actions
 ├── Votes
 └── Timers
```

---

## 11. Edge Cases & Abuse Handling

* Player leaves mid-game → role removed, balance checked
* Mafia disconnect → game continues
* Troll spamming → auto mute
* Inactive players → auto kick
* Duplicate usernames → append suffix

---

## 12. Metrics & Analytics

### Core Metrics

* Avg games per session
* Drop-off per phase
* Game completion rate
* Avg discussion time
* Rejoin rate

### Logging

* Phase transitions
* Votes
* Disconnections
* Rule violations

---

## 13. MVP Scope (Strict)

Included:

* Text chat
* 4 roles
* Private + public rooms
* Web only

Excluded:

* Voice chat
* Accounts / login
* Monetization
* AI moderation
* Spectator mode

---

## 14. Risks

* Social deduction relies on chat quality
* Trolls reduce retention
* Low player counts kill game loops
* Latency breaks trust

Mitigation:

* Strong lobby control
* Clear timers
* Aggressive auto-cleanup

---

## 15. Future Enhancements (Post-MVP)

* Voice chat (WebRTC)
* Ranked mode
* Custom roles
* AI narrator
* Mobile app wrapper
* Replay system

