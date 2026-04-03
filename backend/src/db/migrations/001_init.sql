CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  password_hash TEXT,
  guest_token UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('guided', 'free')),
  intensity SMALLINT CHECK (intensity BETWEEN 1 AND 5),
  trigger_event TEXT,
  protection TEXT,
  raw_emotion TEXT,
  reflection TEXT,
  emotion_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  my_standard TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  should_content TEXT NOT NULL,
  want_content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('family', 'peers', 'society', 'self')),
  feeling_tags TEXT[] DEFAULT '{}',
  chosen TEXT NOT NULL DEFAULT 'pending' CHECK (chosen IN ('should', 'want', 'neither', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
