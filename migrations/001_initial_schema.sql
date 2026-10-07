-- Soroban events table
CREATE TABLE soroban_events (
  id BIGSERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'contract', 'system', 'diagnostic'
  ledger_sequence BIGINT NOT NULL,
  tx_hash VARCHAR(64) NOT NULL,
  contract_id VARCHAR(56) NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]',
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL, -- when event occurred on chain
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ledger info table
CREATE TABLE ledgers (
  sequence BIGINT PRIMARY KEY,
  hash VARCHAR(64) UNIQUE NOT NULL,
  prev_hash VARCHAR(64) NOT NULL,
  closed_at TIMESTAMPTZ NOT NULL,
  total_events INT NOT NULL DEFAULT 0,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contract info table (aggregated)
CREATE TABLE contracts (
  contract_id VARCHAR(56) PRIMARY KEY,
  wasm_id VARCHAR(64),
  creator_id VARCHAR(56),
  created_at_ledger BIGINT NOT NULL,
  last_activity_ledger BIGINT,
  total_events BIGINT NOT NULL DEFAULT 0,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ingester state table (cursor tracking)
CREATE TABLE ingester_state (
  id VARCHAR(50) PRIMARY KEY,
  last_ingested_ledger BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial indexing for common query patterns
CREATE INDEX idx_soroban_events_contract_id ON soroban_events(contract_id);
CREATE INDEX idx_soroban_events_ledger_seq ON soroban_events(ledger_sequence);
CREATE INDEX idx_soroban_events_tx_hash ON soroban_events(tx_hash);
CREATE INDEX idx_soroban_events_created_at ON soroban_events(created_at);
-- Index for querying topics efficiently
CREATE INDEX idx_soroban_events_topics ON soroban_events USING GIN (topics);
