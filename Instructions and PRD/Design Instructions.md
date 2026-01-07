# FRONTEND WIREFRAME & ART DIRECTION

**Product:** Mafia (Web)
**Design Reference DNA:**

* Among Us (clarity, readability, flow)
* Minimalist social games (Skribbl, Gartic)
* Modern dark UI (Discord-lite, Notion dark)

---

## 1. GLOBAL ART STYLE (MANDATORY)

### Visual Tone

* Dark, moody, suspenseful
* Clean and modern, not cartoonish
* No realism, no photoreal textures

### Color Palette

* Background: `#0E1117` (near-black)
* Primary accent: `#E63946` (mafia red)
* Secondary accent: `#457B9D` (info blue)
* Success: `#2A9D8F`
* Warning / Dead: `#6C757D`
* Text primary: `#F1F1F1`
* Text muted: `#9CA3AF`

### Typography

* **Primary:** Inter / Manrope
* Headings: Semi-bold
* Body: Regular
* All caps ONLY for phase titles

### UI Shape Language

* Rounded corners: 12–16px
* Flat UI (no skeuomorphism)
* Soft shadows only on modals

---

## 2. SCREEN-BY-SCREEN WIREFRAME

---

## 2.1 LANDING PAGE

### Layout

```
----------------------------------
|          MAFIA LOGO             |
|     "Trust No One."             |
|                                 |
|  [ PLAY PUBLIC GAME ]           |
|                                 |
|  [ CREATE PRIVATE LOBBY ]       |
|                                 |
|  [ JOIN WITH CODE ]             |
|                                 |
|   Footer: Rules | Credits       |
----------------------------------
```

### Design Details

* Center-aligned
* Logo: minimalist text logo + subtle knife icon
* Background: slow animated gradient or subtle noise texture
* Buttons:

  * Tall (48–56px)
  * Full-width on mobile
  * Red hover glow on primary button

### Assets

* Logo: flat SVG
* Background: procedural dark texture
* Button icons: none (text only)

---

## 2.2 USERNAME MODAL (FIRST ENTRY)

### Layout

```
-------------------------
| Enter your name       |
| [______________]     |
|                      |
| [ CONTINUE ]         |
-------------------------
```

### Rules

* Max 12 chars
* Auto-focus input
* No avatar yet (intentional)

---

## 2.3 PUBLIC MATCHMAKING SCREEN

### Layout

```
----------------------------------
| Finding Players...              |
|                                 |
|   ● ● ● ● ○ ○                   |
|                                 |
| Players Found: 4 / 8            |
|                                 |
| [ CANCEL ]                      |
----------------------------------
```

### Behavior

* Animated dots fill as players join
* No chat here
* Auto-transition when full

### Assets

* Animated dots (SVG or CSS)
* No characters shown (prevents bias)

---

## 2.4 LOBBY SCREEN

### Layout (Desktop)

```
-----------------------------------------
| Room Code: X7K2P       (Copy Icon)     |
|---------------------------------------|
| Players (8/10)                        |
|---------------------------------------|
| ● Dinesh        READY                 |
| ● Alex          NOT READY             |
| ● Sam           READY                 |
| ● Maya          READY                 |
|                                     |
|---------------------------------------|
| Settings (Host only)                  |
| Discussion Time: 90s                  |
| Voting Time: 30s                      |
|                                     |
| [ READY ]        [ START GAME ]       |
-----------------------------------------
```

### Visual Rules

* Player dots:

  * Green = Ready
  * Grey = Not Ready
* Host badge next to name
* Kick icon appears only for host

### Assets

* Status dots
* Copy icon
* Minimal dividers

---

## 2.5 ROLE REVEAL SCREEN (PRIVATE)

### Layout

```
----------------------------------
| YOUR ROLE                       |
|                                 |
|        🗡 MAFIA                  |
|                                 |
| "Eliminate the villagers."      |
|                                 |
| [ TAP TO CONTINUE ]             |
----------------------------------
```

