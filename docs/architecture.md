# Architecture Overview

This document details the architecture of the **Soroban Indexer**.

## System Overview

Soroban Indexer is designed to reliably ingest data from the Stellar network (specifically Soroban smart contract events and transactions), persist it to a relational database, and serve it to clients efficiently.

### Data Flow

1. **Ingestion**: The Rust-based Ingester process polls or streams data from the Soroban RPC and Stellar Horizon nodes.
2. **Persistence**: Extracted events, transaction details, and ledger metadata are normalized and stored in PostgreSQL.
3. **Serving**: The TypeScript Node.js API (Fastify) connects to the database to serve REST and GraphQL queries to external clients.

## Components

### 1. Ingester (Rust)
Built in Rust for maximum performance and memory safety.
- **RPC Client**: Communicates with `getEvents`, `getLedgers`, and `getTransaction`.
- **Checkpointing**: Maintains a cursor of the last processed ledger in the database to ensure crash-recovery without missing data.
- **Event Parser**: Decodes Soroban XDR into structured JSON formats suitable for database storage.

### 2. Database (PostgreSQL)
PostgreSQL was chosen for its strong relational integrity, excellent indexing capabilities (including JSONB for flexible event data), and maturity.

### 3. API (TypeScript/Node.js + Fastify)
A high-throughput API layer.
- **REST**: Standard JSON endpoints for simple queries.
- **GraphQL**: For clients needing complex, nested data without over-fetching.
- **SSE (Server-Sent Events)**: Provides real-time event streaming directly to connected clients without polling.

## Database Schema

Key tables:
- `ledgers`: Sequence, timestamp, hash.
- `transactions`: Hash, ledger sequence, fee, status.
- `contract_events`: 
  - `id`: Event ID (ledger sequence + tx position + event index)
  - `contract_id`: The ID of the emitting contract.
  - `topics`: Indexed array of event topics.
  - `data`: JSONB representation of the event payload.
- `indexer_state`: Tracks the current ingestion cursor.

## Ingestion Pipeline Details

The ingester operates in two modes:
1. **Backfill Mode**: Rapidly fetches historical ledgers in batches to catch up to the network tip.
2. **Stream Mode**: Once at the tip, it continuously polls the RPC for new ledgers and processes them in real-time.

State Archival: The ingester detects when a contract's state (Instance, Temporary, Persistent) is archived and updates local metadata accordingly, enabling clients to know when state restoration is required.

## API Design Decisions

- **Fastify**: Chosen over Express for its superior performance and low overhead.
- **Relay-Style GraphQL**: We implemented the Connections/Edges pattern in GraphQL to support robust cursor-based pagination.
- **JSONB**: Event payloads are stored as JSONB to allow clients to query inside the event data structures dynamically.

## Performance Considerations

- Database indexing on `contract_id` and `topics` is crucial for read performance.
- The Rust ingester uses asynchronous I/O (`tokio`) to fetch multiple ledgers concurrently during backfill.

## Scaling Strategy

- **Database**: Can be vertically scaled. Read replicas can be added to handle high API read traffic.
- **API**: Stateless Node.js instances can be scaled horizontally behind a load balancer.
- **Ingester**: Typically runs as a singleton to avoid race conditions, but can be sharded by contract ID in a high-volume scenario in the future.
