
import { NextResponse } from 'next/server';

// Simple regex patterns for PII. In a real app, this would be much more robust.
const REDACTION_PATTERNS = [
    // Email addresses
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // Phone numbers (simple example)
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    // IDs (example: Emirates ID)
    /\b784-\d{4}-\d{7}-\d{1}\b/g,
];

export async function POST(request: Request) {
    const { text } = await request.json();

    if (!text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    let redactedText = text;
    for (const pattern of REDACTION_PATTERNS) {
        redactedText = redactedText.replace(pattern, '[REDACTED]');
    }

    return NextResponse.json({ originalText: text, redactedText });
}
