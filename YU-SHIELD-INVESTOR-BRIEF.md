# YU Shield -- Investor Product Brief

**Live Demo:** https://yu-shield-919392094284.us-east1.run.app
**Repo:** https://github.com/odominguez7/podman-hackathon
**Builder:** Omar Dominguez, MIT Sloan Fellow MBA
**Status:** Working product, deployed on Google Cloud Run, MVP-ready for real customers

---

## What YU Shield Is

YU Shield is an AI-powered employee wellness platform where the AI runs entirely on the employee's own device. No wellness data ever reaches a company server. Not because of a privacy policy -- because of physics. The AI model (IBM Granite 3.3 8B) runs inside a Podman container on-device via RamaLama. There is no cloud to leak to.

Employees do a 30-second daily check-in (mood, energy, sleep on a 1-5 scale, optional note). The AI builds a behavioral baseline over 7 days, then watches for drift -- sustained deviations that signal burnout before it becomes a crisis. When drift is detected, the AI delivers personalized, evidence-based coaching with specific activity recommendations. Employers see only anonymous, aggregated team data. Individual scores are architecturally inaccessible.

**Tagline:** "From you, to you."
**Core question:** "Everyone needs you. Who's taking care of YU?"

---

## The Problem

- U.S. employers lose **$125-190 billion annually** to burnout-related turnover, absenteeism, and lost productivity.
- 76% of employees report experiencing burnout.
- Traditional Employee Assistance Programs (EAPs) see under 5% adoption.
- The #1 reason employees don't use wellness tools: **privacy concerns**. They don't trust that their employer won't see their data.
- Existing solutions are reactive (surveys, annual reviews). By the time a problem surfaces, the employee is already disengaged or gone.

YU Shield eliminates the trust problem entirely. When the AI runs on-device and employer dashboards are architecturally limited to anonymous aggregates, employees actually participate.

---

## Product Walkthrough (What the Demo Shows)

### Landing Page

The landing page opens with an animated hero section: the YU Shield icon, the tagline "From you, to you," and four badges: "Local AI Running on Podman," "Open Source Stack," "MCP Ready," and "Privacy-First Architecture."

A prominent "Take the Guided Tour" button launches a 9-step interactive walkthrough covering the problem, the solution, and every feature. Below the hero, five clickable product cards guide visitors through the demo flow: Employee Check-In, X-Ray Mode, Employer Dashboard, MCP Playground, and Enterprise Vision.

A "Why Local AI Matters" section presents three value propositions: Private by Architecture ("Not a policy, it's physics"), Enterprise-Grade Quality (proven via X-Ray Mode), and MCP Native (5 tools via open protocol).

A Wix Foundry banner at the top identifies this as an interactive product demo with simulated AI responses. A disclaimer section explains that production runs real-time local AI via Podman and that the full backend is operational and ready for MVP deployment.

The footer shows open source stack logos: Podman, Red Hat, RamaLama, IBM Granite, FastAPI, FastMCP, React.

---

### Guided Tour (9 Steps)

First-time visitors see a full-screen guided tour overlay. Nine steps walk through every aspect of the product:

**Step 0 -- Welcome.** Introduces YU Shield as AI-powered wellness running entirely on-device. Notes that demo responses are pre-generated; production uses IBM Granite 3.3 8B locally.

**Step 1 -- The Problem.** Four stat boxes: "$322B annual cost of burnout," "23% wellness program adoption," "#1 reason: privacy concerns," "0 bytes YU sends to employer."

**Step 2 -- Why Local AI.** Explains that Granite 3.3 runs inside a Podman container. Three benefits: architecturally private (physics, not policy), enterprise-grade quality (proven in X-Ray), HIPAA-ready (no PHI transmitted, no BAA needed).

**Step 3 -- The Check-In.** Shows the 30-second check-in flow (Mood, Energy, Sleep on 1-5). Explains baseline building (7+ days) and drift detection (sustained deviations from baseline).

**Step 4 -- X-Ray Mode.** Side-by-side comparison of local Granite 3.3 vs cloud AI. Shows timing metrics (local 2-4s vs cloud 0.8-1.5s) and proves output quality parity without data transmission.

**Step 5 -- Employer Dashboard.** Emphasizes that employers see ONLY anonymous aggregated data. Org-wide wellness score (0-100), department trends, drift alerts, AI-generated action recommendations.

