import { pool } from './connection.js';

export async function getEvents(filters: any) {
  let query = 'SELECT * FROM events WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.contractId) {
    query += ` AND contract_id = $${paramIndex++}`;
    params.push(filters.contractId);
  }
  if (filters.eventType) {
    query += ` AND event_type = $${paramIndex++}`;
    params.push(filters.eventType);
  }
  if (filters.startLedger) {
    query += ` AND ledger_sequence >= $${paramIndex++}`;
    params.push(filters.startLedger);
  }
  if (filters.endLedger) {
    query += ` AND ledger_sequence <= $${paramIndex++}`;
    params.push(filters.endLedger);
  }

  query += ` ORDER BY ledger_sequence DESC, event_index DESC LIMIT $${paramIndex++}`;
  params.push(filters.limit || 50);

  if (filters.cursor) {
      // Implement cursor-based pagination
      // For simplicity in this mock, we just use offset if cursor is an integer
      const offset = parseInt(filters.cursor, 10);
      if (!isNaN(offset)) {
         query += ` OFFSET $${paramIndex++}`;
         params.push(offset);
      }
  }

  const { rows } = await pool.query(query, params);
  return rows;
}

export async function getEventById(eventId: string) {
  const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
  return rows[0];
}

export async function getContractEvents(contractId: string, options: any) {
    return getEvents({ contractId, ...options });
}

export async function getContracts(options: any) {
    let query = 'SELECT * FROM contracts ORDER BY created_at DESC LIMIT $1';
    const params: any[] = [options.limit || 50];
    let paramIndex = 2;

    if (options.offset) {
        query += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
    }
    const { rows } = await pool.query(query, params);
    return rows;
}

export async function getContractById(contractId: string) {
    const { rows } = await pool.query('SELECT * FROM contracts WHERE contract_id = $1', [contractId]);
    return rows[0];
}

export async function getLedgers(options: any) {
     let query = 'SELECT * FROM ledgers WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (options.startSequence) {
        query += ` AND sequence >= $${paramIndex++}`;
        params.push(options.startSequence);
    }
    if (options.endSequence) {
        query += ` AND sequence <= $${paramIndex++}`;
        params.push(options.endSequence);
    }

    query += ` ORDER BY sequence DESC LIMIT $${paramIndex++}`;
    params.push(options.limit || 50);

    const { rows } = await pool.query(query, params);
    return rows;
}

export async function getLedgerBySequence(sequence: number) {
    const { rows } = await pool.query('SELECT * FROM ledgers WHERE sequence = $1', [sequence]);
    return rows[0];
}

export async function getStats() {
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    const contractsCount = await pool.query('SELECT COUNT(*) FROM contracts');
    const latestLedger = await pool.query('SELECT MAX(sequence) FROM ledgers');

    return {
        totalEvents: parseInt(eventsCount.rows[0].count, 10),
        totalContracts: parseInt(contractsCount.rows[0].count, 10),
        latestLedger: latestLedger.rows[0].max,
    };
}
