import os
from typing import Dict, Tuple

import streamlit as st
from dotenv import load_dotenv

load_dotenv()

PROVIDER_MODELS = {
    "anthropic": ["claude-sonnet-4-6"],
    "openai": ["gpt-4o"],
    "google": ["gemini-1.5-pro"],
}


def clean_text(value: str) -> str:
    return "\n".join(line.rstrip() for line in value.replace("\r\n", "\n").split("\n")).strip()


def build_common_context(raw_input: str, existing_product: str, product_description: str, client_name: str, priority: str) -> str:
    product_ctx = existing_product.strip()
    if product_description.strip():
        product_ctx = f"{product_ctx}\n{product_description.strip()}".strip()
    if not product_ctx:
        product_ctx = "None"

    return (
        f"CLIENT DEMAND:\n{raw_input}\n\n"
        f"EXISTING PRODUCT CONTEXT:\n{product_ctx}\n\n"
        f"TARGET CLIENT / AUDIENCE:\n{client_name.strip() or 'Not specified'}\n\n"
        f"PRIORITY LEVEL: {priority}"
    )


def build_prompts(ctx: str, outputs: Dict[str, str]) -> Dict[str, str]:
    return {
        "requirements": (
            "You are a senior solutions architect and presales engineer. "
            "Generate REQUIREMENTS.md in clean markdown with sections: "
            "Functional Requirements, Non-Functional Requirements, Constraints and Dependencies, "
            "Open Questions, Assumptions.\n\n"
            f"{ctx}"
        ),
        "sow": (
            "Generate SOW_draft.md in clean markdown with sections: Executive Summary, Objectives, "
            "Scope Inclusions, Out of Scope, Deliverables, Acceptance Criteria, Timeline Assumptions, Risks, Assumptions.\n\n"
            f"{ctx}\n\nEXTRACTED REQUIREMENTS:\n{outputs.get('requirements', '')}"
        ),
        "tech_spec": (
            "Generate TECH_SPEC.md in clean markdown with sections: Technical Overview, Proposed Architecture, "
            "Stack Option A, Stack Option B, Tradeoffs Table, Data and Integrations, Security and Compliance, "
            "Deployment and Operations, Assumptions.\n\n"
            f"{ctx}\n\nEXTRACTED REQUIREMENTS:\n{outputs.get('requirements', '')}"
        ),
        "estimates": (
            "Generate ESTIMATES.md in clean markdown with sections: Estimation Method, Work Breakdown, Story Point Ranges, "
            "Dev-Day Ranges, Cost Drivers, High-Uncertainty Items, Recommended Sequencing, Assumptions.\n\n"
            f"{ctx}\n\nEXTRACTED REQUIREMENTS:\n{outputs.get('requirements', '')}\n\n"
            f"TECH SPEC:\n{outputs.get('tech_spec', '')}"
        ),
        "poc_agent": (
            "Generate POC_AGENT.md as complete coding-agent instructions with sections: Objective, Project Structure, "
            "Implementation Phases, Technical Guardrails, Validation Checklist, Delivery Criteria, Assumptions.\n\n"
            f"{ctx}\n\nREQUIREMENTS:\n{outputs.get('requirements', '')}\n\n"
            f"SOW:\n{outputs.get('sow', '')}\n\nTECH SPEC:\n{outputs.get('tech_spec', '')}\n\n"
            f"ESTIMATES:\n{outputs.get('estimates', '')}"
        ),
    }


def call_llm(provider: str, model: str, prompt: str, system_prompt: str) -> str:
    if provider == "anthropic":
        from anthropic import Anthropic

        api_key = os.getenv("ANTHROPIC_API_KEY", "")
        if not api_key:
            raise RuntimeError("Missing ANTHROPIC_API_KEY")
        client = Anthropic(api_key=api_key)
        res = client.messages.create(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )
        text_blocks = [block.text for block in res.content if getattr(block, "type", "") == "text"]
        return "\n".join(text_blocks).strip()

    if provider == "openai":
        from openai import OpenAI

        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise RuntimeError("Missing OPENAI_API_KEY")
        client = OpenAI(api_key=api_key)
        # Support both newer Responses API and older Chat Completions API.
        if hasattr(client, "responses"):
            res = client.responses.create(
                model=model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
            )
            return (getattr(res, "output_text", "") or "").strip()

        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        return (completion.choices[0].message.content or "").strip()

    if provider == "google":
        import google.generativeai as genai

        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY", "")
        if not api_key:
            raise RuntimeError("Missing GOOGLE_GENERATIVE_AI_API_KEY")
        genai.configure(api_key=api_key)
        gm = genai.GenerativeModel(model_name=model, system_instruction=system_prompt)
        res = gm.generate_content(prompt)
        return (res.text or "").strip()

    raise RuntimeError(f"Unsupported provider: {provider}")