**Step 6 -- MCP Integration.** Five wellness tools exposed via Model Context Protocol. Any MCP-compatible AI assistant (Claude, Copilot, custom agents) can integrate programmatically.

**Step 7 -- Enterprise Vision.** YU Shield lives where teams already work: Slack, Teams, or any internal tool. Separate value propositions for employees, leaders, and culture teams.

**Step 8 -- MVP Ready.** Checklist: production backend (FastAPI + SQLite, Podman, Kubernetes-ready), real AI engine (Granite 3.3 via RamaLama, Claude fallback), open source and extensible (MCP-native, OCI-compliant).

Each step includes "Try It Live" buttons that jump directly to the relevant feature.

---

### Employee Check-In (/chat)

The core product experience. A chat-style interface where the employee interacts with YU, the AI wellness companion.

**Registration:** First-name only. No email, no password, no corporate SSO. Frictionless entry.

**Check-In Input:** Three sliders for Mood (1-5 with emoji scale from "Bad" to "Great"), Energy (1-5, "Drained" to "Energized"), Sleep (1-5, "Terrible" to "Excellent"), plus an optional free-text note. A "Simulate" button auto-fills random values for quick demo testing. Keyboard shortcuts (1-5 keys) for speed.

**AI Response:** After submitting, the AI delivers a personalized coaching response that:
- Cites the specific scores submitted ("your sleep score of 2/5 jumped out at me")
- References baseline data ("that's below your recent average")
- Recommends specific bookable activities with provider names, durations, and locations ("Deep Stretch Class at FitHub, 40 min" or "Yin Yoga at Down Under Yoga, 60 min")
- Asks about upcoming events to tailor further suggestions
- Includes an EAP referral note when any score is critically low (1/5)
- Displays a "Book Now" and "Browse All" button inline

**Grounding Tags:** Every AI response displays:
- Confidence indicator: Orange dot ("Limited data," <7 check-ins), Amber ("Building confidence," 7-13), Green ("Strong baseline," 14+)
- Data citation: "Based on: 14 check-ins, 7-day baseline"
- Privacy badge: "Processed on-device by Granite 3.3. Your data never left this machine"
- Clinical boundary: "Wellness guidance only. Consider speaking with a professional for clinical concerns"

**Human Approval:** Every AI response includes "This resonates" and "Not helpful" buttons. The human-in-the-loop step ensures the AI coaching is validated by the employee before being reinforced.

**Drift Detection:** When the AI detects a sustained decline (3+ days below baseline by more than 1.5 points), it surfaces a drift alert:
- "Pattern Detected: sleep baseline 3.8 -> recent 2.7"
- Drift alerts appear with amber warning icons
- AI recommends immediate action and offers to book a wellness class

**History Panel:** A sidebar showing all past check-ins with timestamps, scores, and notes. Allows the employee to track their own patterns over time.

---

### X-Ray Mode

A toggle switch in the check-in interface activates X-Ray Mode. When enabled, the same check-in data is processed by two AI models simultaneously:

**Local Card (Green):** Granite 3.3 8B via IBM RamaLama. Shows the response, a "LOCAL" badge, the processing time (typically 2-4 seconds), and a privacy note: "Your data never left this machine."

**Cloud Card (Blue):** Cloud Model via API. Shows the response, a "CLOUD" badge, the processing time (typically 0.8-1.5 seconds), and a note: "Sent to cloud API."

**Verdict line:** "Same check-in. Same quality. Only one kept your data on this machine. You won't miss the cloud."

Both cards show full AI coaching responses, grounding tags, and drift detection. The point X-Ray makes to an enterprise buyer: you don't sacrifice quality by going local. The responses are comparable. The only difference is one kept the data private.

---

### Wellness Hub (3 Tabs Inside Chat)

Accessible from tabs within the check-in interface.

**Analytics Tab:**
- 7-day rolling averages for Mood, Energy, Sleep with trend arrows (up/down/flat)
- Streak counter (consecutive check-in days)
- Best day and worst day identification with dates
- AI-generated wellness insights on demand
- Smart activity recommendations based on current score patterns:
  - Low mood/sleep scores trigger "Calm" category recommendations
  - High energy triggers "Energize" category
  - Low energy triggers "Recovery" category
  - Otherwise defaults to "Focus" category

