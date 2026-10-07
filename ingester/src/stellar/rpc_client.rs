use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::time::Duration;
use thiserror::Error;
use tracing::warn;

#[derive(Error, Debug)]
pub enum RpcError {
    #[error("Request failed: {0}")]
    Reqwest(#[from] reqwest::Error),
    #[error("JSON-RPC Error: {0}")]
    JsonRpc(String),
    #[error("Parse error: {0}")]
    Parse(String),
}

#[derive(Serialize)]
struct JsonRpcRequest {
    jsonrpc: &'static str,
    id: u64,
    method: String,
    params: Value,
}

#[derive(Deserialize, Debug)]
struct JsonRpcResponse<T> {
    jsonrpc: String,
    id: u64,
    result: Option<T>,
    error: Option<RpcErrorObj>,
}

#[derive(Deserialize, Debug)]
struct RpcErrorObj {
    code: i64,
    message: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventResponse {
    pub latest_ledger: u32,
    pub events: Vec<RpcEvent>,
}

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RpcEvent {
    pub type_: String,
    pub ledger: u32,
    pub ledger_closed_at: String,
    pub contract_id: String,
    pub id: String,
    pub paging_token: String,
    pub topic: Vec<String>,
    pub value: Value,
    pub in_successful_contract_call: bool,
}

#[derive(Clone)]
pub struct SorobanRpcClient {
    url: String,
    client: Client,
}

impl SorobanRpcClient {
    pub fn new(url: String) -> Self {
        Self {
            url,
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .unwrap(),
        }
    }

    async fn call<T: for<'de> Deserialize<'de>>(
        &self,
        method: &str,
        params: Value,
    ) -> Result<T, RpcError> {
        let mut retries = 0;
        let max_retries = 5;

        loop {
            let req = JsonRpcRequest {
                jsonrpc: "2.0",
                id: 1,
                method: method.to_string(),
                params: params.clone(),
            };

            match self.client.post(&self.url).json(&req).send().await {
                Ok(response) => {
                    if !response.status().is_success() {
                        if retries < max_retries {
                            retries += 1;
                            tokio::time::sleep(Duration::from_millis(1000 * retries)).await;
                            continue;
                        }
                    }
                    let rpc_res: JsonRpcResponse<T> = response.json().await?;
                    if let Some(err) = rpc_res.error {
                        return Err(RpcError::JsonRpc(err.message));
                    }
                    return rpc_res
                        .result
                        .ok_or_else(|| RpcError::Parse("Missing result".into()));
                }
                Err(e) => {
                    if retries >= max_retries {
                        return Err(RpcError::Reqwest(e));
                    }
                    retries += 1;
                    warn!(
                        "RPC request failed, retrying ({}/{})...",
                        retries, max_retries
                    );
                    tokio::time::sleep(Duration::from_millis(500 * retries)).await;
                }
            }
        }
    }

    pub async fn get_events(
        &self,
        start_ledger: u32,
        limit: u32,
        cursor: Option<String>,
    ) -> Result<EventResponse, RpcError> {
        let mut params = json!({
            "startLedger": start_ledger,
            "limit": limit
        });

        if let Some(c) = cursor {
            params
                .as_object_mut()
                .unwrap()
                .insert("cursor".into(), json!(c));
        }

        self.call("getEvents", params).await
    }

    pub async fn get_latest_ledger(&self) -> Result<u32, RpcError> {
        #[derive(Deserialize)]
        struct LatestLedgerRes {
            sequence: u32,
        }
        let res: LatestLedgerRes = self.call("getLatestLedger", json!({})).await?;
        Ok(res.sequence)
    }
}
