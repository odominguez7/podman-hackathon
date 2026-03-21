"""Seed demo data for YU Shield. Run with: python -m app.seed_demo"""

import random
from datetime import datetime, timedelta
from app.database import init_db, get_db

DEMO_USERS = [
    {"id": "sarah-demo", "name": "Sarah"},
    {"id": "james-demo", "name": "James"},
    {"id": "maria-demo", "name": "Maria"},
    {"id": "alex-demo", "name": "Alex"},
]

NOTES_POOL = {
    "good": ["slept great", "morning run felt amazing", "team lunch was fun", "productive day", "feeling grateful today"],
    "mid": ["okay day overall", "bit tired but managing", "average day", "nothing special", None, None],
    "bad": ["deadline stress", "couldn't sleep well", "feeling overwhelmed", "rough day", "too many meetings"],
    "improving": ["starting to feel better", "good therapy session", "went for a walk", "journaled this morning", "slept through the night"],
}


def _pick_note(category: str) -> str | None:
    return random.choice(NOTES_POOL[category])


def _generate_sarah() -> list[dict]:
    """Starts good, declines last 4 days — triggers drift."""
    rows = []
    for day in range(14):
        if day < 10:
            rows.append({"mood": random.randint(4, 5), "energy": random.randint(4, 5), "sleep": random.randint(4, 5), "note": _pick_note("good")})
        else:
            rows.append({"mood": random.randint(2, 3), "energy": 2, "sleep": 2, "note": _pick_note("bad")})
    return rows


def _generate_james() -> list[dict]:
    """Consistently average — stable baseline."""
    rows = []
    for _ in range(14):
        rows.append({"mood": random.randint(3, 4), "energy": random.randint(3, 4), "sleep": random.randint(3, 4), "note": _pick_note("mid")})
    return rows


def _generate_maria() -> list[dict]:
    """Improving trend — starts low, ends high."""
    rows = []
    for day in range(14):
        if day < 5:
            rows.append({"mood": random.randint(2, 3), "energy": random.randint(2, 3), "sleep": random.randint(2, 3), "note": _pick_note("bad")})
        elif day < 10:
            rows.append({"mood": random.randint(3, 4), "energy": random.randint(3, 4), "sleep": random.randint(3, 4), "note": _pick_note("improving")})
        else:
            rows.append({"mood": random.randint(4, 5), "energy": random.randint(4, 5), "sleep": random.randint(4, 5), "note": _pick_note("good")})
    return rows


def _generate_alex() -> list[dict]:
    """Only 5 check-ins — not enough for baseline."""
    rows = []
    for _ in range(5):
        rows.append({"mood": random.randint(3, 4), "energy": random.randint(3, 5), "sleep": random.randint(3, 4), "note": _pick_note("mid")})
    return rows


GENERATORS = {
    "sarah-demo": _generate_sarah,
    "james-demo": _generate_james,
    "maria-demo": _generate_maria,
    "alex-demo": _generate_alex,
}


def seed_demo_data():
    """Clear old demo data and insert fresh demo check-ins with backdated timestamps."""
    init_db()
    conn = get_db()

    # Clear previous demo data
    demo_ids = [u["id"] for u in DEMO_USERS]
    for uid in demo_ids:
        conn.execute("DELETE FROM checkins WHERE user_id = ?", (uid,))
        conn.execute("DELETE FROM users WHERE id = ?", (uid,))
    conn.commit()

    # Create users and checkins using single connection
    now = datetime.now()
    for user in DEMO_USERS:
        conn.execute(
            "INSERT OR IGNORE INTO users (id, first_name) VALUES (?, ?)",
            (user["id"], user["name"]),
        )
        checkins = GENERATORS[user["id"]]()
        total_days = len(checkins)
        for i, c in enumerate(checkins):
            ts = (now - timedelta(days=total_days - 1 - i, hours=random.randint(7, 10), minutes=random.randint(0, 59))).isoformat()
            conn.execute(
                "INSERT INTO checkins (user_id, mood, energy, sleep, note, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user["id"], c["mood"], c["energy"], c["sleep"], c["note"], ts),
            )
    conn.commit()
    conn.close()
    print(f"Seeded {len(DEMO_USERS)} demo users with check-in data.")


if __name__ == "__main__":
    seed_demo_data()
