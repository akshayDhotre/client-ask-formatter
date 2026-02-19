import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL = 'claude-sonnet-4-6';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY for Anthropic provider.');
  }

  client = new Anthropic({ apiKey });
  return client;
}

export async function callAnthropic(
  prompt: string,
  systemPrompt?: string,
  model = DEFAULT_MODEL
): Promise<string> {
  const response = await getClient().messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Anthropic returned an empty response.');
  }

  return text;
}
