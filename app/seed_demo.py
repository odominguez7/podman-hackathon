"""Seed enterprise demo data for YU Shield. Run with: python -m app.seed_demo"""

import random
from datetime import datetime, timedelta
from app.database import init_db, get_db

# Meridian AI — 530-person AI startup, Boston
# 9 departments, ~50 representative seed users

DEPARTMENTS = [
    {
        "name": "Engineering",
        "short": "eng",
        "total_heads": 220,
        "users": [
            "Anika", "Ben", "Camila", "Derek", "Elena", "Farid",
            "Grace", "Hiroshi", "Isha", "Jordan", "Kai", "Lucia",
        ],
        "pattern": "engineering",
    },
    {
        "name": "Product & Design",
        "short": "prod",
        "total_heads": 70,
        "users": ["Maya", "Noah", "Priya", "Theo"],
        "pattern": "stable",
    },
    {
        "name": "Sales & Partnerships",
        "short": "sales",
        "total_heads": 90,
        "users": ["Olivia", "Rashid", "Serena", "Tyler", "Uma"],
        "pattern": "sales",
    },
    {
        "name": "Marketing & Growth",
        "short": "mktg",
        "total_heads": 60,
        "users": ["Violet", "Wesley", "Xiomara"],
        "pattern": "stable",
    },
    {
        "name": "Customer Success",
        "short": "cs",
        "total_heads": 80,
        "users": ["Yara", "Zane", "Aiden", "Bianca", "Carmen"],
        "pattern": "cs_fatigue",
    },
    {
        "name": "Finance & Legal",
        "short": "fin",
        "total_heads": 40,
        "users": ["Diana", "Ethan", "Fiona"],
        "pattern": "stable",
    },
    {
        "name": "People & Workplace",
        "short": "ppl",
        "total_heads": 40,
        "users": ["Gabriela", "Hassan", "Ivy"],
        "pattern": "hr_steady",
    },
    {
        "name": "Data & Analytics",
        "short": "data",
        "total_heads": 20,
        "users": ["Jasper", "Kira"],
        "pattern": "stable",
    },
    {
        "name": "Strategy & CEO Office",
        "short": "strat",
        "total_heads": 10,
        "users": ["Leo"],
        "pattern": "strategy",
    },
]

NOTES_POOL = {
    "good": ["slept great", "morning run felt amazing", "team lunch was fun", "productive day", "feeling grateful today", "great standup energy", "shipped a big feature"],
    "mid": ["okay day overall", "bit tired but managing", "average day", "nothing special", None, None, "meetings dragged a bit"],
    "bad": ["deadline stress", "couldn't sleep well", "feeling overwhelmed", "rough day", "too many meetings", "on-call was brutal", "sprint pressure"],
    "improving": ["starting to feel better", "good therapy session", "went for a walk", "journaled this morning", "slept through the night"],
    "sales_high": ["big deal closing this week", "pipeline looking strong", "great customer call", "hit my quota early"],
    "sales_low": ["lost a deal", "quota pressure", "tough rejection", "travel burnout"],
    "cs_drain": ["difficult escalation", "emotional customer call", "feeling drained from tickets", "need a break from support"],
}


def _pick_note(category: str) -> str | None:
    return random.choice(NOTES_POOL.get(category, NOTES_POOL["mid"]))


# --- Pattern generators: each returns 14 days of checkin dicts ---

def _gen_engineering_burnout() -> list[dict]:
    """High energy early, declining sleep and energy — burnout arc."""
    rows = []
    for day in range(14):
        if day < 7:
            rows.append({"mood": random.randint(4, 5), "energy": random.randint(4, 5), "sleep": random.randint(3, 5), "note": _pick_note("good")})
        elif day < 11:
            rows.append({"mood": random.randint(3, 4), "energy": random.randint(2, 3), "sleep": random.randint(2, 3), "note": _pick_note("bad")})
        else:
            rows.append({"mood": random.randint(2, 3), "energy": random.randint(1, 2), "sleep": random.randint(2, 3), "note": _pick_note("bad")})
    return rows


def _gen_engineering_stable() -> list[dict]:
    """Solid, consistent — no drift."""
    return [{"mood": random.randint(3, 5), "energy": random.randint(3, 4), "sleep": random.randint(3, 5), "note": _pick_note("mid")} for _ in range(14)]


def _gen_engineering_improving() -> list[dict]:
    """Starts rough, recovers."""
    rows = []
    for day in range(14):
        if day < 5:
            rows.append({"mood": random.randint(2, 3), "energy": random.randint(2, 3), "sleep": random.randint(2, 3), "note": _pick_note("bad")})
        else:
            rows.append({"mood": random.randint(4, 5), "energy": random.randint(3, 5), "sleep": random.randint(4, 5), "note": _pick_note("improving")})
    return rows


