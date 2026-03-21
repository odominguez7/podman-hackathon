# YU Shield — AI Wellness Companion for the Modern Workplace

## The Problem
Companies spend $51B/year on employee wellness programs with no signal on what's working. Employees burn out silently. HR sees it in resignation letters, not dashboards. By the time someone leaves, it's too late.

## The Solution
YU Shield is a privacy-first AI wellness companion that detects burnout before it becomes a resignation. Employees do a 30-second daily check-in (mood, energy, sleep). The AI coach — powered by IBM Granite 3.3 running locally via RamaLama — delivers personalized, CBT-informed guidance and books wellness activities. No data ever leaves the infrastructure.

## How It Works
1. **Daily Check-In** — 30 seconds. Rate mood, energy, sleep (1-5). Add an optional note.
2. **AI Coaching** — Granite 3.3 responds with personalized guidance, citing your specific data patterns ("Your mood dropped from 4.2 to 2.6 over 4 days"). Recommends bookable wellness activities.
3. **Drift Detection** — Algorithm monitors 7-day baselines. If scores drop 1.5+ below baseline for 3 consecutive days, it triggers an early intervention alert.
4. **Employer Dashboard** — Anonymous aggregates only. Participation rates, team trends, drift alerts. Zero individual data exposed. Privacy by architecture.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  React SPA  │────▶│  FastAPI Backend  │────▶│  IBM Granite 3.3 8B │
│  (Vite +    │     │  (Python 3.12)   │     │  via RamaLama       │
│  Tailwind)  │     │                  │     │  (Local, Private)   │
└─────────────┘     │  SQLite DB       │     └─────────────────────┘
                    │  5 MCP Tools     │     ┌─────────────────────┐
                    │  Drift Engine    │────▶│  Claude Sonnet      │
                    └──────────────────┘     │  (Cloud, X-Ray Only)│
                           │                └─────────────────────┘
                    ┌──────┴───────┐
                    │   Podman     │
                    │  Container   │
                    │ docker.io/   │
                    │ odominguez7/ │
                    │ yu-shield    │
                    └──────────────┘
```

## What Makes YU Shield Different

- **X-Ray Mode** — Side-by-side comparison of local Granite vs cloud Claude on the same check-in. Proves open-source local AI delivers enterprise-quality coaching. Response times, quality, and privacy tradeoffs — all visible.
- **MCP Integration** — 5 exposed tools (check wellness, get recommendations, book activities, submit check-ins, team summary) ready for Claude Desktop, Cursor, or any MCP client.
- **Privacy by Architecture** — Granite runs on-device via RamaLama. SQLite stays local. Employer dashboard shows only anonymous aggregates. HIPAA-ready without cloud dependency.
- **Drift Detection** — Not just tracking. Algorithmic early warning: baseline deviation triggers proactive intervention with professional referral paths.

## Tech Stack (100% Open Source Core)

| Layer | Technology |
|-------|-----------|
| Container Runtime | **Podman** |
| Local AI | **IBM Granite 3.3 8B** via **RamaLama** |
| MCP Server | **FastMCP** (5 tools) |
| Backend | **FastAPI** + **SQLite** |
| Frontend | **React** + **Vite** + **Tailwind** + **shadcn/ui** + **Recharts** |
| Cloud AI (X-Ray only) | Claude Sonnet (Anthropic) |
| Registry | docker.io/odominguez7/yu-shield:latest |

## Run It Yourself

```bash
podman run -p 8000:8000 docker.io/odominguez7/yu-shield:latest
```

## About the Builder
**Omar Dominguez** — MIT background, 11 years optimizing capacity in manufacturing. Saw the same idle-capacity problem in employee wellness: companies invest in programs but have zero real-time signal. YU Shield is the missing feedback loop. Built for OpenShift deployment at enterprise scale.
