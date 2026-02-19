CREATE TABLE IF NOT EXISTS generated_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  image_data_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_photos_user_created
  ON generated_photos(user_id, created_at DESC);
