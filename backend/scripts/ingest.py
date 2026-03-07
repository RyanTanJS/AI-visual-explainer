import json
from pathlib import Path
import os 
from dotenv import load_dotenv
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.core import Document
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext
from llama_index.core import Settings
from llama_index.core import VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
import chromadb
load_dotenv()
DATA_DIR = Path(__file__).parent.parent / "data"
CHROMA_DIR = str(Path(__file__).parent.parent / "chroma_db")

with open(DATA_DIR / "products.json", encoding="utf-8") as f:
    products = json.load(f)

with open(DATA_DIR / "faqs.json", encoding="utf-8") as f:
    faqs = json.load(f)
API_KEY = os.getenv("GOOGLE_API_KEY")

embed_model = GoogleGenAIEmbedding(model_name="gemini-embedding-001", api_key=API_KEY)
Settings.embed_model = embed_model

client = chromadb.PersistentClient(CHROMA_DIR)
splitter = SentenceSplitter(chunk_size=256, chunk_overlap=32)


product_collection = client.get_or_create_collection(name="products")

product_docs = []
for product in products:
    text = product["description"] + " " + " ".join(product["benefits"])
    doc = Document(
        text = text,
        metadata = {
            'product_id': product['product_id'],
            'product_name': product['product_name'],
            'category': product['category'],
            'subcategory': product['subcategory'],
            "risk_level": product['risk_level'],
            "annual_fee": product['annual_fee'],
        }
    )
    product_docs.append(doc)

product_vector_store = ChromaVectorStore(chroma_collection=product_collection)

product_storage_context = StorageContext.from_defaults(vector_store=product_vector_store)

product_index = VectorStoreIndex.from_documents(
    product_docs,
    storage_context=product_storage_context,
    transformations=[splitter]
)

faq_collection = client.get_or_create_collection(name="faqs")
faq_docs = []
for faq in faqs:
    text = faq["question"] + " " + faq["answer"]
    doc = Document(
        text = text,
        metadata = {
            "faq_id":faq['faq_id'],
            "category": faq['category'],
            "tags": ",".join(faq['tags'])
        }
    )
    faq_docs.append(doc)

faq_vector_store = ChromaVectorStore(chroma_collection=faq_collection)
faq_storage_context = StorageContext.from_defaults(vector_store=faq_vector_store)
faq_index = VectorStoreIndex.from_documents(
    faq_docs,
    storage_context=faq_storage_context,
    transformations=[splitter]
)