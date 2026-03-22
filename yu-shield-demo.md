## YU Shield — Complete Demo Description

### What It Is
A privacy-first, AI-powered employee wellness platform. 30-second daily check-ins with personalized AI coaching that detects behavioral drift before burnout hits. Runs entirely on local infrastructure via Podman and RamaLama.

### The Problem
- U.S. employers lose **$125-190 billion annually** to burnout
- Traditional EAP adoption is under 5%
- Existing wellness tools are reactive, not predictive

### Core Features

**1. Daily Check-In (30 seconds)**
- Mood, energy, sleep scores + optional note
- First-name only registration (no email/password)
- AI personalized response with confidence indicator
- Human approval/feedback loop after every AI response

**2. Drift Detection Engine**
- Builds personal baseline after 7+ daily check-ins
- Rolling 3-day average computation
- Flags sustained deviations (e.g., mood drop from 4.2 to 2.3)
- Confidence scoring: Orange (<7 entries), Amber (7-13), Green (14+)

**3. X-Ray Mode**
- Side-by-side comparison of local Granite 3.3 vs cloud AI
- Proves enterprise-grade output parity without sending data to the cloud
- Timing metrics visible (local ~2.1s vs cloud ~1.8s)

**4. Employer Dashboard (demo: "Meridian AI", 530 employees)**
- 9 departments with headcount, averages, trend arrows
- 14-day historical charts (mood, energy, sleep)
- Environmental alert surfacing
- **Zero individual data accessible** -- architecturally enforced, not just policy

**5. Wellness Lab**
- 16 science-backed protocols across 4 categories: Calm, Energize, Focus, Recovery
- Peer-reviewed citations for each:
  - Cold Plunge Duo: 250% dopamine increase (Sramek et al., 2000)
  - Pre-Meeting Breathwork: 62% cortisol reduction (Ma et al., 2017)
  - Walking 1:1 Challenge: 60% creativity improvement (Stanford, 2014)

**6. Activity Booking**
- 17 activities with provider names, durations, locations, intensity levels
- Integrated booking UI

**7. MCP Tool Suite (5 tools)**
- `check_my_wellness` -- personal baseline review
- `get_team_wellness_summary` -- anonymous aggregates only
- `book_wellness_activity` -- 17-activity catalog
- `get_wellness_recommendations` -- score-based suggestions
- `submit_checkin` -- entry point with AI response

### Privacy Architecture
- Individual data is **structurally inaccessible** to employers (not policy-blocked -- nonexistent in aggregate endpoints)
- All AI inference runs on-device via RamaLama
- Employers see only anonymous team aggregates (minimum 5-person groups)
- No individual names, scores, or notes ever transmitted
- User-controlled export and deletion

### Tech Stack
| Layer | Tech |
|-------|------|
| Container | Podman + multi-stage Dockerfile |
| Local AI | RamaLama + IBM Granite 3.3 8B (Apache 2.0) |
| Cloud AI | Optional comparison provider (X-Ray) |
| MCP | FastMCP with 5 tools |
| Backend | FastAPI + SQLite + Python 3.12 |
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn/ui |
| Charts | Recharts |

### User Flow
1. Landing page: "From you, to you"
2. First-name registration
3. 30-second check-in (mood, energy, sleep, optional note)
4. AI personalized response + confidence indicator
5. Human approval/feedback
6. Activity booking
7. Baseline established (7+ days)
8. Drift detection activates (3+ day deviations)
9. Employer dashboard: anonymous department-level insights only

### Ethical Design
- Human approval after every AI response
- 7+ check-ins required before recommendations activate
- Every AI claim cites specific data points
- Frames as wellness support, never clinical claims
- EAP referral when scores are critical
- Full data ownership (export/delete)

### One-Command Deploy
```bash
podman run -p 8000:8000 docker.io/odominguez7/yu-shield:latest
```

### Demo Data
Seeds 38 users across 9 departments with 14-day check-in patterns to show a fully populated "Meridian AI" company dashboard.
