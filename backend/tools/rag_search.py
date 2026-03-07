import chromadb
from pathlib import Path
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
import os
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
embed_model = GoogleGenAIEmbedding(model_name="gemini-embedding-001", api_key=API_KEY)
@tool
def rag_search(query: str,k: int=3):
    """Search the product database for relevant banking products."""
    CHROMA_DIR = str(Path(__file__).parent.parent / "chroma_db")

    client = chromadb.PersistentClient(path=CHROMA_DIR)

    collection = client.get_collection("products")

    
    query_vector = embed_model.get_query_embedding(query)
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
        )
    output = []
    for doc,meta in zip(results["documents"][0],results["metadatas"][0]):
        output.append(f"{meta.get('product_name', 'Unknown')} ({meta.get('category', '')}, £{meta.get('annual_fee', 'N/A')}/yr): {doc}")
    return "\n".join(output)
    
     