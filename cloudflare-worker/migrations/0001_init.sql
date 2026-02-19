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