### Design

* Full-screen
* Role color overlay:

  * Mafia → red tint
  * Detective → blue
  * Doctor → green
* Short vibration / glow animation

### Assets

* Role icons (flat, symbolic)

  * Knife
  * Magnifying glass
  * Cross
  * Silhouette

---

## 2.6 NIGHT PHASE SCREEN

### Layout

```
----------------------------------
| NIGHT                            |
| The city sleeps...               |
|--------------------------------|
| Choose a target:                |
|                                 |
| [ Player A ]                    |
| [ Player B ]                    |
| [ Player C ]                    |
|                                 |
| [ CONFIRM ]                     |
----------------------------------
```

### Behavior

* Only alive players shown
* Mafia sees team highlighted
* Disabled buttons after confirm

### Background

* Darker shade
* Subtle animated fog

---

## 2.7 DAY DISCUSSION SCREEN

### Layout

```
-----------------------------------------
| DAY 2                                 |
|---------------------------------------|
| ❌ Alex was eliminated                |
|---------------------------------------|
| Chat                                  |
|---------------------------------------|
| Maya: it's obviously sam              |
| Sam: no way                           |
|                                     |
|---------------------------------------|
| [ Type message... ]   [ SEND ]        |
-----------------------------------------
```

### Chat Rules

* Scrollable
* Message rate limit indicator
* Dead players:

  * Greyed name
  * “(dead)” tag
  * Read-only

### Assets

* Minimal chat bubbles
* No avatars (text-only = fairness)

---

## 2.8 VOTING SCREEN

### Layout

```
----------------------------------
| VOTING                           |
| Time left: 18s                   |
|--------------------------------|
| Who should be eliminated?       |
|                                 |
| ○ Player A                      |
| ○ Player B                      |
| ○ Player C                      |
|                                 |
| [ CONFIRM VOTE ]                |
----------------------------------
```

### Behavior

* Vote counts hidden until end
* Selected option highlighted
* Lock after submission

---

## 2.9 ELIMINATION RESULT SCREEN

### Layout

```
----------------------------------
| Player B was eliminated          |
|                                 |
| Role: VILLAGER                  |
|                                 |
| [ CONTINUE ]                    |
----------------------------------
```

### Design

* Fade-in animation
* Role reveal color flash
* Short pause before next phase

---

## 2.10 GAME END SCREEN

### Layout

```
-----------------------------------------
| VILLAGERS WIN 🎉                     |
|---------------------------------------|
| Final Roles                          |
|---------------------------------------|
| Alex      Mafia                      |
| Sam       Detective                  |
| Maya      Villager                   |
| You       Doctor                     |
|                                     |
|---------------------------------------|
| [ PLAY AGAIN ]   [ EXIT ]            |
-----------------------------------------
```

### Design

* Confetti / subtle effect
* Clear winner color theme
* No leaderboard (intentional)

---

## 3. RESPONSIVE RULES

### Mobile

* Single-column
* Bottom-fixed action buttons
* Chat expands full screen

### Desktop

* Fixed-width center column
* Max width: 720px
* Background visible on sides

---

## 4. ASSET GENERATION PROMPTS (READY TO USE)

### Role Icons Prompt

```
Flat minimalist game icon, dark theme, symbolic role icon, 
simple vector style, no gradients, high contrast, 
designed for dark UI, mafia role, knife symbol
```

### Background Prompt

```
Dark atmospheric game background, subtle noise texture,
low contrast, no characters, suspense mood, minimal detail
```

---

## 5. DESIGN DO-NOTS (IMPORTANT)

* No avatars (prevents profiling)
* No bright colors
* No emojis in chat
* No clutter
* No visible stats mid-game

---

## 6. WHY THIS UI WORKS

* Zero learning curve
* Phase clarity > aesthetics
* Text-first = social deduction purity
* Works equally on phone and desktop
* Designers can execute without guessing

