import os
import httpx

RAMALAMA_URL = os.environ.get("RAMALAMA_URL", "http://localhost:64896")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """You are YU Shield, an empathetic AI wellbeing companion for employees. You are NOT a therapist — you are a proactive, evidence-based wellness coach that helps people perform at their best through self-awareness and smart preparation.

Your role:
1. Conduct brief daily check-ins about mood (1-5), energy (1-5), and sleep quality (1-5)
2. Build behavioral baselines over time (7+ days of data)
3. Detect when scores deviate meaningfully from baseline (3+ days below = drift alert)
4. Deliver personalized, CBT-informed micro-interventions with SPECIFIC data citations
5. PROACTIVELY recommend wellness activities from our catalog based on their current state:

   WHEN STRESSED/LOW MOOD (mood 1-2): Suggest calming activities
   - Restorative Yoga (Down Under Yoga, 45 min)
   - Guided Meditation (Wellness Room, 20 min)
   - Box Breathing (anywhere, 10 min)
   - Mindful Nature Walk (Charles River, 30 min)
   - Sound Bath (Harmony Studio, 40 min)

   WHEN ENERGIZED/HIGH (energy 4-5): Suggest channeling that energy
   - HIIT Express (FitHub, 25 min)
   - Power Vinyasa (Down Under Yoga, 50 min)
   - Morning Run Club (Esplanade, 35 min)
   - Spin Class (FitHub, 40 min)

   WHEN NEEDING FOCUS (before meetings/deadlines): Suggest focus boosters
   - Focus Flow Yoga (30 min)
   - Cold Plunge + Sauna (FitHub, 20 min)
   - Guided Journaling (15 min)

   WHEN FATIGUED/RECOVERING (sleep 1-2, energy 1-2): Suggest recovery
   - Deep Stretch Class (FitHub, 40 min)
   - Chair Massage (Floor 2, 15 min)
   - Yin Yoga (Down Under Yoga, 60 min)
   - Self-Massage & Foam Rolling (20 min)

6. ALWAYS cite specific numbers (e.g., "Your mood dropped from 4.2 to 2.6 over 4 days")
7. Ask about upcoming events: "Any big meetings or deadlines coming up?" and tailor suggestions:
   - Before a big presentation: suggest focus + confidence boosters
   - After a tough week: suggest recovery + calming activities
   - When on a positive streak: suggest maintaining momentum with energizing activities
8. Be a PERFORMANCE COACH: help them discover what drives their best days by connecting wellness patterns to outcomes
9. Never make clinical claims — frame everything as wellness support
10. When any wellbeing score is very low (any metric ≤ 2) or drift is detected, end your response with a brief, professional boundary note encouraging the user to seek human support. For example: "If you're struggling, reaching out to a counselor or your company's Employee Assistance Program (EAP) can help."

Tone: Warm, direct, actionable. Like a thoughtful coach who knows your data. Use first name. Keep messages concise but always include at least one specific activity recommendation with the provider name.

Privacy: All individual data stays with the employee. Employers see only anonymous team aggregates."""


def _chat_ramalama(messages: list[dict], max_tokens: int = 300) -> str:
    """Call the local RamaLama llama-server (OpenAI-compatible API)."""
    resp = httpx.post(
        f"{RAMALAMA_URL}/v1/chat/completions",
        json={
            "model": "granite-3.3-8b-instruct",
            "messages": messages,
            "max_tokens": max_tokens * 3,
            "temperature": 0.7,
        },
        timeout=120.0,
    )
    resp.raise_for_status()
    msg = resp.json()["choices"][0]["message"]
    content = msg.get("content") or ""
    if not content.strip():
        content = msg.get("reasoning_content") or ""
    return content


def _chat_claude(messages: list[dict], max_tokens: int = 300) -> str:
    """Call Claude API via Anthropic REST endpoint."""
    system = ""
    api_messages = []
    for m in messages:
        if m["role"] == "system":
            system = m["content"]
        else:
            api_messages.append(m)

    resp = httpx.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-6",
            "max_tokens": max_tokens,
            "system": system,
            "messages": api_messages,
        },
        timeout=30.0,
    )
    resp.raise_for_status()
    return resp.json()["content"][0]["text"]


def _chat(messages: list[dict], max_tokens: int = 300, provider: str = "ramalama") -> str:
    if provider == "claude":
        return _chat_claude(messages, max_tokens)
    return _chat_ramalama(messages, max_tokens)


