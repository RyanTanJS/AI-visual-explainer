"""
Initialize the SQLite response cache database.

Usage:
    python scripts/init_cache.py
"""

import sqlite3
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from config import SQLITE_CACHE_PATH


def main():
    db_path = Path(__file__).parent.parent / "cache" / "responses.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS response_cache (
            query_hash TEXT PRIMARY KEY,
            scene_id INTEGER NOT NULL,
            response_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            hit_count INTEGER DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()

    print(f"Cache database initialized at {db_path}")


if __name__ == "__main__":
    main()
