import type { ClientContext } from '../../types';

export function buildPrompt(
  ctx: ClientContext,
  priorOutputs?: Record<string, string>
): string {
  return `You are a senior solutions architect and presales engineer.
Your task is to generate a Statement of Work draft based on the following client demand and extracted requirements.

---
CLIENT DEMAND:
${ctx.rawInput}

EXISTING PRODUCT CONTEXT:
${ctx.existingProduct ? `${ctx.existingProduct}${ctx.productDescription ? `\n${ctx.productDescription}` : ''}` : 'None'}

TARGET CLIENT / AUDIENCE:
${ctx.clientName ?? 'Not specified'}

PRIORITY LEVEL: ${ctx.priority}
---

EXTRACTED REQUIREMENTS:
${priorOutputs?.requirements ?? 'Not available'}

Create SOW_draft.md using Markdown with these sections:
1. Executive Summary
2. Objectives
3. Scope Inclusions
4. Out of Scope / Exclusions
5. Deliverables
6. Acceptance Criteria
7. Timeline Assumptions
8. Risks
9. Assumptions

Rules:
- Keep commitments realistic.
- Explicitly separate in-scope and out-of-scope items.
- Use client-ready professional wording.
- Do not add preamble text outside the document.

Output in clean Markdown only.`;
}
