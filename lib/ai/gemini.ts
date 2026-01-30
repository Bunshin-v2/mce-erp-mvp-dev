import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

function requireGeminiApiKey(): string {
  let apiKey = (process.env.GEMINI_API_KEY ?? '').trim();

  // Be forgiving if the key was added with quotes.
  if (
    (apiKey.startsWith('"') && apiKey.endsWith('"')) ||
    (apiKey.startsWith("'") && apiKey.endsWith("'"))
  ) {
    apiKey = apiKey.slice(1, -1).trim();
  }

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please add it to your .env.local without quotes.');
  }

  return apiKey;
}

function createGenAI() {
  // Explicitly target the stable v1 API surface to avoid v1beta 404s.
  return new GoogleGenerativeAI(requireGeminiApiKey());
}

export async function embedText(text: string): Promise<number[]> {
  try {
    const genAI = createGenAI();
    const modelName = process.env.GEMINI_EMBED_MODEL ?? 'text-embedding-004';
    const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text }] },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      // @ts-ignore
      outputDimensionality: 1536
    });
    const values = result.embedding?.values;

    if (!values?.length) {
      throw new Error('Embedding API returned no vector.');
    }

    return values;
  } catch (error: any) {
    if (error?.message?.includes('PERMISSION_DENIED') || error?.message?.includes('API key was reported as leaked')) {
      throw new Error('CRITICAL: Your GEMINI_API_KEY has been reported as leaked and revoked by Google. Please generate a NEW key at https://aistudio.google.com/app/apikey and update .env.local.');
    }
    throw error;
  }
}

export async function generateResponse(query: string, context: string): Promise<string> {
  try {
    const genAI = createGenAI();

    let modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
    if (modelName.startsWith('models/')) modelName = modelName.slice('models/'.length);

    const model = genAI.getGenerativeModel(
      { model: modelName },
      { apiVersion: 'v1' }
    );

    const prompt = context?.trim() ? `Context:\n${context}\n\nUser:\n${query}` : query;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      throw new Error('Gemini did not return any text.');
    }

    return text;
  } catch (error: any) {
    if (error?.message?.includes('PERMISSION_DENIED') || error?.message?.includes('API key was reported as leaked')) {
      throw new Error('CRITICAL: Your GEMINI_API_KEY has been reported as leaked and revoked by Google. Please generate a NEW key at https://aistudio.google.com/app/apikey and update .env.local.');
    }
    throw error;
  }
}
