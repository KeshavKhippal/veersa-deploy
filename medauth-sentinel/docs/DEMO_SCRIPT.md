# MedAuth Sentinel — 5 Minute Demo Script

## 0:00 — 0:45 | Problem Statement (speak these words)

"Prior authorization is the process where doctors must get insurance approval
before prescribing certain drugs. It currently takes 3-5 days, costs the US
healthcare system $35 billion per year, and 88% of physicians say it directly
harms patient care. We built MedAuth Sentinel to solve this."

## 0:45 — 1:30 | System Overview (show architecture)

"Our system has 3 AI agents working in sequence.
The IntakeAgent validates the request.
The DecisionAgent checks policy rules against patient history.
The CriticAgent adversarially reviews the decision before it's finalized.
All orchestrated by a hand-rolled Python state machine — no frameworks."

## 1:30 — 2:15 | Live Demo — Scenario A (clean approval)

- Click "Load Scenario A"
- Say: "P001 is a 54-year-old diabetic patient. They're on Metformin.
  The policy requires both Type 2 Diabetes diagnosis AND prior Metformin trial."
- Click Submit
- Show APPROVED result
- Say: "Approved in seconds. Full reasoning trail visible."
- Click Trace tab
- Walk through each agent step briefly

## 2:15 — 3:00 | Live Demo — Scenario B (denial)

- Click "Load Scenario B"
- Say: "P005 also has Type 2 Diabetes but has never tried Metformin first.
  The policy explicitly requires this."
- Click Submit
- Show DENIED result
- Say: "Denied with specific reasoning. No guessing — evidence-based."

## 3:00 — 4:00 | Live Demo — Scenario C (critic override — MONEY SHOT)

- Click "Load Scenario C"
- Say: "Now watch this carefully. P010 has diagnosis code E11.65 —
  a specific variant of Type 2 Diabetes with hyperglycemia."
- Click Submit
- Wait for result
- Point to "Revision Made ⚡" badge
- Say: "The DecisionAgent initially missed that E11.65 is a valid variant of E11.9.
  The CriticAgent caught this — it adversarially reviewed the decision,
  flagged the missed policy exception, and forced a revision.
  This is the multi-agent self-critique loop in action."
- Show trace with 4 steps

## 4:00 — 4:30 | Prompt Studio Demo

- Switch to Prompt Studio tab
- Say: "Every prompt is fully editable. Watch this."
- Find CriticAgent prompt, add "Be extremely aggressive in finding flaws." to the text
- Save
- Click "Re-run Last Request"
- Show potentially different result
- Say: "The behavior changed in real time. Judges can modify and re-run anything."

## 4:30 — 5:00 | Scale & Close

- Say: "To scale this: we'd swap JSON files for a real EHR database,
  add async processing for concurrent requests,
  and connect to real payer policy APIs.
  The agent architecture stays identical — just the tools change."
- "Thank you."
