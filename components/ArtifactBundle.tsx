'use client';

import { downloadAllArtifactsAsZip } from '../lib/exporters';
import { ARTIFACT_FILES, ARTIFACT_LABELS } from '../lib/artifacts';
import type { ArtifactBundle as ArtifactBundleType } from '../types';
import ArtifactCard from './ArtifactCard';

type ArtifactBundleProps = {
  artifacts: ArtifactBundleType;
};

export default function ArtifactBundle({ artifacts }: ArtifactBundleProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Output Artifact Bundle</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void downloadAllArtifactsAsZip(artifacts, 'md')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Download All .md (zip)
          </button>
          <button
            type="button"
            onClick={() => void downloadAllArtifactsAsZip(artifacts, 'pdf')}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Download All .pdf (zip)
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {(Object.keys(artifacts) as Array<keyof ArtifactBundleType>).map((key) => (
          <ArtifactCard
            key={key}
            title={ARTIFACT_LABELS[key]}
            fileName={ARTIFACT_FILES[key]}
            content={artifacts[key]}
          />
        ))}
      </div>
    </section>
  );
}
