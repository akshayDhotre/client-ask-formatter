export type PriorityLevel = 'mvp' | 'poc' | 'full';
export type LLMProvider = 'anthropic' | 'openai' | 'google';

export type ClientMetadata = {
  existingProduct?: string;
  productDescription?: string;
  clientName?: string;
  priority: PriorityLevel;
};

export type ClientContext = ClientMetadata & {
  rawInput: string;
};

export type ArtifactBundle = {
  sow: string;
  techSpec: string;
  estimates: string;
  pocAgent: string;
  requirements: string;
};

export type GenerationMetadata = {
  provider: LLMProvider;
  model: string;
};

export type StoredGeneration = {
  artifacts: ArtifactBundle;
  metadata: GenerationMetadata;
};
