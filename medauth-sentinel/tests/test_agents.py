"""
MedAuth Sentinel — Agent Tests
Tests all 3 agents with real Groq API calls.
These tests take ~5-15 seconds each due to API calls.
Run: pytest tests/test_agents.py -v -s
"""

import sys
import os
import json

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.agents.intake_agent import IntakeAgent
from backend.agents.decision_agent import DecisionAgent
from backend.agents.critic_agent import CriticAgent


# ---- Test 1: IntakeAgent with valid request ----
def test_intake_agent_valid_request():
    agent = IntakeAgent()
    result = agent.run({
        "patient_id": "P001",
        "drug_requested": "Ozempic",
        "diagnosis_code": "E11.9",
        "requesting_doctor": "Dr. Mehta"
    })
    print(f"\n[IntakeAgent - Valid] Result: {json.dumps(result, indent=2)}")
    assert "valid" in result
    assert result["valid"] == True
    assert "intake_summary" in result


# ---- Test 2: IntakeAgent with invalid patient ----
def test_intake_agent_invalid_patient():
    agent = IntakeAgent()
    result = agent.run({
        "patient_id": "P999",
        "drug_requested": "Ozempic",
        "diagnosis_code": "E11.9",
        "requesting_doctor": "Dr. Mehta"
    })
    print(f"\n[IntakeAgent - Invalid] Result: {json.dumps(result, indent=2)}")
    assert "valid" in result
    assert result["valid"] == False
    assert len(result.get("issues", [])) > 0


# ---- Test 3: DecisionAgent approval case ----
def test_decision_agent_approval_case():
    agent = DecisionAgent()
    result = agent.run({
        "patient_id": "P001",
        "drug_requested": "Ozempic",
        "diagnosis_code": "E11.9",
        "requesting_doctor": "Dr. Mehta"
    })
    print(f"\n[DecisionAgent - P001] Result: {json.dumps(result, indent=2)}")
    assert "decision" in result
    assert result["decision"] in ["APPROVED", "DENIED", "REQUEST_MORE_INFO"]
    assert "reasoning" in result
    assert "confidence" in result


# ---- Test 4: CriticAgent runs and returns expected fields ----
def test_critic_agent_runs():
    agent = CriticAgent()
    # Use a fake decision for the critic to review
    fake_decision = {
        "decision": "DENIED",
        "confidence": 0.8,
        "reasoning": [
            "Step 1 - Diagnosis Check: Patient has E11.9",
            "Step 2 - Prior Drug Check: Metformin found in history",
            "Step 3 - Age Check: No age restriction",
            "Step 4 - Contraindication Check: No issues",
            "Step 5 - Decision: Denied due to insufficient evidence"
        ],
        "criteria_met": {
            "diagnosis_match": True,
            "prior_drug_requirement": True,
            "age_requirement": "not required",
            "no_contraindications": True
        },
        "missing_info": []
    }
    result = agent.run(
        {
            "patient_id": "P001",
            "drug_requested": "Ozempic",
            "diagnosis_code": "E11.9",
            "requesting_doctor": "Dr. Mehta"
        },
        fake_decision
    )
    print(f"\n[CriticAgent] Result: {json.dumps(result, indent=2)}")
    assert "agrees" in result
    assert "issues_found" in result
