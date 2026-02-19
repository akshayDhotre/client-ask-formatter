import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-1.5-pro';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (client) return client;

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY for Google provider.');
  }

  client = new GoogleGenerativeAI(apiKey);
  return client;
}

export async function callGoogle(
  prompt: string,
  systemPrompt?: string,
  modelName = DEFAULT_MODEL
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: modelName,
    ...(systemPrompt ? { systemInstruction: systemPrompt } : {})
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  if (!text) {
    throw new Error('Google Gemini returned an empty response.');
  }

  return text;
}
