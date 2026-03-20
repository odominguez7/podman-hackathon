import sqlite3
import os
from datetime import datetime, timedelta
from typing import Optional

DB_PATH = os.environ.get("YU_DB_PATH", "yu_shield.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS checkins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            mood INTEGER NOT NULL CHECK(mood BETWEEN 1 AND 5),
            energy INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 5),
            sleep INTEGER NOT NULL CHECK(sleep BETWEEN 1 AND 5),
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, created_at);
    """)
    conn.commit()
    conn.close()


def create_user(user_id: str, first_name: str):
    conn = get_db()
    conn.execute(
        "INSERT OR IGNORE INTO users (id, first_name) VALUES (?, ?)",
        (user_id, first_name),
    )
    conn.commit()
    conn.close()


def get_user(user_id: str) -> Optional[dict]:
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def add_checkin(user_id: str, mood: int, energy: int, sleep: int, note: str = None):
    conn = get_db()
    conn.execute(
        "INSERT INTO checkins (user_id, mood, energy, sleep, note) VALUES (?, ?, ?, ?, ?)",
        (user_id, mood, energy, sleep, note),
    )
    conn.commit()
    conn.close()


def get_checkins(user_id: str, days: int = 30) -> list[dict]:
    conn = get_db()
    since = (datetime.now() - timedelta(days=days)).isoformat()
    rows = conn.execute(
        "SELECT * FROM checkins WHERE user_id = ? AND created_at >= ? ORDER BY created_at",
        (user_id, since),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_baseline(user_id: str) -> Optional[dict]:
    """Calculate baseline from first 7+ days of data."""
    conn = get_db()
    rows = conn.execute(
        "SELECT mood, energy, sleep FROM checkins WHERE user_id = ? ORDER BY created_at",
        (user_id,),
    ).fetchall()
    conn.close()

    if len(rows) < 7:
        return None

    baseline_rows = rows[:7]
    return {
        "mood": round(sum(r["mood"] for r in baseline_rows) / 7, 1),
        "energy": round(sum(r["energy"] for r in baseline_rows) / 7, 1),
        "sleep": round(sum(r["sleep"] for r in baseline_rows) / 7, 1),
        "data_points": len(rows),
    }


def detect_drift(user_id: str) -> Optional[dict]:
    """Detect if last 3+ days are meaningfully below baseline."""
    baseline = get_baseline(user_id)
    if not baseline:
        return None

    conn = get_db()
    recent = conn.execute(
        "SELECT mood, energy, sleep, created_at FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 3",
        (user_id,),
    ).fetchall()
    conn.close()

    if len(recent) < 3:
        return None

    recent = [dict(r) for r in recent]
    avg_mood = round(sum(r["mood"] for r in recent) / 3, 1)
    avg_energy = round(sum(r["energy"] for r in recent) / 3, 1)
    avg_sleep = round(sum(r["sleep"] for r in recent) / 3, 1)

    alerts = []
    if avg_mood < baseline["mood"] - 1.5:
        alerts.append({"metric": "mood", "baseline": baseline["mood"], "recent": avg_mood})
    if avg_energy < baseline["energy"] - 1.5:
        alerts.append({"metric": "energy", "baseline": baseline["energy"], "recent": avg_energy})
    if avg_sleep < baseline["sleep"] - 1.5:
        alerts.append({"metric": "sleep", "baseline": baseline["sleep"], "recent": avg_sleep})

    return {"alerts": alerts, "baseline": baseline, "recent_avg": {"mood": avg_mood, "energy": avg_energy, "sleep": avg_sleep}} if alerts else None
