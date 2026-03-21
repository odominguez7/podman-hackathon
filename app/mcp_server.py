"""YU Shield MCP Server — exposes wellness tools via FastMCP."""

from datetime import datetime
from fastmcp import FastMCP

from app.database import (
    init_db,
    get_user,
    get_baseline,
    get_checkins,
    detect_drift,
    get_dashboard_aggregates,
    add_checkin,
)
from app.shield import generate_checkin_response

mcp = FastMCP("YU Shield Wellbeing Tools")

# Activity catalogs used by recommendations
CALMING_ACTIVITIES = [
    {"name": "Restorative Yoga", "provider": "Down Under Yoga", "duration": "45 min"},
    {"name": "Guided Meditation", "provider": "Wellness Room", "duration": "20 min"},
    {"name": "Box Breathing", "provider": "Anywhere", "duration": "10 min"},
    {"name": "Mindful Nature Walk", "provider": "Charles River", "duration": "30 min"},
    {"name": "Sound Bath", "provider": "Harmony Studio", "duration": "40 min"},
]

ENERGIZING_ACTIVITIES = [
    {"name": "HIIT Express", "provider": "FitHub", "duration": "25 min"},
    {"name": "Power Vinyasa", "provider": "Down Under Yoga", "duration": "50 min"},
    {"name": "Morning Run Club", "provider": "Esplanade", "duration": "35 min"},
    {"name": "Spin Class", "provider": "FitHub", "duration": "40 min"},
]

RECOVERY_ACTIVITIES = [
    {"name": "Deep Stretch Class", "provider": "FitHub", "duration": "40 min"},
    {"name": "Chair Massage", "provider": "Floor 2", "duration": "15 min"},
    {"name": "Yin Yoga", "provider": "Down Under Yoga", "duration": "60 min"},
    {"name": "Self-Massage & Foam Rolling", "provider": "Anywhere", "duration": "20 min"},
]

FOCUS_ACTIVITIES = [
    {"name": "Focus Flow Yoga", "provider": "Down Under Yoga", "duration": "30 min"},
    {"name": "Cold Plunge + Sauna", "provider": "FitHub", "duration": "20 min"},
    {"name": "Guided Journaling", "provider": "Anywhere", "duration": "15 min"},
]

ALL_ACTIVITIES = {a["name"]: a for a in CALMING_ACTIVITIES + ENERGIZING_ACTIVITIES + RECOVERY_ACTIVITIES + FOCUS_ACTIVITIES}


@mcp.tool()
def check_my_wellness(user_id: str) -> dict:
    """Employee self-service: check your own wellness status including baseline, trends, and drift detection. Only accessible by the authenticated user — no employer access."""
    user = get_user(user_id)
    if not user:
        return {"error": f"User '{user_id}' not found"}

    baseline = get_baseline(user_id)
    checkins = get_checkins(user_id, days=14)
    drift = detect_drift(user_id)

    recent_checkins = [
        {
            "date": c["created_at"],
            "mood": c["mood"],
            "energy": c["energy"],
            "sleep": c["sleep"],
            "note": c.get("note", ""),
        }
        for c in checkins[-5:]
    ]

    report = {
        "user_id": user_id,
        "first_name": user["first_name"],
        "total_checkins_14d": len(checkins),
        "recent_checkins": recent_checkins,
        "baseline": baseline,
        "drift_status": "alert" if drift and drift.get("alerts") else "stable",
    }

    if drift and drift.get("alerts"):
        report["drift_details"] = drift

    return report


@mcp.tool()
def get_team_wellness_summary() -> dict:
    """Get anonymized team-wide wellness aggregates including participation rate, drift alerts, and daily trends."""
    return get_dashboard_aggregates()


@mcp.tool()
def book_wellness_activity(user_id: str, activity: str) -> dict:
    """Book a wellness activity for an employee. Returns a mock booking confirmation."""
    user = get_user(user_id)
    if not user:
        return {"error": f"User '{user_id}' not found"}

    activity_info = ALL_ACTIVITIES.get(activity)
    if not activity_info:
        return {
            "error": f"Activity '{activity}' not found",
            "available_activities": list(ALL_ACTIVITIES.keys()),
        }

    booking_time = datetime.now().replace(hour=12, minute=0, second=0, microsecond=0)

    return {
        "status": "confirmed",
        "booking_id": f"YU-{user_id[:4].upper()}-{int(datetime.now().timestamp()) % 100000}",
        "user_id": user_id,
        "activity": activity_info["name"],
        "provider": activity_info["provider"],
        "duration": activity_info["duration"],
        "scheduled_time": booking_time.strftime("%Y-%m-%d %H:%M"),
        "location": activity_info["provider"],
        "message": f"You're booked for {activity_info['name']} at {activity_info['provider']} ({activity_info['duration']}). See you there!",
    }


@mcp.tool()
def get_wellness_recommendations(mood: int, energy: int, sleep: int) -> list:
    """Get personalized wellness activity recommendations based on current mood, energy, and sleep scores (each 1-5)."""
    recommendations = []

    if mood <= 2:
        recommendations.extend(CALMING_ACTIVITIES[:3])
    elif mood == 3:
        recommendations.append(CALMING_ACTIVITIES[3])  # nature walk

    if energy >= 4 and mood >= 3:
        recommendations.extend(ENERGIZING_ACTIVITIES[:2])
    elif energy <= 2:
        recommendations.extend(RECOVERY_ACTIVITIES[:2])

    if sleep <= 2:
        recommendations.extend(RECOVERY_ACTIVITIES[2:])  # yin yoga, foam rolling

    # Focus activities for balanced but not great state
    if 3 <= mood <= 4 and 3 <= energy <= 4 and sleep >= 3:
        recommendations.extend(FOCUS_ACTIVITIES[:2])

    # If nothing matched, give general suggestions
    if not recommendations:
        recommendations = [FOCUS_ACTIVITIES[0], ENERGIZING_ACTIVITIES[2], CALMING_ACTIVITIES[3]]

    # Deduplicate by name
    seen = set()
    unique = []
    for r in recommendations:
        if r["name"] not in seen:
            seen.add(r["name"])
            unique.append(r)

    return unique


@mcp.tool()
def submit_checkin(user_id: str, mood: int, energy: int, sleep: int, note: str = "") -> dict:
    """Submit a daily wellness check-in for an employee and receive an AI-generated coaching response."""
    user = get_user(user_id)
    if not user:
        return {"error": f"User '{user_id}' not found"}

    add_checkin(user_id, mood, energy, sleep, note or None)

    baseline = get_baseline(user_id)
    drift = detect_drift(user_id)

    checkin_data = {"mood": mood, "energy": energy, "sleep": sleep, "note": note}

    try:
        ai_response = generate_checkin_response(
            first_name=user["first_name"],
            checkin=checkin_data,
            baseline=baseline,
            drift=drift,
        )
    except Exception:
        ai_response = f"Check-in recorded! Mood: {mood}, Energy: {energy}, Sleep: {sleep}."

    return {
        "status": "recorded",
        "user_id": user_id,
        "checkin": checkin_data,
        "baseline": baseline,
        "drift_detected": bool(drift and drift.get("alerts")),
        "ai_response": ai_response,
    }


if __name__ == "__main__":
    init_db()
    mcp.run()
