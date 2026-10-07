export const schema = `
  type Event {
    id: ID!
    contractId: String!
    eventType: String!
    ledgerSequence: Int!
    eventIndex: Int!
    txHash: String!
    topic1: String
    topic2: String
    topic3: String
    topic4: String
    data: String!
  }

  type Contract {
    contractId: String!
    createdAt: String!
    eventsCount: Int
  }

  type Ledger {
    sequence: Int!
    hash: String!
    timestamp: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type EventConnection {
    edges: [EventEdge!]!
    pageInfo: PageInfo!
  }

  type EventEdge {
    cursor: String!
    node: Event!
  }

  type ContractConnection {
    edges: [ContractEdge!]!
    pageInfo: PageInfo!
  }

  type ContractEdge {
    cursor: String!
    node: Contract!
  }

  input EventFilter {
    contractId: String
    eventType: String
    startLedger: Int
    endLedger: Int
  }

  type Query {
    events(filter: EventFilter, limit: Int = 50, cursor: String): EventConnection!
    event(id: ID!): Event
    contracts(limit: Int = 50, cursor: String): ContractConnection!
    contract(id: String!): Contract
    ledgers(startSequence: Int, endSequence: Int, limit: Int = 50): [Ledger!]!
    stats: Stats!
  }

  type Stats {
    totalEvents: Int!
    totalContracts: Int!
    latestLedger: Int
  }
`;
