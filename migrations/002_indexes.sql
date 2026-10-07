-- Additional performance indexes

-- Composite index for getting recent events for a specific contract
CREATE INDEX idx_events_contract_ledger ON soroban_events(contract_id, ledger_sequence DESC);

-- Composite index for getting events of a specific type for a contract
CREATE INDEX idx_events_contract_type ON soroban_events(contract_id, event_type, created_at DESC);

-- Partial index for 'contract' event type (likely the most queried)
CREATE INDEX idx_events_contract_type_only ON soroban_events(contract_id, created_at DESC) 
WHERE event_type = 'contract';

-- BRIN index for time-series data on ledgers table
-- Good for large tables where data is inserted sequentially
CREATE INDEX idx_ledgers_closed_at_brin ON ledgers USING BRIN (closed_at);
CREATE INDEX idx_soroban_events_created_at_brin ON soroban_events USING BRIN (created_at);
