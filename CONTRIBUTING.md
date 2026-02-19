# Contributing

Thanks for contributing to Client Ask Formatter (CAF).

## Development setup

1. Install dependencies:
```bash
npm install
```

2. Configure env:
```bash
cp .env.example .env.local
```

3. Run app:
```bash
npm run dev
```

## Branching and commits

- Use clear branch names, e.g. `feature/provider-selector` or `fix/parser-validation`.
- Keep commits focused and descriptive.
- Prefer small PRs over large mixed changes.

## Code standards

- Use TypeScript for app code.
- Keep provider-specific logic in `lib/llm/*` adapters.
- Keep orchestration in `lib/pipeline.ts`.
- Keep prompts in `lib/prompts/*` (one module per artifact).
- Validate user inputs and model/provider combinations on the server.

## Before opening a PR

Run:
```bash
npm run build
npm run lint
```

If touching Python prototype (`python-prototype-streamlit/`), also sanity-check:
```bash
PYTHONPYCACHEPREFIX=.pycache python3 -m py_compile python-prototype-streamlit/app.py
```

## PR expectations

Include in PR description:
- What changed
- Why it changed
- How to test
- Screenshots (if UI changed)
- Any env/dependency changes

## Reporting issues

Use the issue templates and include:
- Steps to reproduce
- Expected vs actual behavior
- Provider/model used
- Error logs/screenshots