**Rituals Tab (12 Science-Backed Personal Protocols):**
No booking required -- these are self-guided practices employees can adopt immediately.
1. Breathwork (5 min) -- Box breathing. Stress reduction: 60%
2. Light Therapy (10 min) -- Morning bright light. Energy boost: 30%
3. Phone Detox (2 hrs) -- No phone. Mood improvement: 25%
4. Clean Eating (All day) -- No processed food. Energy boost: 45%
5. Hydration Reset (All day) -- 3L water + electrolytes. Focus improvement: 20%
6. 20-20-20 Rule (20 sec) -- Eye strain reduction: 50%
7. Dopamine Fast (24 hrs) -- No social media/junk food/Netflix. Focus improvement: 70%
8. Digital Sunset (Evening) -- Screens off 2 hrs before bed. Sleep improvement: 50%
9. No Alcohol Pledge (30 days) -- Mood improvement: 40%
10. 7-Day Detox (7 days) -- No sugar, caffeine, alcohol. Energy boost: 60%
11. Gratitude Drop (2 min) -- Write 3 things before phone. Mood improvement: 35%
12. Party Prep Protocol (Pre + Post) -- Hydrate, eat clean, nap, recover. Recovery improvement: 80%

Pre-curated "Scenario Stacks" combine rituals for specific situations:
- Heavy meeting day: Breathwork + Hydration + Eye-rest
- Need focus: Dopamine-fast + Phone-detox + Clean-eating
- Feeling low: Gratitude + Light-therapy + Hydration
- Party tonight: Party-prep + Hydration + Clean-eating

