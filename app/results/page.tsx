'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import ArtifactBundle from '../../components/ArtifactBundle';
import { ARTIFACT_STORAGE_KEY } from '../../lib/artifacts';
import type {
  ArtifactBundle as ArtifactBundleType,
  GenerationMetadata,
  StoredGeneration
} from '../../types';

export default function ResultsPage() {
  const [artifacts, setArtifacts] = useState<ArtifactBundleType | null>(null);
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  function hasAllArtifacts(value: ArtifactBundleType): boolean {
    return (
      typeof value.sow === 'string' &&
      typeof value.techSpec === 'string' &&
      typeof value.estimates === 'string' &&
      typeof value.pocAgent === 'string' &&
      typeof value.requirements === 'string'
    );
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ARTIFACT_STORAGE_KEY);
      if (!raw) {
        setLoadError('No generated artifact bundle was found. Generate artifacts first.');
        return;
      }

      const parsed = JSON.parse(raw) as ArtifactBundleType | StoredGeneration;
      const isNewSchema = typeof parsed === 'object' && parsed !== null && 'artifacts' in parsed;
      const artifactPayload = isNewSchema ? parsed.artifacts : parsed;

      if (!hasAllArtifacts(artifactPayload)) {
        setLoadError('Stored artifact bundle is incomplete. Regenerate artifacts.');
        return;
      }

      setArtifacts(artifactPayload);
      if (
        isNewSchema &&
        parsed.metadata &&
        typeof parsed.metadata.provider === 'string' &&
        typeof parsed.metadata.model === 'string'
      ) {
        setMetadata(parsed.metadata);
      }
    } catch {
      setLoadError('Could not read generated artifacts. Regenerate artifacts.');
    }
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-gray-900">Generated Results</h1>
        <Link href="/" className="text-sm font-medium text-gray-700 underline underline-offset-4">
          Back to Input
        </Link>
      </div>
      {metadata ? (
        <p className="mb-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          Generated with {metadata.provider} / {metadata.model}
        </p>
      ) : null}

      {loadError ? <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{loadError}</p> : null}

      {artifacts ? <ArtifactBundle artifacts={artifacts} /> : null}
    </main>
  );
}
