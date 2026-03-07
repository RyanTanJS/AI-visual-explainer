# Ask Apex — Build Plan

## Division of Labor

### Ryan writes (guided by AI, not written by AI):
- `backend/scripts/ingest.py` — LlamaIndex ingestion into 2 ChromaDB collections
- `backend/agents/orchestrator.py` — LangGraph StateGraph with nodes + edges
- `backend/tools/calculator.py` — sandboxed math eval tool
- `backend/tools/rag_search.py` — ChromaDB query wrapper tool
- `backend/tools/eligibility_check.py` — rule-based eligibility tool

### AI builds:
- `backend/scripts/reduce_dimensions.py` — PCA 3072->3 (DONE)
- `backend/scripts/init_cache.py` — SQLite cache setup (DONE)
- `backend/scripts/generate_traces.py` — runs agents, serializes trace JSON
- `backend/agents/react_agent.py` — ReAct loop wiring (uses Ryan's tools)
- `backend/agents/product_agent.py` — Scene 3 product specialist
- `backend/agents/eligibility_agent.py` — Scene 3 eligibility specialist
- `backend/agents/recommendation_agent.py` — Scene 3 recommendation specialist
- All frontend components (React, Three.js, React Flow)

---

## Phase 1 — Backend + Data (Sequential Steps)

### Step 1: Set up Python environment ✅
Venv created, dependencies installed, `.env` configured with `GOOGLE_API_KEY`.

### Step 2: Ryan writes `ingest.py` ✅
Embeds products.json and faqs.json into two ChromaDB collections using `GoogleGenAIEmbedding` (gemini-embedding-001, 3072-dim). 20 product chunks + 15 FAQ chunks ingested into `backend/chroma_db/`.

### Step 3: Run `reduce_dimensions.py` ✅
PCA 3072→3D applied. Output: `cache/vector_positions.json` (20 products with 3D coords) + `cache/pca_model.json`.

### Step 4: Run `init_cache.py` ✅
SQLite cache created at `cache/responses.db`.

### Step 5: Ryan writes the 3 ReAct tools ✅
- `calculator.py` — safe AST-based math eval (tree walking, no `eval()`)
- `rag_search.py` — ChromaDB query with manual Gemini embedding via `get_query_embedding()`
- `eligibility_check.py` — rule-based check against `products.json` eligibility criteria

### Step 6: Ryan writes `orchestrator.py` ✅
LangGraph StateGraph with agent node ↔ ToolNode loop. Uses `gemini-2.5-flash` with `bind_tools()`. Conditional edges route to tools or END based on `tool_calls`. Tested end-to-end successfully.

### Step 7: AI builds remaining agents + `generate_traces.py` ← CURRENT
AI wires up Scene 3 specialist agents and builds the trace generation script that pre-computes all 4 scene traces as JSON for frontend replay.

---

## Phase 2 — Frontend (after Phase 1 is solid)

### Step 8: Scaffold React app
- `npm create vite@latest` with React template
- Install dependencies: react-three-fiber, @xyflow/react, framer-motion, zustand, lucide-react, dagre, tailwindcss
- Set up Tailwind config
- AI builds component structure

### Step 9: Build chat panel + trace replay engine
- Chat panel (40% left) with message bubbles, typing indicator
- Trace replay engine: reads scene JSON, fires events via setTimeout
- Teaching callout components

### Step 10: Scene 1 — 3D vector space
- react-three-fiber canvas showing product embeddings as colored spheres
- Query vector (pink octahedron) flies in, similarity lines appear
- Loads positions from `vector_positions.json`

### Step 11: Scene 2 — ReAct panel
- Step-by-step Thought/Action/Observation display
- Tool icons pulse when activated
- Framer Motion transitions from Scene 1

### Step 12: Scene 3 — Agent graph
- React Flow canvas with custom hexagon agent nodes
- Each node has: Lucide icon, agent name, status indicator, memory panel (ST/LT/EP)
- Animated edges showing state envelope traveling between nodes
- Dagre auto-layout

### Step 13: Context window bar + finale
- Runs along the bottom throughout all scenes
- Color-coded segments per scene, filling progressively
- Compression animation at finale (accordion collapse + reset)

### Step 14: Polish + deploy
- Landing screen ("Meet Alex" intro)
- Error states and loading indicators
- Deploy frontend to Vercel, backend to Railway

---

## Already Complete
- [x] Directory structure
- [x] `backend/data/products.json` — 20 products, no embedded FAQs
- [x] `backend/data/faqs.json` — 15 standalone support FAQs
- [x] `backend/models.py` — Pydantic models
- [x] `backend/config.py` — centralized settings
- [x] `backend/main.py` — FastAPI skeleton
- [x] `backend/requirements.txt`
- [x] `backend/scripts/reduce_dimensions.py` — PCA 3072→3D (Gemini embeddings)
- [x] `backend/scripts/init_cache.py` — SQLite setup
- [x] `.gitignore` + `.env.example`
- [x] `docs/SDD.md`
- [x] `backend/scripts/ingest.py` — LlamaIndex ingestion into 2 ChromaDB collections (gemini-embedding-001, 3072-dim)
- [x] `backend/tools/calculator.py` — safe AST-based math eval
- [x] `backend/tools/rag_search.py` — ChromaDB query with manual Gemini embedding
- [x] `backend/tools/eligibility_check.py` — rule-based eligibility checker
- [x] `backend/orchestrator.py` — LangGraph StateGraph (agent ↔ tools loop, gemini-2.5-flash)
- [x] `cache/vector_positions.json` — 20 products with 3D coordinates
- [x] `cache/responses.db` — SQLite cache initialized

## Current Step
**Step 7** — AI builds `generate_traces.py` + remaining agents
