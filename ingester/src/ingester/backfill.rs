use super::IngesterService;
use crate::db::repository::Repository;
use crate::stellar::{event_parser::EventParser, rpc_client::SorobanRpcClient};
use async_trait::async_trait;
use tracing::{info, warn};

pub struct BackfillIngester {
    rpc_client: SorobanRpcClient,
    repo: Repository,
    start_ledger: u32,
    batch_size: u32,
}

impl BackfillIngester {
    pub fn new(rpc_client: SorobanRpcClient, repo: Repository, start_ledger: u32, batch_size: u32) -> Self {
        Self {
            rpc_client,
            repo,
            start_ledger,
            batch_size,
        }
    }
}

#[async_trait]
impl IngesterService for BackfillIngester {
    async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Starting backfill ingester from ledger {}", self.start_ledger);

        let latest_ledger = self.rpc_client.get_latest_ledger().await?;
        let mut current_ledger = self.start_ledger;
        let mut current_cursor = None;

        if let Ok(Some(state)) = self.repo.get_ingester_state("backfill").await {
            current_ledger = state.last_ingested_ledger as u32;
            current_cursor = state.last_cursor;
            info!("Resuming backfill from ledger {}", current_ledger);
        }

        while current_ledger < latest_ledger {
            match self.rpc_client.get_events(current_ledger, self.batch_size, current_cursor.clone()).await {
                Ok(response) => {
                    if response.events.is_empty() {
                        current_ledger += 1;
                        current_cursor = None;
                        continue;
                    }

                    let mut db_events = Vec::new();
                    for rpc_event in &response.events {
                        if let Ok(parsed) = EventParser::parse(rpc_event) {
                            db_events.push(parsed);
                        }
                        current_ledger = rpc_event.ledger;
                        current_cursor = Some(rpc_event.paging_token.clone());
                    }

                    if let Err(e) = self.repo.insert_events(&db_events).await {
                        warn!("Failed to insert backfill events: {}", e);
                    } else {
                        info!("Backfilled {} events up to ledger {}", db_events.len(), current_ledger);
                        let _ = self.repo.update_ingester_state("backfill", current_ledger as i64, current_cursor.clone()).await;
                    }
                }
                Err(e) => {
                    warn!("Backfill fetch failed: {}. Retrying...", e);
                    tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                }
            }
        }

        info!("Backfill complete! Caught up to {}", latest_ledger);
        Ok(())
    }
}
