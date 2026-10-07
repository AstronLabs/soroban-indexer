mod config;
mod db;
mod ingester;
mod stellar;

use config::{Config, IngestionMode};
use db::repository::Repository;
use ingester::{backfill::BackfillIngester, realtime::RealtimeIngester, IngesterService};
use sqlx::PgPool;
use stellar::rpc_client::SorobanRpcClient;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::from_default_env().add_directive("soroban_indexer=info".parse()?),
        )
        .init();

    let config = Config::load();
    info!(
        "Starting Soroban Indexer Ingester in {:?} mode",
        config.mode
    );

    info!("Connecting to database...");
    let pool = PgPool::connect(&config.database_url).await?;
    let repository = Repository::new(pool);

    let rpc_client = SorobanRpcClient::new(config.stellar_rpc_url);

    match config.mode {
        IngestionMode::Realtime => {
            let service = RealtimeIngester::new(
                rpc_client,
                repository,
                config.poll_interval_ms,
                config.batch_size,
            );
            if let Err(e) = service.run().await {
                error!("Realtime ingester stopped with error: {}", e);
            }
        }
        IngestionMode::Backfill => {
            let start_ledger = config
                .start_ledger
                .expect("START_LEDGER is required for backfill mode");
            let service =
                BackfillIngester::new(rpc_client, repository, start_ledger, config.batch_size);
            if let Err(e) = service.run().await {
                error!("Backfill ingester stopped with error: {}", e);
            }
        }
    }

    Ok(())
}
