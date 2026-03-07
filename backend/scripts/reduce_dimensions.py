"""
Reduce high-dim Gemini embeddings to 3D using PCA for frontend visualisation.

Run AFTER ingest.py has populated the ChromaDB products collection.

Usage:
    python scripts/reduce_dimensions.py
"""

import json
import sys
from pathlib import Path

import numpy as np
from sklearn.decomposition import PCA

sys.path.append(str(Path(__file__).parent.parent))

import chromadb
from config import CHROMA_PRODUCT_COLLECTION, PCA_COMPONENTS

CHROMA_DIR = str(Path(__file__).parent.parent / "chroma_db")


def main():
    # Connect to existing ChromaDB
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.get_collection(CHROMA_PRODUCT_COLLECTION)

    # Pull all embeddings and metadata
    results = collection.get(include=["embeddings", "metadatas", "documents"])

    if results["embeddings"] is None or len(results["embeddings"]) == 0:
        print("No embeddings found. Run ingest.py first.")
        return

    ids = results["ids"]
    embeddings = np.array(results["embeddings"])
    metadatas = results["metadatas"]

    print(f"Loaded {len(ids)} vectors of dimension {embeddings.shape[1]}")

    # PCA reduction
    pca = PCA(n_components=PCA_COMPONENTS)
    coords_3d = pca.fit_transform(embeddings)

    print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
    print(f"Total variance captured: {sum(pca.explained_variance_ratio_):.2%}")

    # Build output: one entry per chunk with its 3D position
    points = []
    for i, chunk_id in enumerate(ids):
        meta = metadatas[i] if metadatas else {}
        points.append({
            "id": chunk_id,
            "product_id": meta.get("product_id", ""),
            "label": meta.get("product_name", chunk_id),
            "category": meta.get("category", ""),
            "subcategory": meta.get("subcategory", ""),
            "x": float(coords_3d[i][0]),
            "y": float(coords_3d[i][1]),
            "z": float(coords_3d[i][2]),
        })

    # Save
    output_path = Path(__file__).parent.parent / "cache" / "vector_positions.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(points, f, indent=2)

    print(f"Saved {len(points)} 3D positions to {output_path}")

    # Also save the PCA model params so we can project query vectors later
    pca_params = {
        "components": pca.components_.tolist(),
        "mean": pca.mean_.tolist(),
    }
    pca_path = Path(__file__).parent.parent / "cache" / "pca_model.json"
    with open(pca_path, "w", encoding="utf-8") as f:
        json.dump(pca_params, f)

    print(f"Saved PCA model to {pca_path}")


if __name__ == "__main__":
    main()
