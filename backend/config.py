import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
EMBEDDING_MODEL = "gemini-embedding-001"
LLM_MODEL = "gemini-2.5-flash"
EMBEDDING_DIM = 3072

CHROMA_PERSIST_DIR = "./chroma_db"
CHROMA_PRODUCT_COLLECTION = "products"
CHROMA_SUPPORT_COLLECTION = "support"

SQLITE_CACHE_PATH = "./cache/responses.db"

CHUNK_SIZE = 256
CHUNK_OVERLAP = 32

PCA_COMPONENTS = 3

CONTEXT_WINDOW_LIMIT = 4096  # simulated token limit for demo
COMPRESSION_THRESHOLD = 0.85  # trigger compression at 85%

CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
]
