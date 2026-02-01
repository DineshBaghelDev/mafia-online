# Mafia Online - Multiplayer Social Deduction Game

A real-time multiplayer implementation of the classic Mafia (Werewolf) party game. Built with Next.js, Fastify, and Socket.IO.

## 🎮 Features

- **Real-time multiplayer gameplay** with WebSocket communication
- **Public matchmaking** - join random games with other players
- **Private rooms** - create custom games with friends using room codes
- **Multiple roles**: Mafia, Detective, Doctor, and Villager
- **Phase-based gameplay**: Night actions, day discussion, and voting
- **Ghost spectator mode** - eliminated players can watch the game
- **Responsive design** - works on desktop and mobile
- **Professional UI** - dark theme with smooth animations

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Manrope Font** - Modern UI typography

### Backend
- **Fastify** - High-performance Node.js server
- **Socket.IO** - WebSocket server
- **TypeScript** - Type-safe backend
- **Redis** - State management (with in-memory fallback)
- **PostgreSQL** - Database schemas (ready for persistence)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Redis (optional - will use in-memory fallback)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Mafia
```

### 2. Backend Setup

```bash
cd Backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your settings

# Start the backend
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd Frontend
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start the frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎯 How to Play

1. **Create a Room** - Host a private game or join matchmaking
2. **Wait for Players** - Need 4-10 players to start
3. **Role Assignment** - Each player receives a secret role
4. **Night Phase** - Special roles perform their actions
5. **Day Discussion** - Players discuss and deduce who the Mafia are
6. **Voting Phase** - Vote to eliminate a player
7. **Win Condition** - Villagers win by eliminating all Mafia, Mafia wins by equaling/outnumbering Villagers

## 🎭 Roles

- **👤 Villager** - No special abilities, use deduction to find Mafia
- **🔫 Mafia** - Kill one player each night, coordinate with other Mafia
- **🔍 Detective** - Inspect one player each night to learn their role
- **💊 Doctor** - Protect one player each night from being killed

## 🏗️ Project Structure

```
Mafia/
├── Frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # Pages and routes
│   │   ├── components/# React components
│   │   ├── context/   # React context providers
│   │   └── types.ts   # TypeScript types
│   └── package.json
├── Backend/           # Fastify server
│   ├── src/
│   │   ├── services/  # Game logic and state management
│   │   ├── sockets/   # Socket.IO event handlers
│   │   ├── db/        # Database schemas
│   │   └── index.ts   # Server entry point
│   └── package.json
└── README.md
```

## 🚢 Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in environment variables
2. Configure `CORS_ORIGIN` to your frontend URL
3. Set up Redis (recommended for production)
4. Build and start:

```bash
npm run build
npm start
```

### Frontend Deployment

1. Set `NEXT_PUBLIC_SOCKET_URL` to your backend URL
2. Build the application:

```bash
npm run build
npm start
```

**Recommended Platforms:**
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS Amplify
- **Redis**: Redis Cloud, Upstash, Railway

## 🔧 Configuration

### Backend Environment Variables

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend.com
```

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue on GitHub.