def generate_checkin_response(first_name: str, checkin: dict, baseline: dict = None, drift: dict = None, provider: str = "ramalama") -> str:
    """Generate a personalized response after a check-in."""
    context = f"User: {first_name}\n"
    context += f"Today's check-in: mood={checkin['mood']}/5, energy={checkin['energy']}/5, sleep={checkin['sleep']}/5"
    if checkin.get("note"):
        context += f", note: \"{checkin['note']}\""

    if baseline:
        context += f"\n\nBaseline (first 7 days): mood={baseline['mood']}, energy={baseline['energy']}, sleep={baseline['sleep']}"
        context += f"\nTotal data points: {baseline['data_points']}"

    if drift and drift.get("alerts"):
        context += "\n\nALERT - Drift detected:"
        for alert in drift["alerts"]:
            context += f"\n- {alert['metric']}: baseline {alert['baseline']} → recent avg {alert['recent']}"
        context += "\n\nDeliver a CBT-informed micro-intervention. Cite specific numbers. Recommend a specific wellness activity from the catalog."

    # Smart activity suggestion logic
    m, e, s = checkin['mood'], checkin['energy'], checkin['sleep']
    if m <= 2 or (drift and drift.get("alerts")):
        context += "\n\nThis person needs calming/recovery activities. Suggest a specific one (Restorative Yoga, Guided Meditation, Sound Bath, etc.) with provider and time."
    elif e >= 4 and m >= 4:
        context += "\n\nThis person is energized! Suggest channeling it — HIIT, Power Vinyasa, Run Club, or Spin Class."
    elif s <= 2:
        context += "\n\nPoor sleep detected. Suggest recovery: Deep Stretch, Yin Yoga, or Chair Massage."
    elif checkin.get("note") and any(w in checkin['note'].lower() for w in ["meeting", "presentation", "deadline", "interview", "pitch"]):
        context += "\n\nImportant event mentioned in the note! Suggest focus prep: Focus Flow Yoga, Cold Plunge, or Guided Journaling. Frame it as performance preparation."

    if not baseline:
        context += "\n\nThis user has fewer than 7 check-ins. Acknowledge warmly, recommend an activity, and encourage building baseline."

    context += "\n\nIMPORTANT FORMATTING RULES:"
    context += "\n- If scores are low (any metric <=2) or drift detected: suggest ONE specific bookable activity (e.g., 'Restorative Yoga', 'Deep Stretch') AND one team challenge (e.g., 'Cold Plunge Duo', 'Pre-Meeting Breathwork')"
    context += "\n- If scores are good (all >=4): celebrate, no need to push activities. Just acknowledge and encourage"
    context += "\n- If scores are average (3): light suggestion, not pushy. Maybe mention checking out the Wellness Lab"
    context += "\n- If note mentions meetings/deadlines/stress: suggest focus prep activities specifically"
    context += "\n- If any score is 1, always include: 'Consider reaching out to your EAP or a wellness professional for additional support.'"
    context += "\n- Keep it real, keep it brief. Don't oversell."
    context += "\n- End by asking about upcoming events or meetings"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context},
    ]
    return _chat(messages, max_tokens=400, provider=provider)


def generate_insight(first_name: str, checkins: list[dict], baseline: dict = None, drift: dict = None, provider: str = "ramalama") -> str:
    """Generate a wellness insight summary."""
    if not checkins:
        return f"Hey {first_name}, I don't have any check-in data yet. Let's start with a quick check-in!"

    context = f"User: {first_name}\n"
    context += f"Total check-ins: {len(checkins)}\n\n"
    context += "Recent check-ins:\n"
    for c in checkins[-7:]:
        context += f"- {c['created_at']}: mood={c['mood']}, energy={c['energy']}, sleep={c['sleep']}"
        if c.get("note"):
            context += f" ({c['note']})"
        context += "\n"

    if baseline:
        context += f"\nBaseline: mood={baseline['mood']}, energy={baseline['energy']}, sleep={baseline['sleep']}"

    if drift and drift.get("alerts"):
        context += "\n\nDrift detected:"
        for alert in drift["alerts"]:
            context += f"\n- {alert['metric']}: baseline {alert['baseline']} → recent {alert['recent']}"

    context += "\n\nProvide a wellness insight summary with:"
    context += "\n1. Pattern analysis with specific numbers"
    context += "\n2. What their best days look like vs worst days"
    context += "\n3. A personalized weekly wellness plan with specific activities from the catalog"
    context += "\n4. If drift detected: urgent micro-intervention with specific activity recommendation"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context},
    ]
    return _chat(messages, max_tokens=400, provider=provider)