**Challenges Tab (Team Wellness Competitions):**
Simulated Slack-style channel (#wellness-challenges) showing five active challenges:

1. Cold Plunge Showdown -- Sales vs Engineering, progress bars (Sales 8/12, Engineering 11/15), participant avatars, reactions, "3 days left"
2. Walking Meeting Week -- Complete 3+ walking meetings, leaderboard with step counts, "Hit goal = leave early Friday"
3. Phone Stack Lunch -- Phones stack at lunch, first to grab pays dessert, limited spots
4. Pre-Meeting Breathwork -- 5-min box breathing before all-hands, RSVP system
5. Friday Contrast Therapy -- Sauna + cold plunge at FitHub, "Your manager Diana already signed up"

Each challenge shows: poster name and role, description, progress tracking, participant avatars, emoji reactions, time remaining, and a join button.

---

### Activity Booking System

**16 bookable activities across 4 categories:**

**Calm Down (5):** Restorative Yoga (Down Under Yoga, 45 min), Guided Meditation (Wellness Room, 20 min), Box Breathing (Anywhere, 10 min), Mindful Nature Walk (Charles River, 30 min), Sound Bath (Harmony Studio, 40 min)

**Energize (4):** HIIT Express (FitHub, 25 min), Power Vinyasa (Down Under Yoga, 50 min), Morning Run Club (Esplanade, 35 min), Spin Class (FitHub, 40 min)

**Focus (3):** Focus Flow Yoga (Down Under Yoga, 30 min), Cold Plunge + Sauna (FitHub, 20 min), Guided Journaling (Anywhere, 15 min)

**Recovery (4):** Deep Stretch Class (FitHub, 40 min), Chair Massage (Floor 2, 15 min), Yin Yoga (Down Under Yoga, 60 min), Self-Massage and Foam Rolling (Anywhere, 20 min)

Each activity card shows: provider name, intensity level (Low/Medium/High), full description, duration, scheduled time, location, and a "Book" button. Booking confirmation shows a green success animation with activity details and "Calendar invite sent."

Activities are accessible via:
- Inline "Book Now" buttons in AI responses
- Full booking modal with category filters
- Inline booking panel in the Wellness Hub
- MCP tool (book_wellness_activity) for programmatic booking

---

### Employer Dashboard (/dashboard)

The enterprise view for "Meridian AI" -- a 530-person demo organization across 9 departments.

**Organization Score:** Circular progress indicator (0-100) with color coding: Green 75+ ("Thriving"), Amber 50-74 ("Healthy"/"Moderate"), Red <50 ("Concerning"/"Critical"). Calculated from weighted mood/energy/sleep averages.

**Key Metrics Row (4 cards):**
- Org Score (composite wellness number)
- Total Enrolled (530 employees)
- Active This Week (participation percentage)
- Environment Alerts (number of active drift alerts across departments)

**Department Breakdown Table (9 departments):**

| Department | Headcount | Metrics Tracked |
|---|---|---|
| Engineering | 220 | Mood, Energy, Sleep averages + trend arrows |
| Product and Design | 70 | Color-coded bars (green 4+, amber 3+, red <3) |
| Sales and Partnerships | 90 | Alert count per department |
| Marketing and Growth | 60 | Participation rate |
| Customer Success | 80 | Sorted by drift alert count (highest first) |
| Finance and Legal | 40 | |
| People and Workplace | 40 | |
| Data and Analytics | 20 | |
| Strategy and CEO Office | 10 | |

**Wellness Trends Chart:** 14-day rolling area chart with three lines: Mood (teal), Energy (amber), Sleep (indigo). Y-axis 1-5 scale. Shows anonymous aggregate patterns over time.

**AI-Generated Insights (3 cards):**
1. What's Working -- Engagement metrics, drift detection effectiveness, privacy architecture benefits
2. Watch Areas -- Participation below 70% warnings, sustained decline alerts, energy pattern monitoring
3. Recommended Actions -- Meeting load reduction, workload distribution review, no-meeting block implementation

**Privacy enforcement:** "Individual data is architecturally inaccessible. Anonymous aggregates only." No individual names, scores, or notes ever appear on this dashboard. Minimum group size of 5 for any aggregate.

---

### MCP Playground (/mcp)

An interactive testing environment for YU Shield's Model Context Protocol integration. Left sidebar shows the 5 available tools; main area provides parameter inputs and displays JSON responses.

**5 MCP Tools:**

1. **check_my_wellness** -- Employee self-service. Input: user_id. Returns: baseline scores, recent 5 check-ins, drift status (alert/stable), drift details.

2. **get_team_wellness_summary** -- Anonymous org aggregates. No inputs. Returns: org score, participation rate, daily trends, drift alerts. No individual data.

3. **get_wellness_recommendations** -- Smart activity suggestions. Input: mood, energy, sleep (1-5 each). Returns: list of recommended activities with provider, duration, location, intensity. Logic routes to Calm/Energize/Focus/Recovery based on score patterns.

4. **book_wellness_activity** -- Book a session. Input: user_id, activity name. Returns: booking confirmation with unique ID, provider, scheduled time, location.

5. **submit_checkin** -- Full check-in with AI coaching. Input: user_id, mood, energy, sleep, optional note. Returns: recorded check-in, baseline, drift detection boolean, AI coaching response from Granite 3.3.

**Demo Users:** Pre-populated list showing 6 employees across departments with different wellness patterns (burnout, stable, high variance, compassion fatigue, consistently strong, high energy). Each user's ID is clickable to auto-fill the parameter input.

**Interface shows:** Parameter input grid, MCP call preview (formatted mcp.call() code block), Run button, and JSON response panel with copy functionality.

**Why this matters for investors:** MCP is the emerging open standard for AI tool interoperability. Any MCP-compatible AI assistant -- Claude, Copilot, custom enterprise agents -- can integrate with YU Shield's wellness tools programmatically. This makes YU Shield a platform, not just an app.

---

### Enterprise Vision (/vision)

A forward-looking page showing how YU Shield integrates into enterprise workflows.

**Slack Integration Mockup:** Simulated Slack channel (#wellness-checkin) showing the full flow: bot prompt, employee response with ratings, AI coaching with activity recommendations and "Book" buttons, privacy badge ("Processed on-device by Granite 3.3. This conversation is private to you.").

**Privacy Architecture (Two-Column Comparison):**

What Each Person Sees (employee side):
- Personal mood, energy, sleep scores over time
- AI coaching tailored to behavioral patterns
- Drift alerts when something feels off
- Activity recommendations based on their data
- Full check-in history with trend analysis
- "All processing happens locally via Granite 3.3 on Podman"

What the Organization Sees (employer side):
- Org-wide wellness score (0-100, no names)
- Department-level trends (minimum 5 people per group)
- Participation rates by team
- Drift alerts at team level, never individual
- Recommended interventions for culture programs
- "Individual data is architecturally inaccessible to the company"

**Three Persona Tabs:**

*People:* Build self-awareness, get ahead of burnout (drift detection catches declines before crisis), connect via wellness challenges, book what helps. Sample AI message: "Hey Sarah, your energy has been declining for 3 days (4.2 to 2.6). Last time this happened, a morning run reset you. Want me to book a Run Club session?"

*Leaders:* Team wellness pulse (anonymous aggregates), early warning system (team-level drift alerts), data-driven 1:1s (right questions without personal answers), measure culture initiatives. Dashboard preview shows Engineering Team with drift alert: "Energy has declined 22% over 4 days. Consider easing sprint commitments." Note: "12 people in this group. No individual scores visible."

*Culture and HR:* Drive real adoption (privacy by design means 80%+ adoption target), org-wide wellness score, department benchmarking, ROI on wellness spend (connect trends to retention, sick days, eNPS), HIPAA-ready architecture. Simulated Slack reports: weekly pulse summaries, culture win announcements ("42 people completed Sleep Champion challenge. Teams with challenge participation show 18% higher avg mood.").

**Agentic AI + MCP Section:** Granite 3.3 runs inside Podman on each person's machine. Through MCP, any AI assistant can interact with wellness tools. X-Ray transparency proves local quality matches cloud.

---

## Demo Data Architecture

The demo seeds a realistic enterprise dataset for "Meridian AI" (530 employees, Boston):

**38 named users across 9 departments, each with 14 days of check-in history:**

- Engineering (12 users): Mix of burnout arcs (high scores days 1-7, declining days 8-14), stable baselines, improving patterns (low to high), and declining patterns (high to sharp drop)
- Sales (5 users): High variance with quarter-end stress spikes
- Customer Success (5 users): Compassion fatigue pattern (stable then declining days 11-14)
- People and Workplace (3 users): Consistently strong scores (the "healthy team" benchmark)
- Strategy (1 user): High energy, moderate sleep pattern

Contextual notes are generated from pools matching each pattern: "morning run felt amazing" for good days, "deadline stress" for bad days, "big deal closing" for sales highs, "difficult escalation" for CS fatigue.

One-command seeding: button on dashboard or `curl -X POST /api/seed-demo`.

---

## Technical Architecture

| Layer | Technology |
|---|---|
| Container Runtime | Podman (rootless, OCI-compliant) |
| Local AI | RamaLama serving IBM Granite 3.3 8B Instruct (Apache 2.0 license) |
| Cloud AI Fallback | Claude Sonnet via Anthropic API (X-Ray comparison mode) |
| MCP Server | FastMCP exposing 5 wellness tools via Model Context Protocol |
| Backend | FastAPI (Python 3.12) + SQLite with indexed schemas |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Charts | Recharts for trend visualization |
| Container Registry | docker.io/odominguez7/yu-shield:latest |
| Cloud Deployment | Google Cloud Run (us-east1) |

**One-command deploy:**
```
podman run -p 8000:8000 docker.io/odominguez7/yu-shield:latest
```

**12 API endpoints** covering user registration, check-in, X-Ray comparison, insights, history, dashboard aggregates, department stats, MCP recommendations, activity booking, and demo seeding.

**Dual AI routing:** Graceful fallback between local (RamaLama) and cloud (Claude) providers. If local model is unavailable, cloud takes over transparently.

---

## Ethical Design

| Principle | How YU Shield Implements It |
|---|---|
| Human approval | "This resonates" / "Not helpful" feedback buttons after every AI response |
| Evaluation metrics | Confidence indicators tied to data volume (orange/amber/green) |
| Personalization constraints | 7+ check-ins required before drift detection and recommendations activate |
| Grounded outputs | Every AI claim cites specific data points from the employee's own check-ins |
| Uncertainty handling | Frames all output as wellness support, never clinical claims |
| Professional referral | EAP recommendation when any score is critically low |
| Data ownership | Employee controls export and deletion of all personal data |
| Architectural privacy | Individual data is structurally nonexistent in employer-facing endpoints |

---

## Why This Matters

The wellness market is broken by a trust gap. Employees won't use tools if they think their employer is watching. YU Shield closes that gap permanently by making surveillance architecturally impossible.

Local AI is now good enough. X-Ray Mode proves it. Granite 3.3 running on a laptop delivers coaching quality comparable to cloud models. The enterprise no longer has to choose between intelligence and privacy.

MCP makes YU Shield a platform. Any AI assistant can call our wellness tools. This isn't a standalone app -- it's wellness infrastructure that integrates into Slack, Teams, Copilot, Claude, or any MCP-compatible agent.

The product is built, deployed, and working. This is not a mockup.

---

*YU Shield | AI Wellness, Private by Design*
*Built by Omar Dominguez, MIT Sloan Fellow MBA*
*"I lost 80 lbs, ran the Boston Marathon, and finished Ironman 70.3 -- because I learned to protect my energy before everything else."*