def _gen_sales() -> list[dict]:
    """High mood variance, energy spikes toward end (quarter-end)."""
    rows = []
    for day in range(14):
        if day >= 10:  # quarter-end push
            rows.append({"mood": random.choice([2, 3, 5, 5]), "energy": random.randint(4, 5), "sleep": random.randint(2, 4), "note": _pick_note("sales_high")})
        else:
            mood = random.choice([2, 3, 4, 5])
            rows.append({"mood": mood, "energy": random.randint(3, 4), "sleep": random.randint(3, 4), "note": _pick_note("sales_low" if mood <= 3 else "sales_high")})
    return rows


def _gen_cs_fatigue() -> list[dict]:
    """Steady start, compassion fatigue in the last 4 days."""
    rows = []
    for day in range(14):
        if day < 10:
            rows.append({"mood": random.randint(3, 4), "energy": random.randint(3, 4), "sleep": random.randint(3, 5), "note": _pick_note("mid")})
        else:
            rows.append({"mood": random.randint(2, 3), "energy": random.randint(2, 3), "sleep": random.randint(3, 4), "note": _pick_note("cs_drain")})
    return rows


def _gen_cs_stable() -> list[dict]:
    return [{"mood": random.randint(3, 4), "energy": random.randint(3, 4), "sleep": random.randint(3, 4), "note": _pick_note("mid")} for _ in range(14)]


def _gen_hr_steady() -> list[dict]:
    """People team — generally stable, they know the wellness tools."""
    return [{"mood": random.randint(4, 5), "energy": random.randint(3, 5), "sleep": random.randint(4, 5), "note": _pick_note("good")} for _ in range(14)]


def _gen_strategy() -> list[dict]:
    """High energy, moderate sleep."""
    return [{"mood": random.randint(3, 5), "energy": random.randint(4, 5), "sleep": random.randint(3, 4), "note": _pick_note("mid")} for _ in range(14)]


def _gen_stable() -> list[dict]:
    return [{"mood": random.randint(3, 5), "energy": random.randint(3, 4), "sleep": random.randint(3, 5), "note": _pick_note("mid")} for _ in range(14)]


def _gen_stable_declining() -> list[dict]:
    """Looks stable but slight downward tick at the end."""
    rows = []
    for day in range(14):
        if day < 10:
            rows.append({"mood": random.randint(4, 5), "energy": random.randint(4, 5), "sleep": random.randint(4, 5), "note": _pick_note("good")})
        else:
            rows.append({"mood": random.randint(2, 3), "energy": random.randint(2, 3), "sleep": random.randint(2, 3), "note": _pick_note("bad")})
    return rows


# Map department pattern -> list of generators to rotate through
PATTERN_GENERATORS = {
    "engineering": [_gen_engineering_burnout, _gen_engineering_stable, _gen_engineering_stable, _gen_engineering_improving, _gen_engineering_stable, _gen_engineering_burnout, _gen_engineering_stable, _gen_engineering_stable, _gen_engineering_improving, _gen_stable_declining, _gen_engineering_stable, _gen_engineering_stable],
    "sales": [_gen_sales, _gen_sales, _gen_stable, _gen_sales, _gen_stable_declining],
    "cs_fatigue": [_gen_cs_fatigue, _gen_cs_stable, _gen_cs_fatigue, _gen_cs_stable, _gen_cs_stable],
    "hr_steady": [_gen_hr_steady, _gen_hr_steady, _gen_hr_steady],
    "strategy": [_gen_strategy],
    "stable": [_gen_stable, _gen_stable, _gen_stable_declining],
}


def seed_demo_data():
    """Clear old data and insert Meridian AI enterprise demo data."""
    init_db()
    conn = get_db()

    # Clear all existing data for clean enterprise seed
    conn.execute("DELETE FROM checkins")
    conn.execute("DELETE FROM users")
    conn.commit()

    now = datetime.now()
    total_seeded = 0

    for dept in DEPARTMENTS:
        generators = PATTERN_GENERATORS[dept["pattern"]]
        for idx, first_name in enumerate(dept["users"]):
            user_id = f"meridian_{dept['short']}_{first_name.lower()}"
            conn.execute(
                "INSERT OR IGNORE INTO users (id, first_name, department) VALUES (?, ?, ?)",
                (user_id, first_name, dept["name"]),
            )

            gen_fn = generators[idx % len(generators)]
            checkins = gen_fn()
            total_days = len(checkins)
            for i, c in enumerate(checkins):
                ts = (now - timedelta(days=total_days - 1 - i, hours=random.randint(7, 10), minutes=random.randint(0, 59))).isoformat()
                conn.execute(
                    "INSERT INTO checkins (user_id, mood, energy, sleep, note, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, c["mood"], c["energy"], c["sleep"], c["note"], ts),
                )
            total_seeded += 1

    conn.commit()
    conn.close()
    print(f"Seeded {total_seeded} Meridian AI users across {len(DEPARTMENTS)} departments with 14 days of check-in data.")


if __name__ == "__main__":
    seed_demo_data()
