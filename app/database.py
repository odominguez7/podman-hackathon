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


def get_team_members() -> list[dict]:
    """Return anonymized per-member wellness status for manager view."""
    conn = get_db()
    users = conn.execute("SELECT id, first_name, created_at FROM users").fetchall()
    conn.close()

    members = []
    for u in users:
        uid = u["id"]
        checkins = get_checkins(uid, days=7)
        baseline = get_baseline(uid)
        drift = detect_drift(uid)

        if not checkins:
            status = "inactive"
            latest = None
        else:
            latest = checkins[-1]
            if drift and drift.get("alerts"):
                status = "alert"
            else:
                status = "stable"

        members.append({
            "status": status,
            "checkins_7d": len(checkins),
            "latest_mood": latest["mood"] if latest else None,
            "latest_energy": latest["energy"] if latest else None,
            "latest_sleep": latest["sleep"] if latest else None,
            "baseline": baseline,
            "drift_alerts": len(drift["alerts"]) if drift and drift.get("alerts") else 0,
        })

    return sorted(members, key=lambda m: (m["status"] != "alert", m["status"] != "stable"))


def get_dashboard_aggregates() -> dict:
    """Aggregate dashboard stats across all users."""
    conn = get_db()
    cutoff = (datetime.now() - timedelta(days=14)).isoformat()

    # Total unique users
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]

    # Users with at least one check-in in last 14 days
    active_users = conn.execute(
        "SELECT COUNT(DISTINCT user_id) FROM checkins WHERE created_at >= ?",
        (cutoff,),
    ).fetchone()[0]

    participation_rate = round(active_users / total_users, 2) if total_users > 0 else 0.0

    # Drift alerts: count users who currently have active drift
    all_user_ids = [
        row[0] for row in conn.execute("SELECT id FROM users").fetchall()
    ]
    conn.close()

    drift_alerts = 0
    for uid in all_user_ids:
        if detect_drift(uid) is not None:
            drift_alerts += 1

    # Daily averages for last 14 days
    conn = get_db()
    rows = conn.execute(
        """
        SELECT DATE(created_at) as day,
               ROUND(AVG(mood), 1) as mood,
               ROUND(AVG(energy), 1) as energy,
               ROUND(AVG(sleep), 1) as sleep
        FROM checkins
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY day
        """,
        (cutoff,),
    ).fetchall()
    conn.close()

    daily_trends = [
        {"date": r["day"], "mood": r["mood"], "energy": r["energy"], "sleep": r["sleep"]}
        for r in rows
    ]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "participation_rate": participation_rate,
        "drift_alerts": drift_alerts,
        "daily_trends": daily_trends,
    }
