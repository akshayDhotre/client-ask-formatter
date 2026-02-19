import { NextResponse } from 'next/server';

import { resolveLLMConfig } from '../../../lib/llm';
import { generateArtifactBundle } from '../../../lib/pipeline';
import { buildClientContext, parseUpload } from '../../../lib/parser';

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.txt') || name.endsWith('.md');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const rawText = String(formData.get('rawText') ?? '');
    const existingProduct = String(formData.get('existingProduct') ?? '');
    const productDescription = String(formData.get('productDescription') ?? '');
    const clientName = String(formData.get('clientName') ?? '');
    const priority = String(formData.get('priority') ?? 'mvp');
    const provider = String(formData.get('provider') ?? '');
    const model = String(formData.get('model') ?? '');

    const fileValue = formData.get('file');
    const file = fileValue instanceof File ? fileValue : null;

    if (file && !isAcceptedFile(file)) {
      return NextResponse.json(
        { error: 'Only .txt and .md files are supported.' },
        { status: 400 }
      );
    }

    const uploadedFileContent = file ? await parseUpload(file) : undefined;

    const context = buildClientContext({
      pastedText: rawText,
      uploadedFileContent,
      existingProduct,
      productDescription,
      clientName,
      priority
    });

    if (!context.rawInput) {
      return NextResponse.json(
        { error: 'Provide transcript text or upload a .txt/.md file.' },
        { status: 400 }
      );
    }

    const metadata = resolveLLMConfig(provider, model);
    const artifacts = await generateArtifactBundle(context, metadata);

    return NextResponse.json({
      status: 'ok',
      artifacts,
      metadata
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Artifact generation failed.';

    return NextResponse.json(
      {
        error: message
      },
      { status: 500 }
    );
  }
}
