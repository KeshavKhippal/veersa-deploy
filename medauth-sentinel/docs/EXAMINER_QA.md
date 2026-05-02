# MedAuth Sentinel — Examiner Q&A Preparation

## Q: What is an AI Agent?

**A:** An AI agent is a system that receives a goal, breaks it into steps, uses tools
to gather information, and makes autonomous decisions — without human
intervention at each step.

## Q: What is Agentic AI?

**A:** Agentic AI is an architectural approach where AI systems act autonomously
over multi-step workflows. Our system is Agentic because it runs a 4-step
pipeline, makes branching decisions based on data, and self-corrects through
the critic loop — all without human input.

## Q: Why not use LangGraph?

**A:** We evaluated it but chose a hand-rolled orchestrator for 3 reasons:
complete code transparency, easier debugging, and full ownership.
Our orchestrator.py mirrors LangGraph's graph pattern but in ~50 lines
of pure Python that any team member can explain and modify live.

## Q: How does the Critic Agent work?

**A:** After the DecisionAgent makes a verdict, the CriticAgent receives the
full context — patient data, policy rules, AND the decision — and
adversarially reviews it. It checks for missed policy exceptions,
incomplete reasoning, and appeal survivability. If it disagrees,
the DecisionAgent runs again with the critic's feedback.

## Q: What data are you using?

**A:** Synthetic JSON files we generated — 20 patients, diagnoses, medications,
payer policies, and prior auth history. All realistic with real ICD-10 codes
and drug names, but no real patient data for privacy reasons.

## Q: How would you scale this?

**A:** Replace JSON files with a real EHR database, add async FastAPI endpoints
for concurrent processing, add a queue system for high volume,
and connect to real payer policy APIs. The agent architecture is unchanged.

## Q: What security measures did you implement?

**A:** API keys in environment variables never in code, Pydantic input validation
on all endpoints, CORS configuration, and .env excluded from git.

## Q: Why did you use Groq instead of Gemini?

**A:** Groq provides extremely fast inference (~10x faster than other providers)
using their custom LPU hardware. For a real-time demo, speed matters —
the full 3-agent pipeline completes in seconds instead of minutes.
We use LLaMA 3.3 70B which provides excellent reasoning capabilities.

## Q: What happens if the LLM returns invalid JSON?

**A:** Every agent has try/except handling around JSON parsing. If parsing fails,
we return a structured error dict with the raw response text so the
orchestrator can still function and the error is visible in the trace.

## Q: How does Scenario C (E11.65) demonstrate agentic behavior?

**A:** E11.65 is "Type 2 Diabetes with hyperglycemia" — a valid clinical variant
of E11.9 ("Type 2 Diabetes without complications"). The policy accepts both.
The DecisionAgent might initially miss this nuance and deny. The CriticAgent,
reviewing adversarially, catches the missed policy exception and flags it.
The orchestrator then re-runs DecisionAgent with critic feedback, resulting
in a corrected decision. This 4-step self-correction loop is the core
demonstration of agentic self-improvement.
