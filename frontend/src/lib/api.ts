export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Event {
  id: string;
  type: 'system' | 'contract' | 'diagnostic';
  contractId: string;
  ledger: number;
  ledgerClosedAt: string;
  topic: string[];
  value: any;
}

export interface Contract {
  id: string;
  totalEvents: number;
  firstSeenLedger: number;
  lastActivityLedger: number;
  firstSeenAt: string;
  lastActivityAt: string;
}

export interface Ledger {
  sequence: number;
  hash: string;
  eventsCount: number;
  closedAt: string;
}

export interface Stats {
  totalEvents: number;
  contractsIndexed: number;
  latestLedger: number;
  ingesterStatus: 'online' | 'offline' | 'syncing';
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
}

// Fetch global stats
export async function fetchStats(): Promise<Stats> {
  try {
    // Return mock data for now if API is not up
    const res = await fetch(`${API_BASE}/api/stats`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  } catch (error) {
    console.warn("API not reachable, returning mock stats:", error);
    return {
      totalEvents: 1254302,
      contractsIndexed: 432,
      latestLedger: 512340,
      ingesterStatus: 'online'
    };
  }
}

// Fetch recent events
export async function fetchEvents(params?: { cursor?: string; limit?: number; contractId?: string }): Promise<PaginatedResponse<Event>> {
  try {
    const url = new URL(`${API_BASE}/api/events`);
    if (params?.cursor) url.searchParams.append('cursor', params.cursor);
    if (params?.limit) url.searchParams.append('limit', params.limit.toString());
    if (params?.contractId) url.searchParams.append('contractId', params.contractId);
    
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  } catch (error) {
    console.warn("API not reachable, returning mock events:", error);
    return {
      data: Array.from({ length: params?.limit || 10 }).map((_, i) => ({
        id: `evt_${Date.now() - i * 1000}_${i}`,
        type: i % 3 === 0 ? 'system' : 'contract',
        contractId: `C${Math.random().toString(36).substring(2, 26).toUpperCase()}`,
        ledger: 512340 - i,
        ledgerClosedAt: new Date(Date.now() - i * 5000).toISOString(),
        topic: ['transfer', 'AAA=', 'BBB='],
        value: { amount: 100 * i }
      })),
      nextCursor: 'next_mock_cursor'
    };
  }
}

// Fetch contracts
export async function fetchContracts(params?: { limit?: number }): Promise<PaginatedResponse<Contract>> {
  try {
    const res = await fetch(`${API_BASE}/api/contracts`);
    if (!res.ok) throw new Error('Failed to fetch contracts');
    return res.json();
  } catch (error) {
    console.warn("API not reachable, returning mock contracts:", error);
    return {
      data: Array.from({ length: 10 }).map((_, i) => ({
        id: `C${Math.random().toString(36).substring(2, 26).toUpperCase()}`,
        totalEvents: Math.floor(Math.random() * 10000),
        firstSeenLedger: 500000 - i * 100,
        lastActivityLedger: 512340 - i,
        firstSeenAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        lastActivityAt: new Date().toISOString()
      }))
    };
  }
}

// Fetch recent ledgers
export async function fetchLedgers(params?: { limit?: number }): Promise<Ledger[]> {
  try {
    const res = await fetch(`${API_BASE}/api/ledgers`);
    if (!res.ok) throw new Error('Failed to fetch ledgers');
    return res.json();
  } catch (error) {
    console.warn("API not reachable, returning mock ledgers:", error);
    return Array.from({ length: params?.limit || 10 }).map((_, i) => ({
      sequence: 512340 - i,
      hash: Math.random().toString(16).substring(2, 34) + Math.random().toString(16).substring(2, 34),
      eventsCount: Math.floor(Math.random() * 50),
      closedAt: new Date(Date.now() - i * 5000).toISOString()
    }));
  }
}
