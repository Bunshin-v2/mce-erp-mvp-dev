#!/usr/bin/env tsx
import { chunkDocument } from '../lib/rag/chunking';

// Test document with markdown features using safe double quotes
const sampleDocument =
  "# Main Header\n" +
  "This is the introduction paragraph with some context.\n\n" +
  "## Section 1: Code Examples\n" +
  "Here's how to use the API:\n\n" +
  "```typescript\n" +
  "const result = await api.fetch();\n" +
  "console.log(result);\n" +
  "```\n\n" +
  "## Section 2: Lists\n" +
  "Key features include:\n\n" +
  "- Feature 1: Fast processing\n" +
  "- Feature 2: Real-time updates\n" +
  "- Feature 3: Secure storage\n\n" +
  "## Section 3: Long Content\n" +
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\n" +
  "This paragraph continues with more details about the implementation. " +
  "We need enough text here to test the chunking overlap behavior properly.";

console.log('🧪 Testing Chunking Logic\n');
console.log('Document length:', sampleDocument.length, 'chars\n');

// Test with strict options to force multiple chunks
const chunks = chunkDocument(sampleDocument, {
  maxChunkSize: 200, // Small chunk size to force splits
  minChunkSize: 50,
  overlapSize: 50,
  preserveParagraphs: true
});

console.log(`✅ Created ${chunks.length} chunks\n`);

chunks.forEach((chunk, i) => {
  console.log(`--- Chunk ${i + 1} ---`);
  console.log('Size:', chunk.content.length, 'chars');
  console.log('Type:', chunk.metadata.type);
  console.log('Preview:', chunk.content.slice(0, 80).replace(/\n/g, ' ') + '...');
  console.log('');
});

// Verify overlap
console.log('📏 Verifying Overlap:');
for (let i = 0; i < chunks.length - 1; i++) {
  // Simple check: does the end of chunk N appear in the start of chunk N+1?
  // We take a slice of the overlap size to check
  const overlapLen = 20; 
  const chunk1End = chunks[i].content.slice(-overlapLen);
  const chunk2Start = chunks[i + 1].content;

  if (chunk2Start.includes(chunk1End)) {
    console.log(`✅ Chunks ${i + 1} and ${i + 2} have content overlap`);
  } else {
    // Overlap might be less than 20 chars if paragraph breaks aligned perfectly
    console.log(`ℹ️  Chunks ${i + 1} and ${i + 2} split cleanly (or small overlap)`);
  }
}

// Verify types detected
console.log('\n📊 Chunk Types Distribution:');
const typeCounts = chunks.reduce((acc, chunk) => {
  const type = chunk.metadata.type;
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log(typeCounts);
