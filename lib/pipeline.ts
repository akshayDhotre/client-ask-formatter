import type { ArtifactBundle, ClientContext, GenerationMetadata } from '../types';
import { callLLM } from './llm';
import { buildPrompt as buildEstimatesPrompt } from './prompts/estimates';
import { buildPrompt as buildPocAgentPrompt } from './prompts/poc_agent';
import { buildPrompt as buildRequirementsPrompt } from './prompts/requirements';
import { buildPrompt as buildSowPrompt } from './prompts/sow';
import { buildPrompt as buildTechSpecPrompt } from './prompts/tech_spec';

const SYSTEM_PROMPT =
  'You are a senior solutions architect and presales engineer. Return only polished Markdown for the requested artifact.';

export async function generateArtifactBundle(
  ctx: ClientContext,
  llmConfig: GenerationMetadata
): Promise<ArtifactBundle> {
  const requirements = await callLLM(buildRequirementsPrompt(ctx), SYSTEM_PROMPT, llmConfig);

  const sow = await callLLM(
    buildSowPrompt(ctx, {
      requirements
    }),
    SYSTEM_PROMPT,
    llmConfig
  );

  const techSpec = await callLLM(
    buildTechSpecPrompt(ctx, {
      requirements
    }),
    SYSTEM_PROMPT,
    llmConfig
  );

  const estimates = await callLLM(
    buildEstimatesPrompt(ctx, {
      requirements,
      techSpec
    }),
    SYSTEM_PROMPT,
    llmConfig
  );

  const pocAgent = await callLLM(
    buildPocAgentPrompt(ctx, {
      requirements,
      sow,
      techSpec,
      estimates
    }),
    SYSTEM_PROMPT,
    llmConfig
  );

  return {
    sow,
    techSpec,
    estimates,
    pocAgent,
    requirements
  };
}
