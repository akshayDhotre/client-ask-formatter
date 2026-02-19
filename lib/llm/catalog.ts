import type { LLMProvider } from '../../types';

export const LLM_PROVIDER_LABELS: Record<LLMProvider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google'
};

export const LLM_MODELS_BY_PROVIDER: Record<LLMProvider, string[]> = {
  anthropic: ['claude-sonnet-4-6'],
  openai: ['gpt-4o'],
  google: ['gemini-1.5-pro']
};

export const DEFAULT_MODEL_BY_PROVIDER: Record<LLMProvider, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
  google: 'gemini-1.5-pro'
};
