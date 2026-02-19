import type { ArtifactBundle } from '../types';

export const ARTIFACT_STORAGE_KEY = 'caf_artifacts';

export const ARTIFACT_LABELS: Record<keyof ArtifactBundle, string> = {
  sow: 'Statement of Work',
  techSpec: 'Technical Specification',
  estimates: 'Estimates',
  pocAgent: 'POC Agent Instructions',
  requirements: 'Requirements'
};

export const ARTIFACT_FILES: Record<keyof ArtifactBundle, string> = {
  sow: 'SOW_draft.md',
  techSpec: 'TECH_SPEC.md',
  estimates: 'ESTIMATES.md',
  pocAgent: 'POC_AGENT.md',
  requirements: 'REQUIREMENTS.md'
};
