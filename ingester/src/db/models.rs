use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SorobanEvent {
    pub id: String,
    pub event_id: String,
    pub event_type: String,
    pub ledger_sequence: i64,
    pub tx_hash: String,
    pub contract_id: String,
    pub topics: serde_json::Value,
    pub data: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub ingested_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct LedgerInfo {
    pub sequence: i64,
    pub hash: String,
    pub timestamp: DateTime<Utc>,
    pub tx_count: i32,
    pub operation_count: i32,
    pub closed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct ContractInfo {
    pub contract_id: String,
    pub first_seen_ledger: i64,
    pub last_event_ledger: i64,
    pub event_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct IngesterState {
    pub id: i32,
    pub mode: String,
    pub last_ingested_ledger: i64,
    pub last_cursor: Option<String>,
    pub updated_at: DateTime<Utc>,
}
