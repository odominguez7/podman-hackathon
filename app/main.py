import os
import time
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.database import init_db, create_user, get_user, add_checkin, get_checkins, get_baseline, detect_drift, get_dashboard_aggregates, get_team_members, get_department_stats
from app.shield import generate_checkin_response, generate_insight, DEMO_MODE, _mock_xray_responses
from app.seed_demo import seed_demo_data

app = FastAPI(title="YU Shield", description="AI Wellness Companion for Employees")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    if DEMO_MODE:
        seed_demo_data()


# --- Models ---

class UserCreate(BaseModel):
    user_id: str
    first_name: str


class CheckIn(BaseModel):
    user_id: str
    mood: int = Field(ge=1, le=5)
    energy: int = Field(ge=1, le=5)
    sleep: int = Field(ge=1, le=5)
    note: str = None
    provider: str = "ramalama"


# --- API ---

@app.post("/api/users")
def register_user(data: UserCreate):
    create_user(data.user_id, data.first_name)
    return {"status": "ok", "user_id": data.user_id}


@app.post("/api/checkin")
def do_checkin(data: CheckIn):
    user = get_user(data.user_id)
    if not user:
        return {"error": "User not found. Register first."}

    add_checkin(data.user_id, data.mood, data.energy, data.sleep, data.note)

    baseline = get_baseline(data.user_id)
    drift = detect_drift(data.user_id)

    # In demo mode, always show a populated baseline so the UI never shows "Limited data"
    if DEMO_MODE and not baseline:
        baseline = {"mood": 3.8, "energy": 3.5, "sleep": 3.6, "data_points": 14}
    if DEMO_MODE and (not drift or not drift.get("alerts")) and (data.mood <= 2 or data.energy <= 2 or data.sleep <= 2):
        drift = {"alerts": [{"metric": "mood" if data.mood <= 2 else ("energy" if data.energy <= 2 else "sleep"), "baseline": 3.8, "recent": round((data.mood + data.energy + data.sleep) / 3, 1)}]}

    try:
        response = generate_checkin_response(
            first_name=user["first_name"],
            checkin={"mood": data.mood, "energy": data.energy, "sleep": data.sleep, "note": data.note},
            baseline=baseline,
            drift=drift,
            provider=data.provider,
        )
        print(f"[CHECKIN DEBUG] user={data.user_id} response_len={len(response) if response else 0} response_preview={repr(response[:80]) if response else 'NONE'}")
    except Exception as e:
        print(f"[CHECKIN DEBUG] EXCEPTION: {e}")
        response = f"I heard you. Mood {data.mood}/5, energy {data.energy}/5, sleep {data.sleep}/5. The AI engine is warming up, but your check-in was recorded. Check back shortly."

    final_response = response or f"I heard you. Mood {data.mood}/5, energy {data.energy}/5, sleep {data.sleep}/5. Your check-in was recorded."
    print(f"[CHECKIN DEBUG] final_response_len={len(final_response)}")

    return {
        "status": "ok",
        "response": final_response,
        "baseline": baseline,
        "drift": drift,
    }


