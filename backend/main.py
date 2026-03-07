import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from models import (
    Product,
    QueryRequest,
    QueryResponse,
    Scene1Response,
    CompressionRequest,
    CompressionResponse,
)

app = FastAPI(title="Ask Apex API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load product data at startup
DATA_DIR = Path(__file__).parent / "data"
CACHE_DIR = Path(__file__).parent / "cache" / "traces"


def load_products() -> list[Product]:
    with open(DATA_DIR / "products.json", encoding="utf-8") as f:
        return [Product(**p) for p in json.load(f)]


products_db: list[Product] = []


@app.on_event("startup")
async def startup():
    global products_db
    products_db = load_products()


# --- Routes ---


@app.get("/api/products", response_model=list[Product])
async def get_products():
    return products_db


@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    for p in products_db:
        if p.product_id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@app.get("/api/scene/{scene_id}")
async def get_scene_trace(scene_id: str):
    """Return pre-cached trace JSON for a scene."""
    filename = f"scene{scene_id}.json" if scene_id.isdigit() else f"{scene_id}.json"
    trace_path = CACHE_DIR / filename
    if not trace_path.exists():
        raise HTTPException(status_code=404, detail=f"Trace not found for scene {scene_id}")
    with open(trace_path, encoding="utf-8") as f:
        return json.load(f)


@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Main query endpoint — returns cached trace or runs live."""
    # For now, serve from cache only
    trace_path = CACHE_DIR / f"scene{request.scene}.json"
    if not trace_path.exists():
        raise HTTPException(
            status_code=501,
            detail="Live queries not yet implemented. Run generate_traces.py first.",
        )
    with open(trace_path, encoding="utf-8") as f:
        return json.load(f)


@app.post("/api/compress", response_model=CompressionResponse)
async def compress_context(request: CompressionRequest):
    """Trigger context compression — returns summary."""
    # Placeholder until compression agent is built
    raise HTTPException(status_code=501, detail="Compression not yet implemented")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
