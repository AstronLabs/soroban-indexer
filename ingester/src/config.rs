use clap::{Parser, ValueEnum};
use dotenvy::dotenv;

#[derive(Debug, Clone, ValueEnum)]
pub enum IngestionMode {
    Realtime,
    Backfill,
}

#[derive(Debug, Parser)]
#[command(author, version, about, long_about = None)]
pub struct Config {
    #[arg(long, env = "STELLAR_RPC_URL", default_value = "https://soroban-testnet.stellar.org:443")]
    pub stellar_rpc_url: String,

    #[arg(long, env = "DATABASE_URL")]
    pub database_url: String,

    #[arg(long, env = "INGESTER_MODE", value_enum, default_value_t = IngestionMode::Realtime)]
    pub mode: IngestionMode,

    #[arg(long, env = "START_LEDGER")]
    pub start_ledger: Option<u32>,

    #[arg(long, env = "BATCH_SIZE", default_value = "100")]
    pub batch_size: u32,

    #[arg(long, env = "POLL_INTERVAL_MS", default_value = "2000")]
    pub poll_interval_ms: u64,
}

impl Config {
    pub fn load() -> Self {
        dotenv().ok();
        Config::parse()
    }
}
