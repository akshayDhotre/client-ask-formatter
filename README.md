# Client Ask Formatter (CAF)

Client Ask Formatter (CAF) converts raw client demand input (transcript or requirement notes) into a structured artifact bundle using an LLM pipeline.

## Why this app is needed

In presales and early delivery phases, teams repeatedly do the same high-effort translation work:
- Convert unstructured client conversations into requirements
- Turn requirements into scope and architecture documents
- Estimate effort/cost with clear assumptions
- Create implementation-ready handoff documents

This process is usually manual, slow, and inconsistent across teams.
CAF standardizes and accelerates that workflow by generating a coherent artifact set from one input source.

### Business problems CAF addresses
- Long turnaround from discovery call to proposal-ready documentation
- Inconsistent document quality across contributors
- Lost context between presales, architecture, and engineering handoff
- Weak traceability of AI output when provider/model is unclear

### Who benefits
- Presales engineers and solution architects
- Engineering managers and technical program managers
- Delivery teams that need structured kickoff inputs quickly

### Outcomes CAF targets
- Faster proposal and scoping cycles
- Better cross-functional alignment
- Repeatable, auditable artifact generation with explicit provider/model metadata

Generated artifacts:
- `REQUIREMENTS.md`
- `SOW_draft.md`
- `TECH_SPEC.md`
- `ESTIMATES.md`
- `POC_AGENT.md`

## Project Journey

This project was built in 3 stages:

1. Idea validation
- Goal: reduce the time from discovery call to delivery-ready documentation.
- Hypothesis: a staged AI pipeline can produce high-quality presales/delivery artifacts from unstructured input.

2. Python prototype (MVP)
- Implemented in `python-prototype-streamlit/`.
- Purpose: validate workflow and artifact quality quickly with minimal setup.
- Outcome: confirmed end-user value and prompt-chain viability.

3. Production-oriented JS app
- Rebuilt in Next.js for stronger app architecture, cleaner API boundaries, and better product UX.
- Added provider/model controls, strict server-side validation, structured pipeline modules, and richer download UX (`.md`/`.pdf`).

## Why JS/Next.js for the main app

- Better full-stack packaging: UI + API routes in one codebase.
- Cleaner deployment path (Vercel-ready App Router architecture).
- Stronger maintainability for frontend-heavy product evolution.
- Easier incremental UX improvements (results views, export controls, routing).
- Typed contracts across client/server with TypeScript.

Python prototype remains useful to demonstrate rapid iteration and architecture evolution.

## Tech Stack

Primary app (`/`):
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- LLM SDKs:
  - `@anthropic-ai/sdk`
  - `openai`
  - `@google/generative-ai`
- Export tooling:
  - `jszip` (bundle downloads)
  - `jspdf` (PDF export)

Prototype (`python-prototype-streamlit/`):
- Streamlit
- Anthropic/OpenAI/Google Python SDKs

## Key Architecture Decisions

1. Multi-step pipeline (not one giant prompt)
- Sequence: `requirements -> sow -> tech spec -> estimates -> poc agent`
- Why: improves coherence, makes dependencies explicit, and simplifies debugging/retries.
- Product impact: documents read like a connected package instead of isolated outputs.

2. Provider abstraction layer
- Core logic calls a unified `callLLM` interface.
- Why: avoids vendor lock-in and supports provider/model experimentation.
- Product impact: easy to compare quality, latency, and cost across providers.

3. Provider/model selection with server allowlist
- UI lets users select provider/model.
- Server validates allowed combinations before generation.
- Why: flexibility for users without sacrificing runtime safety.
- Product impact: transparent and controllable AI behavior for technical teams.

4. Markdown-first artifacts + optional PDF export
- Markdown stays editable for technical teams.
- PDF supports stakeholder sharing.
- Product impact: both engineering-friendly and client-friendly output channels.

5. Database-less MVP
- Artifacts are returned directly and stored in browser `localStorage`.
- Why: faster MVP delivery and lower complexity.
- Tradeoff: no durable history yet.

## What makes CAF different from a simple prompt UI

- Dependency-aware generation pipeline, not single-shot prompting
- Typed API contract and structured artifact bundle
- Runtime provider/model controls with server-side validation
- Built-in artifact packaging (per-file and zip, markdown + pdf)
- Evolution path demonstrated with both Python prototype and production JS architecture

## Why these files exist (high-level file map)

- `app/api/generate/route.ts`
  - Main generation endpoint: validation, context build, model resolution, pipeline execution.
- `lib/parser.ts`
  - Normalizes pasted/uploaded input into clean context.
- `lib/pipeline.ts`
  - Orchestrates sequential artifact generation.
- `lib/prompts/*.ts`
  - One prompt builder per artifact type.
- `lib/llm/index.ts`
  - Provider/model resolution and unified LLM call routing.
- `lib/llm/catalog.ts`
  - Canonical provider/model allowlist for UI + server validation.
- `components/InputForm.tsx`
  - Input workflow including provider/model selectors.
- `components/ArtifactCard.tsx`, `components/ArtifactBundle.tsx`
  - Compact results UI + download controls.
- `lib/exporters.ts`
  - Markdown/PDF export and zip bundling utilities.
- `app/results/page.tsx`
  - Results screen and persisted output rendering.
- `python-prototype-streamlit/app.py`
  - Initial Python MVP implementation for workflow validation.

## Getting Started (JS app)

Prerequisites:
- Node.js 18+ (Node 20+ recommended)
- npm 9+

1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env.local
```

`.env.local`:
```env
LLM_PROVIDER=anthropic

ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

3. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Flow

1. Open `/`
2. Paste transcript text or upload `.txt` / `.md`
3. Fill metadata and priority
4. Select provider + model
5. Click `Generate`
6. Review outputs on `/results`
7. Download per-file (`.md`/`.pdf`) or bundle zip

## API Contract

`POST /api/generate` (`multipart/form-data`):
- `rawText`
- `file` (optional `.txt`/`.md`)
- `existingProduct` (optional)
- `productDescription` (optional)
- `clientName` (optional)
- `priority` (`mvp` | `poc` | `full`)
- `provider` (`anthropic` | `openai` | `google`)
- `model` (must be valid for selected provider)

Success response:
```json
{
  "status": "ok",
  "metadata": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-6"
  },
  "artifacts": {
    "sow": "...",
    "techSpec": "...",
    "estimates": "...",
    "pocAgent": "...",
    "requirements": "..."
  }
}
```

## Commands

JS app:
```bash
npm run dev
npm run build
npm run start
npm run lint
```

Python prototype:
```bash
cd python-prototype-streamlit
pip install -r requirements.txt
streamlit run app.py
```

If Python deps were previously installed and you hit compatibility issues:
```bash
pip install --upgrade --force-reinstall -r requirements.txt
```

## Future Updates

Priority roadmap:
- Add automated tests (parser, prompts, API integration).
- Add timeout/retry policy and provider-specific error taxonomy.
- Add durable history persistence and observability.
- Add audio ingestion and external tool integrations.
