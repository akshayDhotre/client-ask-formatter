import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-4o';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY for OpenAI provider.');
  }

  client = new OpenAI({ apiKey });
  return client;
}

export async function callOpenAI(
  prompt: string,
  systemPrompt?: string,
  model = DEFAULT_MODEL
): Promise<string> {
  const response = await getClient().responses.create({
    model,
    input: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt }
    ]
  });

  const text = response.output_text?.trim();
  if (!text) {
    throw new Error('OpenAI returned an empty response.');
  }

  return text;
}
