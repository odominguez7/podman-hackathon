import os
import httpx

RAMALAMA_URL = os.environ.get("RAMALAMA_URL", "http://host.containers.internal:51564")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """You are YU Shield, an empathetic AI wellness companion for employees. You are NOT a therapist — you are a supportive, evidence-based wellness tool that helps people notice patterns in their wellbeing.

Your role:
1. Conduct brief daily check-ins about mood, energy, and sleep quality
2. Build behavioral baselines over time (7+ days of data)
3. Detect when someone's scores deviate meaningfully from their personal baseline (3+ days below baseline)
4. Deliver personalized, CBT-informed micro-interventions via warm, supportive messages
5. Suggest concrete actions: yoga classes, breathing exercises, schedule adjustments, or connecting with support resources
6. ALWAYS cite specific data points when making observations (e.g., "Your mood dropped from an average of 4.1 to 2.6 over the past 4 days")
7. Flag uncertainty — never make clinical claims, always frame as wellness support
8. If patterns are concerning, gently suggest professional resources

Tone: Warm, brief, non-judgmental. Like a thoughtful colleague, not a robot. Use first name. Keep messages under 3 sentences unless the user asks for more detail.

Privacy principle: All individual data stays with the employee. Employers only see anonymous team-level aggregates. Mention this if asked about privacy."""


def _chat_ramalama(messages: list[dict], max_tokens: int = 300) -> str:
    """Call the local RamaLama llama-server (OpenAI-compatible API)."""
    resp = httpx.post(
        f"{RAMALAMA_URL}/v1/chat/completions",
        json={
            "model": "granite-3.3-8b-instruct",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        },
        timeout=60.0,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


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
            "model": "claude-sonnet-4-20250514",
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
    context += f"Today's check-in: mood={checkin['mood']}/10, energy={checkin['energy']}/10, sleep={checkin['sleep']}/10"
    if checkin.get("note"):
        context += f", note: {checkin['note']}"

    if baseline:
        context += f"\n\nBaseline (first 7 days): mood={baseline['mood']}, energy={baseline['energy']}, sleep={baseline['sleep']}"
        context += f"\nTotal data points: {baseline['data_points']}"

    if drift and drift.get("alerts"):
        context += "\n\nALERT - Drift detected:"
        for alert in drift["alerts"]:
            context += f"\n- {alert['metric']}: baseline {alert['baseline']} → recent avg {alert['recent']}"
        context += "\n\nPlease deliver a gentle, CBT-informed micro-intervention. Cite the specific numbers."

    if not baseline:
        context += "\n\nThis user has fewer than 7 check-ins. Acknowledge the check-in warmly and encourage them to keep building their baseline."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context},
    ]
    return _chat(messages, max_tokens=300, provider=provider)


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

    context += "\n\nProvide a brief wellness insight summary. Cite specific data points. If drift is detected, include a micro-intervention."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context},
    ]
    return _chat(messages, max_tokens=400, provider=provider)
