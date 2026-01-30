
import { embedText } from './gemini';

/**
 * Generates a 1536-dimensional vector embedding for a given text chunk using Gemini text-embedding-004.
 * @param textChunk The text content to embed.
 * @returns A promise resolving to a vector array of numbers.
 */
export async function generateEmbeddingVector(textChunk: string): Promise<number[]> {
  return embedText(textChunk);
}

