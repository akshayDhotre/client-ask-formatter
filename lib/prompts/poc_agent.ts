import type { ClientContext } from '../../types';

export function buildPrompt(
  ctx: ClientContext,
  priorOutputs?: Record<string, string>
): string {
  return `You are a principal engineer writing startup instructions for an AI coding agent.
Your task is to output a complete AGENT.md-style build brief for implementing a POC.

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

SOW DRAFT:
${priorOutputs?.sow ?? 'Not available'}

TECH SPEC:
${priorOutputs?.techSpec ?? 'Not available'}

ESTIMATES:
${priorOutputs?.estimates ?? 'Not available'}

Create POC_AGENT.md in Markdown with these sections:
1. Objective
2. Project Structure
3. Implementation Phases
4. Technical Guardrails
5. Validation Checklist
6. Delivery Criteria
7. Assumptions

Rules:
- This must be actionable instructions, not explanatory prose.
- Include concrete build order and file-level expectations.
- Keep scope aligned to the selected priority level.
- Do not add preamble text outside the document.

Output in clean Markdown only.`;
}