@app.post("/api/checkin/compare")
def do_checkin_compare(data: CheckIn):
    """X-Ray Mode: run the same check-in through both providers and compare."""
    user = get_user(data.user_id)
    if not user:
        return {"error": "User not found. Register first."}

    add_checkin(data.user_id, data.mood, data.energy, data.sleep, data.note)

    baseline = get_baseline(data.user_id)
    drift = detect_drift(data.user_id)

    # In demo mode, always show a populated baseline so the UI never shows "Limited data"
    if DEMO_MODE and not baseline:
        baseline = {"mood": 3.8, "energy": 3.5, "sleep": 3.6, "data_points": 14}
    if DEMO_MODE and (not drift or not drift.get("alerts")) and (data.mood <= 2 or data.energy <= 2 or data.sleep <= 2):
        drift = {"alerts": [{"metric": "mood" if data.mood <= 2 else ("energy" if data.energy <= 2 else "sleep"), "baseline": 3.8, "recent": round((data.mood + data.energy + data.sleep) / 3, 1)}]}

    checkin_dict = {"mood": data.mood, "energy": data.energy, "sleep": data.sleep, "note": data.note}

    if DEMO_MODE:
        mock = _mock_xray_responses(user["first_name"], data.mood, data.energy, data.sleep, data.note)
        return {
            "status": "ok",
            "local": {"response": mock["local"], "time_ms": mock["local_ms"], "provider": "ramalama", "model": "Granite 3.3 8B (Local)"},
            "cloud": {"response": mock["cloud"], "time_ms": mock["cloud_ms"], "provider": "claude", "model": "Claude Sonnet (Cloud)"},
            "baseline": baseline,
            "drift": drift,
        }

    # --- Local (RamaLama) ---
    try:
        t0 = time.perf_counter()
        local_response = generate_checkin_response(
            first_name=user["first_name"],
            checkin=checkin_dict,
            baseline=baseline,
            drift=drift,
            provider="ramalama",
        )
        local_ms = round((time.perf_counter() - t0) * 1000)
        local_result = {"response": local_response, "time_ms": local_ms, "provider": "ramalama", "model": "Granite 3.3 8B"}
    except Exception:
        local_result = {"response": "Provider unavailable", "time_ms": 0, "provider": "ramalama", "model": "Granite 3.3 8B", "error": True}

    # --- Cloud (Claude) ---
    try:
        t0 = time.perf_counter()
        cloud_response = generate_checkin_response(
            first_name=user["first_name"],
            checkin=checkin_dict,
            baseline=baseline,
            drift=drift,
            provider="claude",
        )
        cloud_ms = round((time.perf_counter() - t0) * 1000)
        cloud_result = {"response": cloud_response, "time_ms": cloud_ms, "provider": "claude", "model": "Claude Sonnet"}
    except Exception:
        cloud_result = {"response": "Provider unavailable", "time_ms": 0, "provider": "claude", "model": "Claude Sonnet", "error": True}

    return {
        "status": "ok",
        "local": local_result,
        "cloud": cloud_result,
        "baseline": baseline,
        "drift": drift,
    }


@app.get("/api/insights/{user_id}")
def get_insights(user_id: str, provider: str = "ramalama"):
    user = get_user(user_id)
    if not user:
        return {"error": "User not found."}

    checkins = get_checkins(user_id)
    baseline = get_baseline(user_id)
    drift = detect_drift(user_id)

    # In demo mode, always show a populated baseline
    if DEMO_MODE and not baseline:
        baseline = {"mood": 3.8, "energy": 3.5, "sleep": 3.6, "data_points": 14}

    insight = generate_insight(
        first_name=user["first_name"],
        checkins=checkins,
        baseline=baseline,
        drift=drift,
        provider=provider,
    )

    return {
        "insight": insight,
        "baseline": baseline,
        "drift": drift,
        "total_checkins": len(checkins),
    }


@app.get("/api/history/{user_id}")
def get_history(user_id: str):
    user = get_user(user_id)
    if not user:
        return {"error": "User not found."}

    checkins = get_checkins(user_id)
    baseline = get_baseline(user_id)

    # In demo mode, always show a populated baseline
    if DEMO_MODE and not baseline:
        baseline = {"mood": 3.8, "energy": 3.5, "sleep": 3.6, "data_points": 14}

    return {
        "checkins": checkins,
        "baseline": baseline,
        "total": len(checkins),
    }


@app.get("/api/dashboard")
def dashboard():
    return get_dashboard_aggregates()


@app.get("/api/dashboard/team")
def dashboard_team():
    return get_team_members()


@app.get("/api/dashboard/departments")
def dashboard_departments():
    return get_department_stats()


class RecommendationsRequest(BaseModel):
    mood: int = Field(ge=1, le=5)
    energy: int = Field(ge=1, le=5)
    sleep: int = Field(ge=1, le=5)


class BookingRequest(BaseModel):
    user_id: str
    activity: str


@app.post("/api/mcp/recommendations")
def mcp_recommendations(data: RecommendationsRequest):
    """MCP Tool: get activity recommendations based on wellness scores."""
    from app.mcp_server import get_wellness_recommendations
    return get_wellness_recommendations(data.mood, data.energy, data.sleep)


@app.post("/api/mcp/book")
def mcp_book(data: BookingRequest):
    """MCP Tool: book a wellness activity for a user."""
    from app.mcp_server import book_wellness_activity
    return book_wellness_activity(data.user_id, data.activity)


@app.post("/api/seed-demo")
def api_seed_demo():
    seed_demo_data()
    return {"status": "ok", "message": "Demo data loaded"}


# --- Frontend ---

STATIC_DIR = Path("static")

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html", headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"})
