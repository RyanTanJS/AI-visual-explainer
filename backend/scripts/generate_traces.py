"""
Generate pre-computed trace JSONs for Scenes 1 and 2.

Runs the LangGraph orchestrator against scripted queries, captures every
intermediate step (thoughts, tool calls, observations), and saves the
trace files that the frontend replays with setTimeout.

Usage:
    cd backend
    python scripts/generate_traces.py
"""

import json
import sys
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

import chromadb
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
import os
from orchestrator import app

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

CACHE_DIR = Path(__file__).parent.parent / "cache"
TRACES_DIR = CACHE_DIR / "traces"
CHROMA_DIR = str(Path(__file__).parent.parent / "chroma_db")
PCA_PATH = CACHE_DIR / "pca_model.json"
VECTORS_PATH = CACHE_DIR / "vector_positions.json"

API_KEY = os.getenv("GOOGLE_API_KEY")
embed_model = GoogleGenAIEmbedding(model_name="gemini-embedding-001", api_key=API_KEY)

# Scripted queries from the SDD
SCENE_1_QUERY = (
    "Hi! I travel quite a bit for work — usually 2-3 flights a month. "
    "What card would suit me best?"
)
SCENE_2_QUERY = (
    "That sounds good! I earn about £42,000 a year and spend roughly "
    "£1,800 a month on my card. Would the annual fee actually be worth it for me?"
)

SYSTEM_PROMPT_SCENE_2 = (
    "You are an Apex Bank AI assistant. You MUST use the available tools to answer. "
    "For any numerical calculations, use the calculator tool. "
    "For product information, use rag_search. "
    "For eligibility checks, use check_eligibility. "
    "Never guess numbers — always compute with tools."
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_pca():
    """Load saved PCA components and mean for projecting query vectors to 3D."""
    with open(PCA_PATH, encoding="utf-8") as f:
        pca = json.load(f)
    return np.array(pca["components"]), np.array(pca["mean"])


def project_to_3d(embedding, pca_components, pca_mean):
    """Project a high-dim embedding into the same 3D space as the products."""
    vec = np.array(embedding) - pca_mean
    return (pca_components @ vec).tolist()


def get_query_vector_3d(query: str, pca_components, pca_mean):
    """Embed a query string and project it to 3D."""
    raw = embed_model.get_query_embedding(query)
    coords = project_to_3d(raw, pca_components, pca_mean)
    return {"id": "query", "label": "Query", "category": "query",
            "x": coords[0], "y": coords[1], "z": coords[2]}


def get_matched_vectors(query: str, k: int = 3):
    """Run ChromaDB similarity search and return matched chunk IDs + scores."""
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.get_collection("products")
    query_vec = embed_model.get_query_embedding(query)
    results = collection.query(
        query_embeddings=[query_vec], n_results=k,
        include=["metadatas", "distances"]
    )
    matched = []
    for meta, dist in zip(results["metadatas"][0], results["distances"][0]):
        score = 1 - dist  # ChromaDB returns L2 distance; approximate similarity
        matched.append({
            "product_id": meta.get("product_id", ""),
            "label": meta.get("product_name", ""),
            "category": meta.get("category", ""),
            "score": round(score, 3),
        })
    return matched


def extract_text(content):
    """Extract plain text from Gemini's structured content format."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, dict) and "text" in part:
                parts.append(part["text"])
            elif isinstance(part, str):
                parts.append(part)
        return "\n".join(parts)
    return str(content)


def run_and_capture(query: str, prior_messages=None, system_prompt=None):
    """
    Run the LangGraph orchestrator and capture each step as trace events.

    Returns (steps, final_answer, all_messages) where steps is a list of
    trace step dicts matching the TraceStep schema.
    """
    messages = list(prior_messages) if prior_messages else []
    if system_prompt:
        messages.insert(0, ("system", system_prompt))
    messages.append(("human", query))

    steps = []
    t = 0  # milliseconds offset for replay timing
    TIME_GAP = 800

    # Stream events from LangGraph to capture intermediate steps
    for event in app.stream({"messages": messages}):
        if "agent" in event:
            msg = event["agent"]["messages"][0]

            # Check for tool calls (agent deciding to use a tool)
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                # The LLM's reasoning before the tool call
                text = extract_text(msg.content)
                if text.strip():
                    steps.append({
                        "type": "thought",
                        "content": text,
                        "t": t,
                    })
                    t += TIME_GAP

                for tc in msg.tool_calls:
                    steps.append({
                        "type": "action",
                        "tool": tc["name"],
                        "params": tc["args"],
                        "t": t,
                    })
                    t += TIME_GAP

            else:
                # Final answer from the agent
                steps.append({
                    "type": "answer",
                    "content": extract_text(msg.content),
                    "t": t,
                })
                t += TIME_GAP

        elif "tools" in event:
            # Tool execution results
            for tool_msg in event["tools"]["messages"]:
                steps.append({
                    "type": "observation",
                    "result": tool_msg.content,
                    "t": t,
                })
                t += TIME_GAP

    final_answer = ""
    for s in reversed(steps):
        if s["type"] == "answer":
            final_answer = s.get("content", "")
            break

    return steps, final_answer


# ---------------------------------------------------------------------------
# Scene generators
# ---------------------------------------------------------------------------

def generate_scene_1():
    """Scene 1: RAG — travel card query with 3D vector data."""
    print("Generating Scene 1 trace...")

    pca_components, pca_mean = load_pca()

    # Get 3D query vector position
    query_point = get_query_vector_3d(SCENE_1_QUERY, pca_components, pca_mean)

    # Get matched product vectors with similarity scores
    matched = get_matched_vectors(SCENE_1_QUERY, k=3)

    # Load all product positions
    with open(VECTORS_PATH, encoding="utf-8") as f:
        all_vectors = json.load(f)

    # Run the agent and capture trace steps
    steps, final_answer = run_and_capture(SCENE_1_QUERY)

    trace = {
        "scene": 1,
        "query": SCENE_1_QUERY,
        "steps": steps,
        "query_vector": query_point,
        "matched_vectors": matched,
        "all_vectors": all_vectors,
        "final_answer": final_answer,
    }

    save_trace("scene1.json", trace)
    print(f"  Scene 1: {len(steps)} steps captured")


def generate_scene_2(prior_messages):
    """Scene 2: ReAct — affordability with tool calling."""
    print("Generating Scene 2 trace...")

    # Run WITHOUT full prior context so the LLM must use tools to look up
    # product info and calculate. We give it minimal context about what
    # card was discussed so it knows what to look up.
    context_msg = (
        "human",
        "I'm interested in the Apex Sapphire Travel Card. " + SCENE_2_QUERY
    )
    steps, final_answer = run_and_capture(
        context_msg[1], system_prompt=SYSTEM_PROMPT_SCENE_2
    )

    trace = {
        "scene": 2,
        "query": SCENE_2_QUERY,
        "steps": steps,
        "final_answer": final_answer,
    }

    save_trace("scene2.json", trace)
    print(f"  Scene 2: {len(steps)} steps captured")


# ---------------------------------------------------------------------------
# Save
# ---------------------------------------------------------------------------

def save_trace(filename: str, trace: dict):
    TRACES_DIR.mkdir(parents=True, exist_ok=True)
    path = TRACES_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(trace, f, indent=2, ensure_ascii=False)
    print(f"  Saved {path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 50)
    print("Generating trace files for Scenes 1 & 2")
    print("=" * 50)

    generate_scene_1()
    print()
    generate_scene_2(None)

    print()
    print("Done! Traces saved to backend/cache/traces/")


if __name__ == "__main__":
    main()
