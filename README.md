# 🌌 Soroban Indexer

[![CI](https://img.shields.io/github/actions/workflow/status/AstronLabs/soroban-indexer/ci.yml?branch=main&style=flat-square)](https://github.com/AstronLabs/soroban-indexer/actions)
[![License](https://img.shields.io/github/license/AstronLabs/soroban-indexer?style=flat-square)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue?style=flat-square)](docker-compose.yml)
[![Contributors](https://img.shields.io/github/contributors/AstronLabs/soroban-indexer?style=flat-square)](https://github.com/AstronLabs/soroban-indexer/graphs/contributors)
[![Built for Stellar](https://img.shields.io/badge/Built%20for-Stellar-000000?style=flat-square&logo=stellar)](https://stellar.org)

> **Production-grade historical data indexer for Soroban smart contracts on the Stellar blockchain.**

### 🌐 Live Deployments

- **Frontend Dashboard:** [https://soroban-indexer-dashboard.vercel.app](https://soroban-indexer-dashboard.vercel.app)
- **Deployed Testnet Contract:** [`CDMMNZP6ATCZ4JAULMDYYL4S37WKFJNQEB7O7JJAOD7527BMWJYNI57J`](https://stellar.expert/explorer/testnet/contract/CDMMNZP6ATCZ4JAULMDYYL4S37WKFJNQEB7O7JJAOD7527BMWJYNI57J)
- **Network:** Stellar Testnet


## 🚨 The Problem

Soroban's RPC nodes are optimized for real-time state access and transaction submission. However, when building dApps, analytics platforms, or block explorers, developers face a critical gap: **querying historical data**. 

There is no native, easy way to:
- Query historical contract events over time.
- Track a specific contract's activity and invocation history.
- Build reliable analytics on past transactions.
- Reconstruct the state of a contract at a given ledger.

## 💡 The Solution

**Soroban Indexer** continuously ingests Soroban events, ledger data, and transaction details from the Stellar network into a highly optimized PostgreSQL database. It then exposes this data through a lightning-fast REST and GraphQL API, empowering developers to build rich, data-driven applications on Soroban.

## ✨ Key Features

- ⚡ **Real-time event ingestion** directly from Soroban RPC.
- ⏪ **Historical backfill** starting from any specific ledger sequence.
- 🌐 **REST API** with advanced filtering, pagination, and cursor-based streaming.
- 🕸️ **GraphQL API** implementing Relay-style connections/edges for complex queries.
- 📊 **Per-contract history** providing event logs, statistics, and transaction details.
- 📡 **Server-Sent Events (SSE)** for real-time streaming of new events to clients.
- 🛡️ **Crash-recovery & Checkpointing**: Never miss an event, even if the indexer restarts.
- 🐳 **Docker Compose ready**: Spin up the entire stack (Database, Ingester, API) with one command.

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Stellar Network
        RPC[Soroban RPC]
        Horizon[Horizon API]
    end

    subgraph Soroban Indexer
        Ingester[Rust Ingester]
        DB[(PostgreSQL)]
        API[Node.js / Fastify API]
    end
    
    subgraph Clients
        dApp[Web3 dApp]
        Explorer[Block Explorer]
        Analytics[Data Analytics]
    end

    RPC -- Event Streams &\n State --> Ingester
    Horizon -- Ledger Data --> Ingester
    Ingester -- Persist Data --> DB
    API -- Query --> DB
    
    API -- REST / GraphQL --> dApp
    API -- REST / GraphQL --> Explorer
    API -- SSE / REST --> Analytics
```

## 🚀 Quick Start

The fastest way to get started is using Docker Compose. This will spin up the PostgreSQL database, the Rust ingestor, and the Node.js API server.

```bash
git clone https://github.com/AstronLabs/soroban-indexer.git
cd soroban-indexer
docker-compose up -d
```

The API will be available at `http://localhost:3000`.

## 📖 API Examples

### REST API

**Get events for a specific contract:**
```bash
curl "http://localhost:3000/api/v1/events?contractId=CA7Q...&limit=10"
```

**Stream real-time events (SSE):**
```bash
curl -N "http://localhost:3000/api/v1/events/stream"
```

### GraphQL API

**Query contract events with pagination:**
```graphql
query {
  contractEvents(contractId: "CA7Q...", first: 10) {
    edges {
      node {
        id
        ledgerSequence
        eventType
        data
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## ⚙️ Configuration Reference

| Environment Variable | Description | Default |
|----------------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@localhost:5432/soroban` |
| `SOROBAN_RPC_URL` | URL of the Soroban RPC node | `https://soroban-testnet.stellar.org` |
| `START_LEDGER` | Ledger sequence to start indexing from | `latest` |
| `API_PORT` | Port for the API server | `3000` |
| `LOG_LEVEL` | Logging verbosity (`debug`, `info`, `warn`, `error`) | `info` |

## 🛠️ Development Setup

Please refer to our [Development Guide](CONTRIBUTING.md#development-setup) in the Contributing documentation.

## 🗺️ Roadmap

- **Phase 1: Foundation (Current)** - Core ingestion, REST & GraphQL APIs, Docker setup.
- **Phase 2: Analytics & Metrics** - Aggregated contract statistics, token transfer indexing, volume tracking.
- **Phase 3: State Archival Support** - Support for retrieving and visualizing archived contract states.
- **Phase 4: Webhooks & Notifications** - Push notifications for specific contract events.

## 🤝 Contributing

We welcome contributions! If you're looking to help out, especially as part of the Stellar Drips Wave program, please check out our [Contributing Guidelines](CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ for the Stellar Ecosystem*