def generate_artifacts(provider: str, model: str, context_block: str) -> Dict[str, str]:
    system_prompt = "You are a senior solutions architect and presales engineer. Return polished markdown only."
    outputs: Dict[str, str] = {}

    steps = ["requirements", "sow", "tech_spec", "estimates", "poc_agent"]
    friendly = {
        "requirements": "REQUIREMENTS.md",
        "sow": "SOW_draft.md",
        "tech_spec": "TECH_SPEC.md",
        "estimates": "ESTIMATES.md",
        "poc_agent": "POC_AGENT.md",
    }

    for step in steps:
        prompts = build_prompts(context_block, outputs)
        with st.status(f"Generating {friendly[step]}..."):
            text = call_llm(provider, model, prompts[step], system_prompt)
            if not text:
                raise RuntimeError(f"{friendly[step]} came back empty")
            outputs[step] = text

    return outputs


def normalize_upload(uploaded_file) -> str:
    if not uploaded_file:
        return ""
    try:
        raw = uploaded_file.read()
        return clean_text(raw.decode("utf-8", errors="ignore"))
    except Exception:
        return ""


def map_outputs(outputs: Dict[str, str]) -> Dict[str, str]:
    return {
        "REQUIREMENTS.md": outputs.get("requirements", ""),
        "SOW_draft.md": outputs.get("sow", ""),
        "TECH_SPEC.md": outputs.get("tech_spec", ""),
        "ESTIMATES.md": outputs.get("estimates", ""),
        "POC_AGENT.md": outputs.get("poc_agent", ""),
    }


def get_default_selection() -> Tuple[str, str]:
    provider = os.getenv("LLM_PROVIDER", "anthropic").strip().lower()
    if provider not in PROVIDER_MODELS:
        provider = "anthropic"
    return provider, PROVIDER_MODELS[provider][0]


st.set_page_config(page_title="CAF Python Prototype", layout="wide")
st.title("Client Ask Formatter (Python Prototype)")
st.caption("Python MVP with Streamlit to demonstrate origin before Next.js production build")

provider_default, model_default = get_default_selection()

with st.sidebar:
    st.subheader("LLM Settings")
    provider = st.selectbox("Provider", list(PROVIDER_MODELS.keys()), index=list(PROVIDER_MODELS.keys()).index(provider_default))
    models = PROVIDER_MODELS[provider]
    model = st.selectbox("Model", models, index=models.index(model_default) if model_default in models else 0)
    st.info("Server-side validation exists in the JS app; this prototype keeps options constrained by provider.")

col1, col2 = st.columns(2)
with col1:
    raw_text = st.text_area("Client transcript / demand text", height=240)
    uploaded_file = st.file_uploader("Upload .txt or .md", type=["txt", "md"])

with col2:
    existing_product = st.text_input("Existing product name")
    client_name = st.text_input("Target audience / client")
    product_description = st.text_area("Existing product description", height=120)
    priority = st.selectbox("Priority", ["mvp", "poc", "full"], index=0)

if st.button("Generate Artifacts", type="primary"):
    file_text = normalize_upload(uploaded_file)
    chosen_input = clean_text(file_text or raw_text)

    if not chosen_input:
        st.error("Provide transcript text or upload a .txt/.md file.")
    else:
        try:
            context = build_common_context(
                raw_input=chosen_input,
                existing_product=existing_product,
                product_description=product_description,
                client_name=client_name,
                priority=priority,
            )
            outputs = generate_artifacts(provider, model, context)
            docs = map_outputs(outputs)

            st.success(f"Generated 5 artifacts using {provider}/{model}")

            for file_name, content in docs.items():
                with st.expander(file_name, expanded=False):
                    preview = content[:1000] + ("..." if len(content) > 1000 else "")
                    st.markdown("### Preview")
                    st.code(preview, language="markdown")
                    st.download_button(
                        label=f"Download {file_name}",
                        data=content,
                        file_name=file_name,
                        mime="text/markdown",
                        key=f"download_{file_name}",
                    )
        except Exception as exc:
            st.error(f"Generation failed: {exc}")
