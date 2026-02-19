import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

import { ARTIFACT_FILES } from './artifacts';
import type { ArtifactBundle } from '../types';

function triggerDownload(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toPdfArrayBuffer(title: string, content: string): ArrayBuffer {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const lineHeight = 14;

  doc.setFont('courier', 'normal');
  doc.setFontSize(10);

  const heading = `${title}`;
  const bodyLines = doc.splitTextToSize(content || '', pageWidth - margin * 2) as string[];

  let y = margin;
  doc.setFontSize(12);
  doc.text(heading, margin, y);
  y += lineHeight * 2;

  doc.setFontSize(10);
  bodyLines.forEach((line) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  return doc.output('arraybuffer');
}

export function downloadMarkdown(fileName: string, content: string): void {
  triggerDownload(fileName, new Blob([content], { type: 'text/markdown;charset=utf-8' }));
}

export function downloadPdf(fileName: string, title: string, content: string): void {
  const pdfFile = fileName.replace(/\.md$/i, '.pdf');
  const buffer = toPdfArrayBuffer(title, content);
  triggerDownload(pdfFile, new Blob([buffer], { type: 'application/pdf' }));
}

export async function downloadAllArtifactsAsZip(
  artifacts: ArtifactBundle,
  format: 'md' | 'pdf'
): Promise<void> {
  const zip = new JSZip();

  (Object.keys(artifacts) as Array<keyof ArtifactBundle>).forEach((key) => {
    const baseFile = ARTIFACT_FILES[key];
    const content = artifacts[key];

    if (format === 'md') {
      zip.file(baseFile, content);
      return;
    }

    const pdfBuffer = toPdfArrayBuffer(baseFile.replace(/\.md$/i, ''), content);
    zip.file(baseFile.replace(/\.md$/i, '.pdf'), pdfBuffer);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(format === 'md' ? 'CAF_Artifacts_MD.zip' : 'CAF_Artifacts_PDF.zip', blob);
}
