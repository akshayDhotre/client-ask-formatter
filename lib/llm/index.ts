import { callAnthropic } from './anthropic';
import { DEFAULT_MODEL_BY_PROVIDER, LLM_MODELS_BY_PROVIDER } from './catalog';
import { callGoogle } from './google';
import { callOpenAI } from './openai';

import type { GenerationMetadata, LLMProvider } from '../../types';

function normalizeProvider(value?: string): LLMProvider {
  const candidate = value?.toLowerCase();

  if (candidate === 'openai') return 'openai';
  if (candidate === 'google') return 'google';
  return 'anthropic';
}

function isAllowedModel(provider: LLMProvider, model: string): boolean {
  return LLM_MODELS_BY_PROVIDER[provider].includes(model);
}

export function resolveLLMConfig(providerValue?: string, modelValue?: string): GenerationMetadata {
  const provider = normalizeProvider(providerValue ?? process.env.LLM_PROVIDER);
  const fallbackModel = DEFAULT_MODEL_BY_PROVIDER[provider];
  const requestedModel = (modelValue ?? fallbackModel).trim();

  if (!requestedModel) {
    return { provider, model: fallbackModel };
  }

  if (!isAllowedModel(provider, requestedModel)) {
    throw new Error(`Model "${requestedModel}" is not supported for provider "${provider}".`);
  }

  return {
    provider,
    model: requestedModel
  };
}

export function getActiveLLMConfig(): GenerationMetadata {
  return resolveLLMConfig();
}

export async function callLLM(
  prompt: string,
  systemPrompt?: string,
  llmConfig?: GenerationMetadata
): Promise<string> {
  if (!prompt.trim()) {
    throw new Error('LLM prompt must not be empty.');
  }

  const { provider, model } = llmConfig
    ? resolveLLMConfig(llmConfig.provider, llmConfig.model)
    : getActiveLLMConfig();

  switch (provider) {
    case 'openai':
      return callOpenAI(prompt, systemPrompt, model);
    case 'google':
      return callGoogle(prompt, systemPrompt, model);
    case 'anthropic':
    default:
      return callAnthropic(prompt, systemPrompt, model);
  }
}
