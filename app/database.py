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
            department TEXT,
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

    # Migration: add department column if it doesn't exist
    columns = [row[1] for row in conn.execute("PRAGMA table_info(users)").fetchall()]
    if "department" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN department TEXT")

    conn.commit()
    conn.close()


def create_user(user_id: str, first_name: str, department: str = None):
    conn = get_db()
    conn.execute(
        "INSERT OR IGNORE INTO users (id, first_name, department) VALUES (?, ?, ?)",
        (user_id, first_name, department),
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
    users = conn.execute("SELECT id, first_name, department, created_at FROM users").fetchall()
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
            "department": u["department"],
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


# --- Department-level org mapping ---
DEPARTMENT_HEADCOUNTS = {
    "Engineering": 220,
    "Product & Design": 70,
    "Sales & Partnerships": 90,
    "Marketing & Growth": 60,
    "Customer Success": 80,
    "Finance & Legal": 40,
    "People & Workplace": 40,
    "Data & Analytics": 20,
    "Strategy & CEO Office": 10,
}


def get_department_stats() -> list[dict]:
    """Return per-department aggregated wellness stats for the enterprise dashboard."""
    conn = get_db()
    cutoff_14d = (datetime.now() - timedelta(days=14)).isoformat()
    cutoff_7d_recent = (datetime.now() - timedelta(days=3)).isoformat()
    cutoff_7d_prior = (datetime.now() - timedelta(days=10)).isoformat()

    # Get all users grouped by department
    users = conn.execute("SELECT id, department FROM users WHERE department IS NOT NULL").fetchall()
    conn.close()

    dept_users: dict[str, list[str]] = {}
    for u in users:
        dept = u["department"]
        if dept not in dept_users:
            dept_users[dept] = []
        dept_users[dept].append(u["id"])

    results = []
    for dept, total_heads in DEPARTMENT_HEADCOUNTS.items():
        user_ids = dept_users.get(dept, [])
        seed_count = len(user_ids)

        if seed_count == 0:
            results.append({
                "department": dept,
                "total_heads": total_heads,
                "seed_users": 0,
                "active_users": 0,
                "avg_mood": None,
                "avg_energy": None,
                "avg_sleep": None,
                "drift_alerts": 0,
                "participation_rate": 0.0,
                "trend": "stable",
            })
            continue

        conn = get_db()
        placeholders = ",".join("?" for _ in user_ids)

        # Active users (at least 1 checkin in last 14 days)
        active = conn.execute(
            f"SELECT COUNT(DISTINCT user_id) FROM checkins WHERE user_id IN ({placeholders}) AND created_at >= ?",
            (*user_ids, cutoff_14d),
        ).fetchone()[0]

        # Averages over last 14 days
        avgs = conn.execute(
            f"""SELECT ROUND(AVG(mood), 1) as mood, ROUND(AVG(energy), 1) as energy, ROUND(AVG(sleep), 1) as sleep
                FROM checkins WHERE user_id IN ({placeholders}) AND created_at >= ?""",
            (*user_ids, cutoff_14d),
        ).fetchone()

        # Trend: compare recent 3 days vs prior 7 days
        recent_avg = conn.execute(
            f"SELECT AVG(mood) as mood FROM checkins WHERE user_id IN ({placeholders}) AND created_at >= ?",
            (*user_ids, cutoff_7d_recent),
        ).fetchone()

        prior_avg = conn.execute(
            f"SELECT AVG(mood) as mood FROM checkins WHERE user_id IN ({placeholders}) AND created_at >= ? AND created_at < ?",
            (*user_ids, cutoff_7d_prior, cutoff_7d_recent),
        ).fetchone()

        conn.close()

        # Determine trend
        trend = "stable"
        if recent_avg["mood"] is not None and prior_avg["mood"] is not None:
            diff = recent_avg["mood"] - prior_avg["mood"]
            if diff < -0.3:
                trend = "declining"
            elif diff > 0.3:
                trend = "improving"

        # Count drift alerts
        drift_count = 0
        for uid in user_ids:
            if detect_drift(uid) is not None:
                drift_count += 1

        participation = round(active / seed_count, 2) if seed_count > 0 else 0.0

        results.append({
            "department": dept,
            "total_heads": total_heads,
            "seed_users": seed_count,
            "active_users": active,
            "avg_mood": avgs["mood"],
            "avg_energy": avgs["energy"],
            "avg_sleep": avgs["sleep"],
            "drift_alerts": drift_count,
            "participation_rate": participation,
            "trend": trend,
        })

    return sorted(results, key=lambda d: d["drift_alerts"], reverse=True)
