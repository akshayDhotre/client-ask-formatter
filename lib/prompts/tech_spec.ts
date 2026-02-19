import type { ClientContext } from '../../types';

export function buildPrompt(
  ctx: ClientContext,
  priorOutputs?: Record<string, string>
): string {
  return `You are a senior software architect.
Your task is to produce a technical specification from the client demand and requirements.

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

Create TECH_SPEC.md using Markdown with these sections:
1. Technical Overview
2. Proposed Architecture
3. Stack Option A
4. Stack Option B
5. Tradeoffs Table
6. Data and Integrations
7. Security and Compliance Considerations
8. Deployment and Operations
9. Assumptions

Rules:
- Provide at least two viable stack options.
- Include a clear tradeoff table comparing options.
- Keep recommendations practical for the stated priority.
- Do not add preamble text outside the document.

Output in clean Markdown only.`;
}
