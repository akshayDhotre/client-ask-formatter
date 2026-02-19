'use client';

import { useMemo, useState } from 'react';

import { downloadMarkdown, downloadPdf } from '../lib/exporters';

type ArtifactCardProps = {
  title: string;
  fileName: string;
  content: string;
};

export default function ArtifactCard({ title, fileName, content }: ArtifactCardProps) {
  const [expanded, setExpanded] = useState(false);

  const preview = useMemo(() => {
    const normalized = content.trim();
    if (!normalized) return 'No content generated.';
    if (normalized.length <= 300) return normalized;
    return `${normalized.slice(0, 300)}...`;
  }, [content]);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600">{fileName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            {expanded ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            type="button"
            onClick={() => downloadMarkdown(fileName, content)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            Download .md
          </button>
          <button
            type="button"
            onClick={() => downloadPdf(fileName, title, content)}
            className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white"
          >
            Download .pdf
          </button>
        </div>
      </div>

      {expanded ? (
        <pre className="mt-3 max-h-56 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800">
          {preview}
        </pre>
      ) : null}
    </article>
  );
}
