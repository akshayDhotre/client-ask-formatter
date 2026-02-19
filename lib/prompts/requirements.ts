import type { ClientContext } from '../../types';

export function buildPrompt(ctx: ClientContext): string {
  return `You are a senior solutions architect and presales engineer.
Your task is to extract detailed functional and non-functional requirements based on the following client demand.

---
CLIENT DEMAND:
${ctx.rawInput}

EXISTING PRODUCT CONTEXT:
${ctx.existingProduct ? `${ctx.existingProduct}${ctx.productDescription ? `\n${ctx.productDescription}` : ''}` : 'None'}

TARGET CLIENT / AUDIENCE:
${ctx.clientName ?? 'Not specified'}

PRIORITY LEVEL: ${ctx.priority}
---

Create REQUIREMENTS.md using Markdown with these sections:
1. Functional Requirements
2. Non-Functional Requirements
3. Constraints and Dependencies
4. Open Questions
5. Assumptions

Rules:
- Requirements should be specific and testable where possible.
- Label uncertain items clearly.
- Keep language concise and professional.
- Do not add preamble text outside the document.

Output in clean Markdown only.`;
}
