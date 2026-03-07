# Ask Apex — Claude Code Project Context

## What This Is
A narrative-driven interactive web app that explains Agentic AI concepts to non-technical audiences.
A fictional user "Alex" chats with the Apex Bank AI assistant. The viewer follows the conversation
while a live "under the hood" panel visualises exactly what the AI is doing at each step.
Built as a portfolio project for a UBS Data/AI internship starting June 2025.

## The 4-Scene Story
| Scene | Alex's Query | Technology | Visualisation |
|---|---|---|---|
| 1 | "What card is best for travel?" | RAG | react-three-fiber 3D vector space |
| 2 | "Can I actually afford this?" | ReAct + Tool Calling | Framer Motion step-by-step panel |
| 3 | "What about a mortgage too?" | Multi-agent orchestration | React Flow agent graph |
| Finale | One more question... | Context window overflow | Compression animation |

Context window bar runs along the bottom of every scene, filling up across all 4 scenes,
overflowing at the finale, then compressing via summarisation.

## Tech Stack

### Frontend
- React 18 + Tailwind CSS
- Framer Motion — scene transitions and ReAct panel animations
- react-three-fiber + three.js r128 — Scene 1 3D vector space
- @xyflow/react (React Flow) — Scene 3 agent graph canvas
- Zustand — global state (sceneStore, traceStore, contextStore)
- Lucide React — agent node icons
- Dagre — auto-layout for React Flow graph

### Backend
- FastAPI + uvicorn — API server
- LlamaIndex — RAG ingestion pipeline
- LangGraph — multi-agent orchestration
- ChromaDB (local, persistent) — vector database
- Google Gemini: gemini-2.0-flash (LLM) + text-embedding-004 (embeddings, 768-dim)
- SQLite — LLM response cache
- scikit-learn — PCA (768-dim → 3D for visualisation)

## Key Architectural Decisions

**Cached traces, not live calls.**
Backend runs real LlamaIndex/LangGraph queries once, serialises the full event trace as JSON,
stores in `backend/cache/traces/`. Frontend replays with setTimeout buffers for dramatic pacing.
Swap to live streaming later — the visualisation layer doesn't change.

**Trace JSON format** (what backend returns, what frontend animates):
```json
{
  "scene": 1,
  "steps": [
    { "type": "thought", "content": "...", "t": 0 },
    { "type": "action", "tool": "rag_search", "params": {}, "t": 800 },
    { "type": "observation", "result": "...", "t": 1400 },
    { "type": "edge_activated", "edge": "orchestrator-rag", "t": 2000 },
    { "type": "agent_output", "agent": "rag-agent", "result": "...", "t": 2800 },
    { "type": "answer", "content": "...", "t": 3400 }
  ]
}
```
Replay engine: `frontend/src/utils/traceReplayer.js`
Each event dispatches to Zustand store → components react and animate.

**Two ChromaDB collections:**
- `"products"` — product descriptions, benefits, eligibility chunks → Scene 1 RAG + Scene 3 Product Agent
- `"support"` — standalone FAQ documents → Scene 3 Support Agent routing
Each product generates ~5-6 chunks (description, benefits, eligibility, sentiment, FAQs as separate docs).
Target: ~120 chunks in products + ~15 docs in support.

**Split screen layout:**
- Chat panel: 40% left (Alex's conversation)
- Visualisation panel: 60% right (switches per scene)
- Context window bar: pinned to bottom, always visible

**React Flow agent nodes are hexagon-shaped custom components**, not default rectangles.
Each node contains: Lucide icon + agent name + status indicator + memory panel (ST/LT/episodic).

## Folder Structure
```
ask-apex/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         — Header, ChatPanel, VisualisationPanel
│   │   │   ├── chat/           — MessageBubble, TypingIndicator, TeachingCallout
│   │   │   ├── scenes/         — Scene1_VectorSpace, Scene2_ReActPanel, Scene3_AgentGraph
│   │   │   ├── agents/         — AgentNode, OrchestratorNode, MemoryPanel, StateEnvelope
│   │   │   └── context/        — ContextWindowBar, CompressionAnimation
│   │   ├── stores/             — sceneStore.js, traceStore.js, contextStore.js (Zustand)
│   │   ├── utils/              — traceReplayer.js, tokenCounter.js
│   │   └── data/traces/        — scene1.json, scene2.json, scene3.json, finale.json
│   └── package.json
│
├── backend/
│   ├── main.py                 — FastAPI routes
│   ├── agents/                 — orchestrator.py, rag_agent.py, react_agent.py,
│   │                             product_agent.py, eligibility_agent.py
│   ├── tools/                  — calculator.py, rag_search.py, eligibility_check.py
│   ├── data/                   — products.json, faqs.json
│   ├── cache/
│   │   ├── responses.db        — SQLite LLM response cache
│   │   └── traces/             — pre-computed scene trace JSONs
│   ├── chroma_db/              — ChromaDB persistent storage (gitignored)
│   ├── scripts/
│   │   ├── ingest.py           — embed products + FAQs into ChromaDB, run PCA
│   │   ├── generate_traces.py  — pre-compute all scene traces
│   │   └── reduce_dimensions.py
│   └── models.py               — Pydantic data models
│
├── docs/
│   ├── SDD.md                  — full software design document
│   ├── dataset-schema.md       — product JSON schema reference
│   ├── system-prompts.md       — all 5 LLM system prompts
│   └── trace-format.md         — trace JSON spec
│
├── .env                        — GOOGLE_API_KEY (never commit)
└── CLAUDE.md                   — this file
```

## What I Am Writing Myself (Do Not Auto-Generate)
These files exist for learning value — scaffold around them, don't write them for me:
- `backend/scripts/ingest.py` — LlamaIndex ingestion pipeline
- `backend/agents/orchestrator.py` — LangGraph StateGraph definition
- `backend/tools/calculator.py` — ReAct calculator tool
- `backend/tools/rag_search.py` — ReAct RAG search tool
- `backend/tools/eligibility_check.py` — ReAct eligibility tool

For everything else, scaffold freely and I will understand it at a high level.

## Build Order
```
Phase 1 — Backend foundation    (FastAPI, ChromaDB, ingest pipeline, PCA, SQLite cache)
Phase 2 — Scene 1 frontend      (chat panel + Three.js vector space + trace replay engine)
Phase 3 — Scene 2               (ReAct panel + 3 tools)
Phase 4 — Scene 3               (LangGraph multi-agent + React Flow custom nodes + memory panels)
Phase 5 — Context window bar    (token counting + compression finale)
Phase 6 — Polish + deploy       (Vercel frontend, Railway backend)
```
Always complete backend for a scene before building its frontend visualisation.

## Dataset Summary
- 20 synthetic Apex Bank products across 5 categories
- Categories: Travel Credit Cards, Cashback Credit Cards, Mortgages, Personal Loans, Savings/ISA
- ~5-6 chunks per product = ~120 vectors in ChromaDB "products" collection
- ~15 standalone support FAQs in ChromaDB "support" collection
- Full schema in `docs/dataset-schema.md`

## Environment Variables
```
GOOGLE_API_KEY=
CHROMA_PERSIST_DIR=./chroma_db
SQLITE_CACHE_PATH=./cache/responses.db
CORS_ORIGINS=http://localhost:5173
```

## Coding Conventions
- Python: type hints on all functions, Pydantic models for all API request/response shapes
- React: functional components only, no class components
- State: Zustand stores only — no prop drilling, no useContext for global state
- Animations: all scene transitions via Framer Motion, no CSS transitions for scene switches
- Comments: explain the AI concept being demonstrated, not just what the code does
