ALTER TABLE generated_photos ADD COLUMN r2_key TEXT;
ALTER TABLE generated_photos ADD COLUMN visible_until TEXT;
ALTER TABLE generated_photos ADD COLUMN delete_after TEXT;

CREATE INDEX IF NOT EXISTS idx_generated_photos_user_visible
  ON generated_photos(user_id, visible_until DESC);

CREATE INDEX IF NOT EXISTS idx_generated_photos_user_delete_after
  ON generated_photos(user_id, delete_after DESC);
