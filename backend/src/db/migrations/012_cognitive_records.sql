CREATE TABLE IF NOT EXISTS cognitive_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  situation        TEXT NOT NULL,
  auto_thought     TEXT NOT NULL,
  evidence         TEXT NOT NULL,
  balanced_thought TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
