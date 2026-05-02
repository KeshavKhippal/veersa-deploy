# MedAuth Sentinel
### An Autonomous Prior Authorization & Appeals Agent

> **Veersa Hackathon 2026 — ABES Batch of 2027**  
> Build Intelligent Systems. Think Like Engineers. Solve Real Problems.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Running Tests](#running-tests)
- [Demo Scenarios](#demo-scenarios)
- [Prompt Studio](#prompt-studio)
- [Deployment](#deployment)
- [Docker](#docker)
- [API Reference](#api-reference)
- [System Design](#system-design)
- [Team](#team)

---

## What It Does

Prior authorization costs the US healthcare system **$35 billion per year**. Doctors wait 3–5 days for approvals while patients suffer. MedAuth Sentinel replaces the human reviewer with 3 autonomous AI agents that process requests in seconds — with full reasoning transparency.

**The 3-Agent Pipeline:**

```
[Request] → IntakeAgent → DecisionAgent → CriticAgent → [Decision + Trace]
                                               ↓
                                    (if issues found)
                                               ↓
                                        DecisionAgent (revised)
```

- **IntakeAgent** — Validates the request. Checks patient exists, ICD-10 code is valid, all fields present.
- **DecisionAgent** — Checks patient diagnosis, medication history, payer policy rules. Decides APPROVE / DENY / REQUEST_MORE_INFO with step-by-step reasoning.
- **CriticAgent** — Adversarially reviews the decision. Catches missed policy exceptions. Forces revision if issues found.

The self-critique loop (DecisionAgent → CriticAgent → DecisionAgent revised) is what makes this genuinely agentic — the system corrects itself without human intervention.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React)                    │
│  Tab 1: Submit  │  Tab 2: Trace  │  Tab 3: Prompts  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP REST
                         ▼
┌─────────────────────────────────────────────────────┐
│                BACKEND (FastAPI)                     │
│  POST /api/submit-request                           │
│  GET  /api/patients                                 │
│  GET  /api/prompts                                  │
│  PUT  /api/prompts/{agent}                          │
│  GET  /api/scenarios                                │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│               ORCHESTRATOR                          │
│  Step 1 → IntakeAgent                               │
│  Step 2 → DecisionAgent                             │
│  Step 3 → CriticAgent                               │
│  Step 4 → DecisionAgent revised (if needed)         │
└────┬──────────────┬──────────────┬──────────────────┘
     │              │              │
     ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌───────────┐
│ INTAKE  │  │DECISION  │  │  CRITIC   │
│  AGENT  │  │  AGENT   │  │   AGENT   │
└─────────┘  └──────────┘  └───────────┘
     │              │              │
     └──────────────┴──────────────┘
                    │ calls tools
                    ▼
┌─────────────────────────────────────────────────────┐
│                 TOOLS LAYER                          │
│  patient_lookup │ policy_checker │ history_checker  │
└────────────────────────┬────────────────────────────┘
                         │ reads
                         ▼
┌─────────────────────────────────────────────────────┐
│                  DATA LAYER                          │
│  patients.json │ diagnoses.json │ medications.json  │
│  payer_policies.json │ prior_auths.json             │
└────────────────────────┬────────────────────────────┘
                         │ LLM calls
                         ▼
                ┌─────────────────┐
                │   GROQ API      │
                │ llama-3.3-70b   │
                └─────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| LLM | Groq API (llama-3.3-70b-versatile) | Free, fast, reliable |
| Backend | FastAPI + Python 3.11 | Auto-docs, Pydantic validation, async support |
| Frontend | React + Tailwind CSS | Component-based, professional UI |
| Data | JSON files | Transparent, portable, no DB setup |
| Orchestration | Hand-rolled Python | Full code ownership, explainable line by line |
| Testing | pytest + REST Client | Unit + API testing (2 types as required) |
| Deployment | Render (backend) + Vercel (frontend) | Free tier, no sleep issues |
| Container | Docker + docker-compose | Bonus points, one-command startup |

---

## Project Structure

```
medauth-sentinel/
├── backend/
│   ├── agents/
│   │   ├── intake_agent.py        ← Validates requests
│   │   ├── decision_agent.py      ← Makes APPROVE/DENY decision
│   │   └── critic_agent.py        ← Adversarial reviewer
│   ├── tools/
│   │   ├── patient_lookup.py      ← Reads patient data from JSON
│   │   ├── policy_checker.py      ← Reads payer policy rules
│   │   └── history_checker.py     ← Reads prior auth history
│   ├── main.py                    ← FastAPI app + all endpoints
│   ├── orchestrator.py            ← Runs agents in sequence
│   ├── models.py                  ← Pydantic request/response models
│   └── generate_data.py           ← Generates synthetic JSON data
├── prompts/
│   ├── intake_agent.yaml          ← IntakeAgent instructions (editable)
│   ├── decision_agent.yaml        ← DecisionAgent instructions (editable)
│   └── critic_agent.yaml          ← CriticAgent instructions (editable)
├── data/
│   ├── patients.json              ← 20 synthetic patients
│   ├── diagnoses.json             ← ICD-10 diagnoses per patient
│   ├── medications.json           ← Active medications per patient
│   ├── payer_policies.json        ← Insurance policy rules
│   └── prior_auths.json           ← Historical authorization decisions
├── frontend/
│   └── src/
│       ├── config.js              ← Centralized API URL config
│       ├── App.jsx                ← Main app + backend health check
│       └── components/
│           ├── SubmitRequest.jsx  ← Request form + decision display
│           ├── ReasoningTrace.jsx ← Step-by-step agent trace
│           └── PromptStudio.jsx   ← Live prompt editing
├── tests/
│   ├── test_tools.py              ← 8 unit tests (no API needed)
│   ├── test_agents.py             ← 4 agent tests (needs Groq)
│   ├── test_orchestrator.py       ← 4 pipeline tests (needs Groq)
│   └── test_api.http              ← API tests (VS Code REST Client)
├── backend/Dockerfile
├── frontend/Dockerfile
├── docker-compose.yml
├── Procfile                       ← For Render deployment
├── render.yaml                    ← Render config
├── requirements.txt
├── run_scenarios.py               ← Demo scenario runner
├── .env.example                   ← Safe template (no real keys)
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-team/medauth-sentinel.git
cd medauth-sentinel

# 2. Add your API key
cp .env.example .env
# Open .env and set GROQ_API_KEY=your_actual_key

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Generate synthetic data
python backend/generate_data.py

# 5. Start backend (Terminal 1)
uvicorn backend.main:app --reload

# 6. Start frontend (Terminal 2)
cd frontend
npm install
npm start
```

Open **http://localhost:3000** — the app is running.  
Open **http://localhost:8000/docs** — interactive API documentation.

---

## Running Tests

```bash
# Unit tests — tools layer (no API key needed, instant)
pytest tests/test_tools.py -v

# Agent tests (needs Groq API key, ~30 seconds)
pytest tests/test_agents.py -v

# Full pipeline tests with output (needs Groq API key, ~2 minutes)
pytest tests/test_orchestrator.py -v -s

# Run all tests
pytest tests/ -v
```

Expected results:
```
tests/test_tools.py          8 passed
tests/test_agents.py         4 passed
tests/test_orchestrator.py   4 passed
```

---

## Demo Scenarios

Three pre-built scenarios demonstrate the full system. Load them from the UI or run:

```bash
python run_scenarios.py
```

### Scenario A — Clean Approval
**Patient:** P001 | **Drug:** Ozempic | **Diagnosis:** E11.9 (Type 2 Diabetes)

Patient has Type 2 Diabetes diagnosis and has tried Metformin first. Policy criteria fully met. Expected result: **APPROVED**.

### Scenario B — Denial (No Prior Drug)
**Patient:** P005 | **Drug:** Ozempic | **Diagnosis:** E11.9

Patient has Type 2 Diabetes but has never tried Metformin. Policy requires Metformin first. Expected result: **DENIED**.

### Scenario C — Critic Override ⚡ (Demo Money Shot)
**Patient:** P010 | **Drug:** Ozempic | **Diagnosis:** E11.65

Patient has E11.65 (Type 2 Diabetes with hyperglycemia — a valid variant of E11.9). The DecisionAgent may initially miss this variant. The CriticAgent catches it, flags the missed policy exception, and forces a revision.

This is the key demo moment — watch for `revision_made: true` and the `⚡ Critic Override` badge in the UI trace.

---

## Prompt Studio

Every agent's instructions live in editable YAML files — never hardcoded in Python.

**Location:** `prompts/intake_agent.yaml`, `prompts/decision_agent.yaml`, `prompts/critic_agent.yaml`

**Via UI:** Go to the Prompt Studio tab in the frontend. Edit any agent's system prompt. Click Save. Click Re-run to see behavior change immediately.

**Via API:**
```http
PUT /api/prompts/critic_agent
Content-Type: application/json

{
  "agent": "critic_agent",
  "system_prompt": "You are a VERY strict adversarial critic..."
}
```

This feature lets judges modify agent behavior live during evaluation — a core requirement of the hackathon brief.

---

## Deployment

### Live Links

| Service | URL |
|---------|-----|
| **Working Application** | https://medauth-sentinel.vercel.app |
| **Backend API Docs** | https://medauth-sentinel-backend.onrender.com/docs |
| **GitHub Repository** | https://github.com/your-team/medauth-sentinel |

> **Note:** Backend runs on Render free tier. First request after inactivity takes ~30 seconds to wake up. The UI shows a banner while this happens. Subsequent requests are instant.

### Deploy Backend to Render

```bash
# 1. Push to GitHub
git add . && git commit -m "deploy" && git push

# 2. Go to render.com → New Web Service
# Connect your GitHub repo
# Settings:
#   Build Command: pip install -r requirements.txt
#   Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
#   Environment Variable: GROQ_API_KEY = your_key

# 3. Copy your Render URL:
# https://medauth-sentinel-backend.onrender.com
```

### Deploy Frontend to Vercel

```bash
# 1. Go to vercel.com → Add New Project
# Import your GitHub repo
# Settings:
#   Root Directory: frontend
#   Framework: Create React App
#   Environment Variable: REACT_APP_API_URL = https://medauth-sentinel-backend.onrender.com

# 2. Deploy → get URL:
# https://medauth-sentinel.vercel.app
```

---

## Docker

Run the entire stack with one command:

```bash
# Build and start everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs

# Stop
docker-compose down
```

Make sure your `.env` file has `GROQ_API_KEY` set before running Docker.

---

## API Reference

### POST /api/submit-request
Run the full 3-agent pipeline on a prior authorization request.

**Request:**
```json
{
  "patient_id": "P001",
  "drug_requested": "Ozempic",
  "diagnosis_code": "E11.9",
  "requesting_doctor": "Dr. Mehta"
}
```

**Response:**
```json
{
  "status": "COMPLETED",
  "final_decision": "APPROVED",
  "confidence": 0.92,
  "reasoning": [
    "Step 1 - Diagnosis Check: E11.9 matches policy requirement",
    "Step 2 - Prior Drug Check: Metformin found in active medications",
    "Step 3 - Age Check: Not required by policy",
    "Step 4 - Contraindications: None found",
    "Step 5 - Decision: All criteria met, APPROVED"
  ],
  "criteria_met": {
    "diagnosis_match": true,
    "prior_drug_requirement": true,
    "age_requirement": "not required",
    "no_contraindications": true
  },
  "critic_feedback": {
    "agrees": true,
    "severity": "none",
    "issues_found": [],
    "critic_summary": "Decision is well-reasoned and policy-compliant."
  },
  "revision_made": false,
  "decision_changed": false,
  "intake_summary": "Request for Ozempic by P001 validated successfully.",
  "trace": [
    { "step": 1, "agent": "IntakeAgent", "output": {} },
    { "step": 2, "agent": "DecisionAgent", "output": {} },
    { "step": 3, "agent": "CriticAgent", "output": {} }
  ],
  "total_duration_ms": 8432
}
```

### GET /api/patients
Returns list of all 20 patients for the frontend dropdown.

### GET /api/prompts
Returns all 3 agent prompt files as JSON.

### PUT /api/prompts/{agent_name}
Updates an agent's system prompt. Agent name: `intake_agent`, `decision_agent`, or `critic_agent`.

### GET /api/scenarios
Returns the 3 pre-built demo scenarios for quick load buttons.

### GET /api/health
Health check endpoint. Used by the frontend wake-up banner.

---

## System Design

### Why JSON files instead of a database?

JSON files give us the same relational structure we need for 20 patients. They're transparent — judges can open and read them directly. In production we'd connect to an EHR system via FHIR APIs. The tools layer (`backend/tools/`) is the abstraction point — only the tools would change, not the agents.

### Why hand-rolled orchestrator instead of LangGraph?

We evaluated LangGraph but chose a hand-rolled state machine for three reasons: complete code transparency, easier live debugging, and full team ownership. Our `orchestrator.py` is 98 lines of pure Python that any team member can explain and modify instantly. LangGraph would have abstracted away the logic we need to demonstrate during evaluation.

### Why separate prompts into YAML files?

The hackathon brief requires prompts to be inspectable and modifiable outside the code. YAML files satisfy this and enable the Prompt Studio feature — judges can change agent behavior live without touching Python.

### How does the critic loop work?

```
DecisionAgent makes initial decision
         ↓
CriticAgent receives: request + patient data + policy + decision
CriticAgent checks: missed exceptions? incomplete reasoning? appeal risk?
         ↓
If critic.agrees == False AND severity in ["minor", "major"]:
    DecisionAgent runs again WITH critic feedback
    revision_made = True
         ↓
Final decision returned with full 4-step trace
```

### How would you scale this?

Three changes: replace JSON files with a real EHR database in the tools layer, add async FastAPI endpoints for concurrent requests, add a Redis queue for high-volume batch processing. The agent and orchestrator code stays identical — only the tools change.

---

## Security

- API keys stored in `.env` — never committed to GitHub
- `.env` is in `.gitignore`
- Pydantic input validation on all POST endpoints
- CORS configured for specific origins
- No hardcoded secrets anywhere in codebase

```bash
# Verify no secrets in git history
git log --all --full-history -- .env
# Expected: no output
```

---

## Team

| Name | Role | Owns |
|------|------|------|
| [Member 1] | Orchestrator + Agents | `orchestrator.py`, `agents/`, `prompts/` |
| [Member 2] | Data + Tools + Tests | `data/`, `tools/`, `tests/` |
| [Member 3] | Frontend + API + DevOps | `frontend/`, `main.py`, Docker, README |

**ABES Engineering College — Batch of 2027**  
**Veersa Hackathon 2026**