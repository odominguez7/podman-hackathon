<p align="center">
  <img src="https://img.shields.io/badge/Podman-892CA0?style=for-the-badge&logo=podman&logoColor=white" />
  <img src="https://img.shields.io/badge/RamaLama-Local_AI-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/IBM_Granite_3.3-052FAD?style=for-the-badge&logo=ibm&logoColor=white" />
  <img src="https://img.shields.io/badge/FastMCP-5_Tools-teal?style=for-the-badge" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
</p>

<h1 align="center">YU Shield</h1>
<p align="center"><strong>From you, to you.</strong></p>
<p align="center">A private, AI-powered daily practice that helps employees understand their own patterns.<br/>Local-first. Privacy-first. Containerized with Podman. Zero cloud required.</p>

<p align="center">
  <em>Pods, Prompts & Prototypes 2026 · Challenge 1: "My First Local AI" (Beginner Tier)</em>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> · <a href="#x-ray-mode">X-Ray Mode</a> · <a href="#mcp-tools">MCP Tools</a> · <a href="#employer-dashboard">Employer Dashboard</a> · <a href="#ethical-design">Ethics</a>
</p>

---

## Quick Start

```bash
podman run -p 8000:8000 docker.io/odominguez7/yu-shield:latest
```

Open [http://localhost:8000](http://localhost:8000). Click **"Load Demo Data"** to populate a 530-person organization (9 departments, 14 days of check-in history).

All AI runs locally via **IBM Granite 3.3** through **RamaLama**. No data leaves your machine.

---

## The Problem

Employee burnout costs U.S. employers **$125-190 billion annually**. Current solutions (EAPs, wellness apps) are reactive. They wait for employees to self-refer after a crisis. Only 3-5% of employees ever use them.

## The Solution

YU Shield uses behavioral intelligence to detect burnout signals **before** they become crises. Through a 30-second daily check-in, YU builds a personal behavioral baseline. When patterns shift (not a bad day, but sustained deviation over 3+ days), the AI delivers personalized, CBT-informed micro-interventions grounded in the employee's actual data.

**Key insight**: Taking care of yourself is not selfish. It is one of the best ways to take care of the people who depend on you.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                  │
│  Landing · Check-In · Dashboard · MCP Playground         │
│  X-Ray Mode · Wellness Lab · Activity Booking            │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────────────┐
│              Podman Container (:8000)                     │
│                                                          │
│  FastAPI Backend                                         │
│  ├── 12 REST endpoints                                   │
│  ├── SQLite database (users, check-ins, departments)     │
│  ├── Drift detection engine (baseline + 3-day rolling)   │
│  ├── FastMCP server (5 wellness tools)                   │
│  └── Dual AI provider routing                            │
│                                                          │
└────────┬────────────────────────────────┬───────────────┘
         │                                │
┌────────▼────────┐            ┌──────────▼──────────┐
│  LOCAL (default) │            │  CLOUD (X-Ray only) │
│  RamaLama        │            │  Claude Sonnet API   │
│  Granite 3.3 8B  │            │  (optional)          │
│  Data stays here │            │  For comparison only │
└─────────────────┘            └─────────────────────┘
```

---

## Key Features

### X-Ray Mode

Side-by-side comparison of **local AI (Granite 3.3)** vs **cloud AI (Claude)** on the same check-in. Shows response times and privacy indicators. Proves local open-source AI delivers enterprise-quality coaching.

```
┌─────────────────────────┐  ┌─────────────────────────┐
│  LOCAL  Granite 3.3      │  │  CLOUD  Claude Sonnet   │
│  Data never left device  │  │  Sent to Anthropic API  │
│                          │  │                          │
│  "Your mood dropped      │  │  "I notice your mood     │
│  from 4.2 to 2.6..."    │  │  has shifted from..."    │
│                          │  │                          │
│  2.1s                    │  │  1.8s                    │
└─────────────────────────┘  └─────────────────────────┘
```

### Drift Detection

```
Personal Baseline (7+ days)  →  Rolling 3-day Average  →  Drift Alert
     mood: 4.2                    mood: 2.3               -1.9 below baseline
     energy: 4.1                  energy: 2.0              -2.1 below baseline
     sleep: 4.3                   sleep: 2.0               -2.3 below baseline
```

Every AI response cites **specific data points** and includes a confidence indicator:
- **Limited data** (< 7 check-ins): orange indicator
- **Building confidence** (7-13 check-ins): amber indicator
- **Strong baseline** (14+ check-ins): green indicator

### MCP Tools

5 tools exposed via **Model Context Protocol**. Any AI assistant (Claude Desktop, Cursor, custom agents) can interact with YU Shield:

| Tool | Description |
|------|-------------|
| `check_my_wellness` | Employee self-service: check your own baseline, trends, drift |
| `get_team_wellness_summary` | Anonymous team aggregates (no individual data) |
| `book_wellness_activity` | Book from catalog of 17 activities |
| `get_wellness_recommendations` | Score-based activity suggestions |
| `submit_checkin` | Submit check-in and get AI coaching response |

Live interactive **MCP Playground** at `/mcp` for testing tools in real-time.

### Employer Dashboard

Enterprise-grade organizational wellness view for **Meridian AI** (530-person demo company):

- **Department-level breakdown**: 9 departments with headcount, avg scores, trend arrows, drift alerts, participation rates
- **14-day trend charts**: Area charts for mood, energy, sleep
- **Environment alerts**: Drift detection surfaced as organizational signals, not individual blame
- **Actionable insights**: Environmental recommendations (reduce meeting load, review workload distribution)
- **Zero individual data**. Anonymous aggregates only. Individual access is architecturally impossible.

### Wellness Lab

16 science-backed protocols + 5 team challenges with study citations:
- Cold Plunge Duo (250% dopamine increase. Sramek et al., 2000)
- Pre-Meeting Breathwork (62% cortisol reduction. Ma et al., 2017)
- Walking 1:1 Challenge (60% more creative ideas. Stanford, 2014)

### Activity Booking

17 activities across 4 categories (Calm, Energize, Focus, Recovery) with named local providers, durations, locations, and intensity levels.

---

## User Flow

```
1. Open app           →  Landing page: "From you, to you."
2. Enter first name   →  Registration (no email, no password)
3. Daily check-in     →  30 seconds: mood + energy + sleep + optional note
4. AI responds        →  Personalized coaching citing your data
5. Approve response   →  "This resonates" / "Not helpful" (human-in-the-loop)
6. Book activity      →  Browse and book wellness activities
7. Build baseline     →  7+ days creates personal behavioral baseline
8. Drift detection    →  AI alerts when patterns shift, suggests interventions
9. Employer sees      →  Only anonymous team aggregates. Never individual data.
```

---

## Setup

### Option 1: One Command (Podman)

```bash
podman run -p 8000:8000 docker.io/odominguez7/yu-shield:latest
```

### Option 2: Build from Source

```bash
# Clone
git clone https://github.com/odominguez7/podman-hackathon.git
cd podman-hackathon

# Build and run with Podman
podman build -t yu-shield .
podman run -p 8000:8000 \
  -e RAMALAMA_URL=http://host.containers.internal:51564 \
  yu-shield
```

### Option 3: Development

```bash
# Terminal 1: Start local AI model
ramalama serve granite-3.3-8b-instruct

# Terminal 2: Backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
RAMALAMA_URL=http://localhost:51564 uvicorn app.main:app --reload --port 8000

# Terminal 3: Frontend
npm install && npm run dev
```

### Load Demo Data

Click **"Load Demo Data"** on the Dashboard, or:

```bash
curl -X POST http://localhost:8000/api/seed-demo
```

Creates 38 users across 9 departments with 14 days of realistic check-in patterns (burnout arcs, recovery trends, stable baselines).

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | POST | Register user |
| `/api/checkin` | POST | Submit check-in + get AI response |
| `/api/checkin/compare` | POST | X-Ray Mode: both providers with timing |
| `/api/insights/{user_id}` | GET | AI wellness analysis |
| `/api/history/{user_id}` | GET | Check-in history + baseline |
| `/api/dashboard` | GET | Anonymous team aggregates |
| `/api/dashboard/team` | GET | Anonymized per-member status |
| `/api/dashboard/departments` | GET | Department-level wellness stats |
| `/api/mcp/recommendations` | POST | Activity recommendations (MCP) |
| `/api/mcp/book` | POST | Book wellness activity (MCP) |
| `/api/seed-demo` | POST | Load enterprise demo data |

---

## Project Structure

```
podman-hackathon/
├── app/                          # Python backend
│   ├── main.py                   # FastAPI. 12 endpoints + SPA serving
│   ├── database.py               # SQLite. Users, check-ins, baselines, drift, departments
│   ├── shield.py                 # AI engine. Dual provider (RamaLama + Claude)
│   ├── mcp_server.py             # FastMCP. 5 wellness tools
│   └── seed_demo.py              # Enterprise demo data (38 users, 9 departments)
├── src/                          # React frontend
│   ├── pages/
│   │   ├── Landing.tsx           # Hero page: "From you, to you."
│   │   ├── Chat.tsx              # 4-tab UI: Check-in, Insights, Lab, Book
│   │   ├── Dashboard.tsx         # Enterprise dashboard (Meridian AI, 530 employees)
│   │   └── MCPPlayground.tsx     # Live MCP tool testing
│   ├── components/
│   │   ├── WellnessHub.tsx       # Analytics + Wellness Lab protocols
│   │   ├── BookingInline.tsx     # Activity catalog with booking
│   │   └── BookingModal.tsx      # Modal booking (17 activities, 4 categories)
│   └── lib/
│       └── api.ts                # API client
├── Dockerfile                    # Multi-stage: Node 20 build, Python 3.12 runtime
├── docker-compose.yml            # Podman Compose with volume persistence
├── requirements.txt              # FastAPI, FastMCP, Anthropic, httpx, Pydantic
├── .env.example                  # Environment variable template
└── SUBMISSION.md                 # 1-page hackathon submission
```

---

## Privacy Architecture

> **Built for the employee. Not the employer.**
>
> Individual data is **architecturally inaccessible** to employers. Not policy-blocked. Structurally nonexistent. Employees own their data. Employers see only anonymous team aggregates (minimum 5 people per group). No names. No individual scores. No check-in notes. Ever.
>
> With RamaLama, all AI runs on-device. Data never leaves the machine.

---

## Ethical Design

YU Shield was designed with the hackathon's ethics criteria in mind:

| Ethical Principle | Implementation |
|---|---|
| **Human approval step** | "This resonates" / "Not helpful" feedback after every AI response |
| **Evaluation metrics** | Confidence indicator (Limited / Building / Strong) based on data points |
| **Personalization with constraints** | Baseline requires 7+ check-ins before personalized recommendations activate |
| **Grounded outputs** | Every AI claim cites specific data points from the user's history |
| **Uncertainty handling** | AI never makes clinical claims. Frames everything as wellness support |
| **Professional referral** | When scores are critical, AI recommends EAP or wellness professional |
| **Data ownership** | Users control their own data. Export and deletion supported |
| **Architectural privacy** | Employer access to individual data is structurally impossible |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Container** | Podman + multi-stage Dockerfile |
| **Local AI** | RamaLama + IBM Granite 3.3 8B Instruct (open source, Apache 2.0) |
| **Cloud AI** | Claude Sonnet (Anthropic). X-Ray mode comparison only |
| **MCP** | FastMCP (5 tools, live playground) |
| **Backend** | FastAPI + SQLite + Python 3.12 |
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| **Charts** | Recharts |
| **Registry** | docker.io/odominguez7/yu-shield:latest |

---

## Rubric Alignment

| Criteria | How YU Shield Addresses It |
|---|---|
| **User Flow & UI/UX** | 3-step check-in (select mood, set energy/sleep, submit). Clear entry point. Keyboard shortcuts. Responsive design. |
| **Engineering Quality** | Multi-stage Dockerfile, dual AI providers with graceful fallback, SQLite with indexes, MCP server, department aggregation engine |
| **Grounding & Verifiability** | Every AI response cites data points. Confidence indicators. Baseline/drift numbers visible. Sources shown. |
| **Creativity & Innovation** | X-Ray Mode (local vs cloud arena). Department-level drift detection. MCP Playground. Human approval loop. |
| **Use Case & Real-World Fit** | Employee burnout is a $190B problem. YU targets it with 30-second daily check-ins. Privacy-first for regulated industries. |

---

## About the Builder

I lost 80 lbs, ran the Boston Marathon, and finished Ironman 70.3. Not because I had perfect conditions, but because I learned to protect my energy before everything else.

YU Shield exists because the people who depend on you need you at your best.

---

<p align="center">
  <strong>Pods, Prompts & Prototypes 2026</strong><br/>
  <sub>The Open Accelerator, Fort Point, Boston</sub><br/>
  <sub>Omar Dominguez · MIT · omar7@mit.edu</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Red_Hat-EE0000?style=flat-square&logo=redhat&logoColor=white" />
  <img src="https://img.shields.io/badge/IBM-052FAD?style=flat-square&logo=ibm&logoColor=white" />
  <img src="https://img.shields.io/badge/Podman-892CA0?style=flat-square&logo=podman&logoColor=white" />
  <img src="https://img.shields.io/badge/Anthropic-191919?style=flat-square" />
</p>
