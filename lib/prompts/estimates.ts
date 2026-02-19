import type { ClientContext } from '../../types';

export function buildPrompt(
  ctx: ClientContext,
  priorOutputs?: Record<string, string>
): string {
  return `You are an engineering manager creating implementation estimates.
Your task is to produce effort and cost ranges using requirements and technical direction.

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

TECHNICAL SPEC:
${priorOutputs?.techSpec ?? 'Not available'}

Create ESTIMATES.md using Markdown with these sections:
1. Estimation Method
2. Work Breakdown (epics/features)
3. Story Point Ranges
4. Dev-Day Ranges
5. Cost Drivers (engineering, infra, external services)
6. High-Uncertainty Items
7. Recommended MVP/POC sequencing
8. Assumptions

Rules:
- Use ranges, not fixed single-number estimates.
- Flag high-uncertainty items explicitly.
- Be transparent on assumptions and missing information.
- Do not add preamble text outside the document.

Output in clean Markdown only.`;
}
