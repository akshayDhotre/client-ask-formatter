'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { ARTIFACT_STORAGE_KEY } from '../lib/artifacts';
import {
  DEFAULT_MODEL_BY_PROVIDER,
  LLM_MODELS_BY_PROVIDER,
  LLM_PROVIDER_LABELS
} from '../lib/llm/catalog';
import type { ArtifactBundle, GenerationMetadata, StoredGeneration } from '../types';

type GenerateResponse = {
  artifacts: ArtifactBundle;
  metadata: GenerationMetadata;
  status: string;
};

type InputFormProps = {
  activeLLM: GenerationMetadata;
};

const ACCEPTED_TYPES = '.txt,.md,text/plain,text/markdown';

export default function InputForm({ activeLLM }: InputFormProps) {
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [existingProduct, setExistingProduct] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [priority, setPriority] = useState<'mvp' | 'poc' | 'full'>('mvp');
  const [provider, setProvider] = useState(activeLLM.provider);
  const [model, setModel] = useState(activeLLM.model);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const helperText = useMemo(() => {
    if (!file) return 'Upload a .txt or .md file, or paste text manually.';
    return `Selected file: ${file.name}`;
  }, [file]);

  const modelOptions = LLM_MODELS_BY_PROVIDER[provider];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('rawText', rawText);
      formData.append('existingProduct', existingProduct);
      formData.append('productDescription', productDescription);
      formData.append('clientName', clientName);
      formData.append('priority', priority);
      formData.append('provider', provider);
      formData.append('model', model);
      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to generate client context.');
      }

      const body = (await res.json()) as GenerateResponse;
      const payload: StoredGeneration = {
        artifacts: body.artifacts,
        metadata: body.metadata
      };

      window.localStorage.setItem(ARTIFACT_STORAGE_KEY, JSON.stringify(payload));
      router.push('/results');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unexpected error.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-200 p-6">
      <div className="space-y-2">
        <label htmlFor="rawText" className="block text-sm font-medium text-gray-900">
          Client transcript / demand text
        </label>
        <textarea
          id="rawText"
          rows={8}
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="Paste transcript or requirement notes here..."
          className="w-full rounded-md border border-gray-300 p-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="file" className="block text-sm font-medium text-gray-900">
          Upload .txt or .md file (optional)
        </label>
        <input
          id="file"
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            setFile(selected ?? null);
          }}
          className="block w-full rounded-md border border-gray-300 p-2 text-sm"
        />
        <p className="text-xs text-gray-600">{helperText}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="existingProduct" className="block text-sm font-medium text-gray-900">
            Existing product name
          </label>
          <input
            id="existingProduct"
            value={existingProduct}
            onChange={(event) => setExistingProduct(event.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-900">
            Target audience / client name
          </label>
          <input
            id="clientName"
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="productDescription" className="block text-sm font-medium text-gray-900">
          Existing product description
        </label>
        <textarea
          id="productDescription"
          rows={4}
          value={productDescription}
          onChange={(event) => setProductDescription(event.target.value)}
          className="w-full rounded-md border border-gray-300 p-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="priority" className="block text-sm font-medium text-gray-900">
          Priority level
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value as 'mvp' | 'poc' | 'full')}
          className="w-full rounded-md border border-gray-300 p-2 text-sm md:w-64"
        >
          <option value="mvp">MVP</option>
          <option value="poc">POC</option>
          <option value="full">Full Feature</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="provider" className="block text-sm font-medium text-gray-900">
            LLM provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(event) => {
              const nextProvider = event.target.value as GenerationMetadata['provider'];
              setProvider(nextProvider);
              setModel(DEFAULT_MODEL_BY_PROVIDER[nextProvider]);
            }}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            {(Object.keys(LLM_PROVIDER_LABELS) as Array<GenerationMetadata['provider']>).map((key) => (
              <option key={key} value={key}>
                {LLM_PROVIDER_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="model" className="block text-sm font-medium text-gray-900">
            Model
          </label>
          <select
            id="model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            {modelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="text-xs text-gray-500">
        Default LLM from env: {activeLLM.provider} / {activeLLM.model}
      </p>
    </form>
  );
}
