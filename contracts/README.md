# Soroban Indexer Demo Contract

This contract is a sample demo/test contract for the `soroban-indexer` project. It generates a variety of events using different topics and data payloads to effectively test the ingestion pipeline of the indexer.

## Prerequisites

- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)

## Build

```bash
soroban contract build
```
This produces a WebAssembly module located at `target/wasm32-unknown-unknown/release/soroban_indexer_demo_contract.wasm`.

## Deploy

To deploy to Stellar Testnet:
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_indexer_demo_contract.wasm \
  --source YOUR_IDENTITY \
  --network testnet
```

## Usage

Assuming you have stored the contract ID in `$CONTRACT_ID`:

### Initialize
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source YOUR_IDENTITY \
  --network testnet \
  -- \
  initialize \
  --admin YOUR_ADMIN_ADDRESS
```

### Transfer
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source SENDER_IDENTITY \
  --network testnet \
  -- \
  transfer \
  --from SENDER_ADDRESS \
  --to RECEIVER_ADDRESS \
  --amount 1000
```

### Batch Operations
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --source YOUR_IDENTITY \
  --network testnet \
  -- \
  batch_operation \
  --count 10
```
