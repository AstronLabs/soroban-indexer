use super::models::{ContractInfo, IngesterState, LedgerInfo, SorobanEvent};
use sqlx::{PgPool, Row};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DbError {
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),
}

#[derive(Clone)]
pub struct Repository {
    pool: PgPool,
}

impl Repository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn insert_events(&self, events: &[SorobanEvent]) -> Result<(), DbError> {
        if events.is_empty() {
            return Ok(());
        }

        let mut tx = self.pool.begin().await?;

        for event in events {
            sqlx::query(
                r#"
                INSERT INTO soroban_events
                (id, event_id, event_type, ledger_sequence, tx_hash, contract_id, topics, data, created_at, ingested_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (event_id) DO NOTHING
                "#
            )
            .bind(&event.id)
            .bind(&event.event_id)
            .bind(&event.event_type)
            .bind(event.ledger_sequence)
            .bind(&event.tx_hash)
            .bind(&event.contract_id)
            .bind(&event.topics)
            .bind(&event.data)
            .bind(event.created_at)
            .bind(event.ingested_at)
            .execute(&mut *tx)
            .await?;
        }

        tx.commit().await?;
        Ok(())
    }

    pub async fn insert_ledger_info(&self, info: &LedgerInfo) -> Result<(), DbError> {
        sqlx::query(
            r#"
            INSERT INTO ledger_info
            (sequence, hash, timestamp, tx_count, operation_count, closed_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (sequence) DO NOTHING
            "#,
        )
        .bind(info.sequence)
        .bind(&info.hash)
        .bind(info.timestamp)
        .bind(info.tx_count)
        .bind(info.operation_count)
        .bind(info.closed_at)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn upsert_contract_info(
        &self,
        contract_id: &str,
        ledger: i64,
    ) -> Result<(), DbError> {
        sqlx::query(
            r#"
            INSERT INTO contract_info (contract_id, first_seen_ledger, last_event_ledger, event_count, created_at, updated_at)
            VALUES ($1, $2, $2, 1, NOW(), NOW())
            ON CONFLICT (contract_id) DO UPDATE SET
                last_event_ledger = GREATEST(contract_info.last_event_ledger, $2),
                event_count = contract_info.event_count + 1,
                updated_at = NOW()
            "#
        )
        .bind(contract_id)
        .bind(ledger)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn get_ingester_state(&self, mode: &str) -> Result<Option<IngesterState>, DbError> {
        let state = sqlx::query_as::<_, IngesterState>(
            r#"SELECT id, mode, last_ingested_ledger, last_cursor, updated_at FROM ingester_state WHERE mode = $1"#
        )
        .bind(mode)
        .fetch_optional(&self.pool)
        .await?;
        Ok(state)
    }

    pub async fn update_ingester_state(
        &self,
        mode: &str,
        last_ingested_ledger: i64,
        last_cursor: Option<String>,
    ) -> Result<(), DbError> {
        sqlx::query(
            r#"
            INSERT INTO ingester_state (mode, last_ingested_ledger, last_cursor, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (mode) DO UPDATE SET
                last_ingested_ledger = $2,
                last_cursor = $3,
                updated_at = NOW()
            "#,
        )
        .bind(mode)
        .bind(last_ingested_ledger)
        .bind(last_cursor)
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
