import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.database import init_db, create_user, get_user, add_checkin, get_checkins, get_baseline, detect_drift
from app.shield import generate_checkin_response, generate_insight

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

    response = generate_checkin_response(
        first_name=user["first_name"],
        checkin={"mood": data.mood, "energy": data.energy, "sleep": data.sleep, "note": data.note},
        baseline=baseline,
        drift=drift,
        provider=data.provider,
    )

    return {
        "status": "ok",
        "response": response,
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

    return {
        "checkins": checkins,
        "baseline": baseline,
        "total": len(checkins),
    }


# --- Frontend ---

STATIC_DIR = Path("static")

if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
