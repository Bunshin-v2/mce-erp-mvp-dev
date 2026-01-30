import { z } from 'zod';

export const ingestDocumentSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  text: z.string()
    .min(10, 'Document too short (min 10 chars)')
    .max(500000, 'Document too large (max 500KB)')
});

export const chatQuerySchema = z.object({
  query: z.string()
    .min(3, 'Query too short (min 3 chars)')
    .max(5000, 'Query too long (max 5000 chars)')
});

export const embedRequestSchema = z.object({
  docContent: z.string().max(500000, 'Content too large'),
  options: z.object({
    chunkSize: z.number().min(100).max(5000).optional(),
    overlapSize: z.number().min(0).max(1000).optional()
  }).optional()
});
