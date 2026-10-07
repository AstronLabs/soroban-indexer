export interface Event {
    id: string;
    contractId: string;
    eventType: string;
    ledgerSequence: number;
    eventIndex: number;
    txHash: string;
    topic1?: string;
    topic2?: string;
    topic3?: string;
    topic4?: string;
    data: string;
}

export interface Contract {
    contractId: string;
    createdAt: string;
    eventsCount?: number;
}

export interface Ledger {
    sequence: number;
    hash: string;
    timestamp: string;
}

export interface PageInfo {
    hasNextPage: boolean;
    endCursor?: string;
}
