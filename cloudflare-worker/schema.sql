-- D1 schema for billing/credits (v1)
CREATE TABLE IF NOT EXISTS wallets (
  user_id TEXT PRIMARY KEY,
  paid_credits INTEGER NOT NULL DEFAULT 0,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  amount_krw INTEGER NOT NULL,
  paid_credits INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  entry_type TEXT NOT NULL, -- charge | usage | revert | refund
  paid_delta INTEGER NOT NULL DEFAULT 0,
  bonus_delta INTEGER NOT NULL DEFAULT 0,
  source_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_created ON payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_user_created ON credit_ledger(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_user_entry_source_unique
  ON credit_ledger(user_id, entry_type, source_id)
  WHERE source_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS coupon_reservations (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  campaign_key TEXT NOT NULL,
  coupons INTEGER NOT NULL,
  status TEXT NOT NULL, -- reserved | consumed | released
  reason TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_coupon_reservations_campaign_status
  ON coupon_reservations(campaign_key, status, expires_at DESC);

CREATE TABLE IF NOT EXISTS generated_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  image_data_url TEXT,
  r2_key TEXT,
  visible_until TEXT,
  delete_after TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_photos_user_created
  ON generated_photos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_photos_user_visible
  ON generated_photos(user_id, visible_until DESC);
CREATE INDEX IF NOT EXISTS idx_generated_photos_user_delete_after
  ON generated_photos(user_id, delete_after DESC);
