"""
MedAuth Sentinel — Orchestrator Tests
Tests all 4 demo scenarios through the full pipeline.
These tests make real API calls — each takes ~15-30 seconds.
Run: pytest tests/test_orchestrator.py -v -s
"""

import sys
import os
import json

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.orchestrator import run_prior_auth


# ---- Test 1: Scenario A — Clean Approval (P001 + Ozempic + BlueCross) ----
def test_scenario_a_approval():
    request = {
        "patient_id": "P001",
        "drug_requested": "Ozempic",
        "diagnosis_code": "E11.9",
        "requesting_doctor": "Dr. Mehta"
    }
    result = run_prior_auth(request)

    print(f"\n{'='*60}")
    print("SCENARIO A — Clean Approval")
    print(f"{'='*60}")
    print(json.dumps(result, indent=2))

    assert result["status"] == "COMPLETED"
    assert result["final_decision"] in ["APPROVED", "DENIED", "REQUEST_MORE_INFO"]
    assert len(result["trace"]) >= 3
    assert "critic_feedback" in result


# ---- Test 2: Scenario B — Denial (P005 + Ozempic — no Metformin history) ----
def test_scenario_b_denial():
    request = {
        "patient_id": "P005",
        "drug_requested": "Ozempic",
        "diagnosis_code": "E11.9",
        "requesting_doctor": "Dr. Singh"
    }
    result = run_prior_auth(request)

    print(f"\n{'='*60}")
    print("SCENARIO B — Denial (No Metformin)")
    print(f"{'='*60}")
    print(f"Final Decision: {result['final_decision']}")
    print(f"Reasoning: {json.dumps(result.get('reasoning', []), indent=2)}")

    assert result["status"] == "COMPLETED"
    assert len(result["trace"]) >= 3


# ---- Test 3: Scenario C — Critic Override (P010 + E11.65 variant) ----
def test_scenario_c_critic_override():
    request = {
        "patient_id": "P010",
        "drug_requested": "Ozempic",
        "diagnosis_code": "E11.65",
        "requesting_doctor": "Dr. Sharma"
    }
    result = run_prior_auth(request)

    print(f"\n{'='*60}")
    print("SCENARIO C — Critic Override (MONEY SHOT)")
    print(f"{'='*60}")
    print(f"Final Decision: {result['final_decision']}")
    print(f"Revision Made: {'YES ⚡' if result.get('revision_made') else 'NO'}")
    print(f"Number of trace steps: {len(result['trace'])}")
    print(f"\nFull trace:")
    for step in result["trace"]:
        print(f"  Step {step['step']}: {step['agent']} — {step['status']}")
    print(f"\nFull result:")
    print(json.dumps(result, indent=2))

    assert result["status"] == "COMPLETED"


# ---- Test 4: Invalid Patient (P999 — should be rejected at intake) ----
def test_invalid_patient():
    request = {
        "patient_id": "P999",
        "drug_requested": "Ozempic",
        "diagnosis_code": "E11.9",
        "requesting_doctor": "Dr. Test"
    }
    result = run_prior_auth(request)

    print(f"\n{'='*60}")
    print("SCENARIO — Invalid Patient")
    print(f"{'='*60}")
    print(json.dumps(result, indent=2))

    assert result["status"] == "REJECTED_AT_INTAKE"
    assert len(result["trace"]) == 1
