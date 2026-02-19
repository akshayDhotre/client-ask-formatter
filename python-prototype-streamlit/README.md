# Python Prototype (Streamlit)

This folder contains a lightweight Python MVP of Client Ask Formatter (CAF).

Purpose:
- Demonstrate the initial Python-first prototype.
- Show architecture continuity before expanding to the production-grade Next.js app.

## Run

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

If you already installed dependencies and hit `unexpected keyword argument 'proxies'`, run:

```bash
pip install --upgrade --force-reinstall -r requirements.txt
```

3. Create `.env` (or export env vars):

```bash
cp .env.example .env
```

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

4. Start app:

```bash
streamlit run app.py
```

## Notes

- This is intentionally simple and local-first.
- It uses the same artifact generation order as the JS app:
  1. requirements
  2. sow
  3. tech spec
  4. estimates
  5. poc agent
- Artifacts can be downloaded as markdown files from the UI.
