-- PostgreSQL Schema for Mafia Game
-- This is for future persistence. Current MVP uses Redis for live state.

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) NOT NULL,
  is_guest BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  status VARCHAR(20) CHECK (status IN ('lobby', 'in_game', 'ended')),
  max_players INT DEFAULT 10,
  host_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- Room Players (Historical)
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  was_kicked BOOLEAN DEFAULT false
);

-- Games (Historical Record)
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  winner VARCHAR(20) CHECK (winner IN ('mafia', 'villagers')),
  total_rounds INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- Game Roles (Post-Game Reveal)
CREATE TABLE IF NOT EXISTS game_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) CHECK (role IN ('mafia', 'detective', 'doctor', 'villager'))
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_games_room ON games(room_id);
