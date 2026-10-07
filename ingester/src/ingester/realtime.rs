use super::IngesterService;
use crate::db::repository::Repository;
use crate::stellar::{event_parser::EventParser, rpc_client::SorobanRpcClient};
use async_trait::async_trait;
use std::time::Duration;
use tracing::{info, warn};

pub struct RealtimeIngester {
    rpc_client: SorobanRpcClient,
    repo: Repository,
    poll_interval: Duration,
    batch_size: u32,
}

impl RealtimeIngester {
    pub fn new(rpc_client: SorobanRpcClient, repo: Repository, poll_interval_ms: u64, batch_size: u32) -> Self {
        Self {
            rpc_client,
            repo,
            poll_interval: Duration::from_millis(poll_interval_ms),
            batch_size,
        }
    }
}

#[async_trait]
impl IngesterService for RealtimeIngester {
    async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Starting realtime ingester");

        let mut current_cursor = None;
        let mut start_ledger = self.rpc_client.get_latest_ledger().await?;

        if let Ok(Some(state)) = self.repo.get_ingester_state("realtime").await {
            start_ledger = state.last_ingested_ledger as u32;
            current_cursor = state.last_cursor;
        }

        loop {
            match self.rpc_client.get_events(start_ledger, self.batch_size, current_cursor.clone()).await {
                Ok(response) => {
                    if !response.events.is_empty() {
                        let mut db_events = Vec::new();
                        let mut last_ledger = start_ledger;

                        for rpc_event in &response.events {
                            if let Ok(parsed) = EventParser::parse(rpc_event) {
                                db_events.push(parsed);
                            }
                            last_ledger = rpc_event.ledger;
                            current_cursor = Some(rpc_event.paging_token.clone());
                        }

                        if let Err(e) = self.repo.insert_events(&db_events).await {
                            warn!("Failed to insert events: {}", e);
                        } else {
                            info!("Ingested {} events up to ledger {}", db_events.len(), last_ledger);
                            let _ = self.repo.update_ingester_state("realtime", last_ledger as i64, current_cursor.clone()).await;
                            start_ledger = last_ledger;
                        }
                    }
                }
                Err(e) => {
                    warn!("Failed to fetch events: {}", e);
                }
            }

            tokio::time::sleep(self.poll_interval).await;
        }
    }
}
