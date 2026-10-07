use super::rpc_client::RpcEvent;
use crate::db::models::SorobanEvent;
use chrono::Utc;
use serde_json::json;
use uuid::Uuid;

pub struct EventParser;

impl EventParser {
    pub fn parse(rpc_event: &RpcEvent) -> Result<SorobanEvent, String> {
        // RPC events generally provide ID in the format ledger-txIndex-eventIndex
        // For a true tx_hash mapping we would need to fetch the transaction details
        let tx_hash = format!("derived-from-{}", rpc_event.id);

        Ok(SorobanEvent {
            id: Uuid::new_v4().to_string(),
            event_id: rpc_event.id.clone(),
            event_type: rpc_event.type_.clone(),
            ledger_sequence: rpc_event.ledger as i64,
            tx_hash,
            contract_id: rpc_event.contract_id.clone(),
            topics: json!(rpc_event.topic),
            data: rpc_event.value.clone(),
            created_at: Utc::now(), // Best effort if not strictly parsing ledger_closed_at yet
            ingested_at: Utc::now(),
        })
    }
}
