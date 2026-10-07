import { z } from 'zod';

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  cursor: z.string().optional(),
});

export const EventQuerySchema = z.object({
  contractId: z.string().optional(),
  eventType: z.string().optional(),
  startLedger: z.coerce.number().optional(),
  endLedger: z.coerce.number().optional(),
});

export const ContractQuerySchema = z.object({});

export const LedgerQuerySchema = z.object({
  startSequence: z.coerce.number().optional(),
  endSequence: z.coerce.number().optional(),
});
