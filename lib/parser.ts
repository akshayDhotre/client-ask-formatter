import type { ClientContext, PriorityLevel } from '../types';

const PRIORITIES = new Set<PriorityLevel>(['mvp', 'poc', 'full']);

export type BuildContextInput = {
  pastedText?: string;
  uploadedFileContent?: string;
  existingProduct?: string;
  productDescription?: string;
  clientName?: string;
  priority?: string;
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function stripMarkdown(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>\s?/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
  );
}

function normalizePriority(priority?: string): PriorityLevel {
  const value = (priority ?? 'mvp').toLowerCase();
  return PRIORITIES.has(value as PriorityLevel) ? (value as PriorityLevel) : 'mvp';
}

function pickRawInput(pastedText?: string, uploadedFileContent?: string): string {
  const uploaded = stripMarkdown(uploadedFileContent ?? '');
  const pasted = stripMarkdown(pastedText ?? '');

  return normalizeWhitespace(uploaded.length > 0 ? uploaded : pasted);
}

export function buildClientContext(input: BuildContextInput): ClientContext {
  const rawInput = pickRawInput(input.pastedText, input.uploadedFileContent);

  return {
    rawInput,
    existingProduct: input.existingProduct?.trim() || undefined,
    productDescription: input.productDescription?.trim() || undefined,
    clientName: input.clientName?.trim() || undefined,
    priority: normalizePriority(input.priority)
  };
}

export async function parseUpload(file: File): Promise<string> {
  const content = await file.text();
  return normalizeWhitespace(content);
}
