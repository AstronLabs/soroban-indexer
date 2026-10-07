# API Reference

The Soroban Indexer provides both REST and GraphQL APIs.

Base URL: `http://localhost:3000/api/v1`

## REST Endpoints

### 1. Get Contract Events
Retrieve a list of historical events for a specific smart contract.

**Endpoint:** `GET /events`

**Query Parameters:**
- `contractId` (string, required): The Soroban contract ID.
- `limit` (number, optional): Max results (default: 50, max: 100).
- `cursor` (string, optional): Pagination cursor (Event ID).
- `topic` (string, optional): Filter by a specific event topic.

**Example Request:**
```bash
curl "http://localhost:3000/api/v1/events?contractId=CA7QYWE9PT&limit=2"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "123456-1-0",
      "contractId": "CA7QYWE9PT...",
      "ledgerSequence": 123456,
      "type": "contract",
      "topics": ["transfer", "user_address"],
      "data": { "amount": "1000000" }
    }
  ],
  "pagination": {
    "nextCursor": "123456-1-0"
  }
}
```

### 2. Stream Events (SSE)
Subscribe to a real-time stream of events.

**Endpoint:** `GET /events/stream`

**Query Parameters:**
- `contractId` (string, optional): Filter by contract ID.

**Example Request:**
```bash
curl -N "http://localhost:3000/api/v1/events/stream?contractId=CA7QYWE9PT"
```

## GraphQL Schema

The GraphQL API is available at `POST /graphql`.

### Schema Highlights
We use the Relay Connection pattern for efficient pagination.

```graphql
type Query {
  contractEvents(
    contractId: String!
    first: Int
    after: String
  ): EventConnection!
}

type EventConnection {
  edges: [EventEdge!]!
  pageInfo: PageInfo!
}

type EventEdge {
  node: ContractEvent!
  cursor: String!
}

type ContractEvent {
  id: ID!
  contractId: String!
  ledgerSequence: Int!
  topics: [String!]!
  data: JSON!
}
```

## Pagination Patterns

Both REST and GraphQL use **Cursor-based pagination**. This is critical for blockchain data where new records are constantly inserted. Relying on offset/limit pagination would lead to skipped or duplicated records. 
The `cursor` is typically the composite Event ID (`ledger-tx_index-event_index`).

## Authentication

Currently, the public API does not require authentication. 
Rate limiting is enforced based on IP address. For enterprise tiers or higher rate limits, an `Authorization: Bearer <token>` header will be required in future versions.

## Rate Limiting

- Standard rate limit: 100 requests per minute per IP.
- When the limit is exceeded, the API returns HTTP status `429 Too Many Requests`.

## Error Codes

The API returns standard HTTP status codes:
- `200 OK`: Success.
- `400 Bad Request`: Invalid parameters.
- `404 Not Found`: Resource not found.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Server-side issue.

Error payloads include a standard format:
```json
{
  "error": {
    "code": "invalid_parameter",
    "message": "contractId is required"
  }
}
```
