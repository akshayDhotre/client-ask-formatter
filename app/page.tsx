import InputForm from '../components/InputForm';
import { getActiveLLMConfig } from '../lib/llm';

export default function HomePage() {
  const llm = getActiveLLMConfig();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Client Ask Formatter</h1>
      <p className="mt-2 text-sm text-gray-600">
        Submit a client ask and generate the full artifact bundle in one pipeline run.
      </p>
      <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
        Default LLM: {llm.provider} / {llm.model}
      </p>
      <div className="mt-8">
        <InputForm activeLLM={llm} />
      </div>
    </main>
  );
}
