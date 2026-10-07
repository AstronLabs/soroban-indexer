pub mod backfill;
pub mod realtime;

use async_trait::async_trait;

#[async_trait]
pub trait IngesterService {
    async fn run(&self) -> Result<(), Box<dyn std::error::Error>>;
}
