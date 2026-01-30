export interface ChunkOptions {
  maxChunkSize: number;        // Default: 1000
  minChunkSize: number;         // Default: 100
  overlapSize: number;          // Default: 200
  preserveParagraphs: boolean;  // Default: true
}

export interface Chunk {
  content: string;
  index: number;
  metadata: {
    startChar: number;
    endChar: number;
    type: 'paragraph' | 'header' | 'list' | 'code';
    parent_document_id?: string;
    [key: string]: any;
  };
}

/**
 * Standardized Document Chunker
 * Splits text into semantic segments with precision overlap.
 */
export function chunkDocument(
  text: string,
  options: Partial<ChunkOptions> = {}
): Chunk[] {
  const opts: ChunkOptions = {
    maxChunkSize: 1000,
    minChunkSize: 100,
    overlapSize: 200,
    preserveParagraphs: true,
    ...options
  };

  const chunks: Chunk[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';
  let currentStart = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // If adding this paragraph exceeds max, finalize current chunk
    if (currentChunk.length + trimmed.length > opts.maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunks.length,
        metadata: {
          startChar: currentStart,
          endChar: currentStart + currentChunk.length,
          type: detectType(currentChunk)
        }
      });

      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-opts.overlapSize);
      currentChunk = overlapText + '\n\n' + trimmed;
      currentStart += currentChunk.length - overlapText.length - 2;
    } else {
      if (currentChunk) currentChunk += '\n\n';
      currentChunk += trimmed;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length >= opts.minChunkSize) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunks.length,
      metadata: {
        startChar: currentStart,
        endChar: currentStart + currentChunk.length,
        type: detectType(currentChunk)
      }
    });
  }

  return chunks;
}

function detectType(text: string): 'paragraph' | 'header' | 'list' | 'code' {
  if (text.startsWith('#')) return 'header';
  if (text.startsWith('- ') || text.startsWith('* ') || /^\d+\./.test(text)) return 'list';
  if (text.includes('```')) return 'code';
  return 'paragraph';
}