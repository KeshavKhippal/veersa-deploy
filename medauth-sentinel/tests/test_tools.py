"""
MedAuth Sentinel — Tool Tests
Tests all 3 tool files: patient_lookup, policy_checker, history_checker.
Run: pytest tests/test_tools.py -v
"""

import sys
import os

# Add project root to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.tools.patient_lookup import (
    get_patient,
    get_patient_diagnoses,
    get_patient_medications,
    get_patient_full_profile,
)
from backend.tools.policy_checker import get_policy_for_drug
from backend.tools.history_checker import get_prior_auth_history


# ---- Test 1: Get patient P001 ----
def test_get_patient_p001():
    result = get_patient("P001")
    assert isinstance(result, dict)
    assert "name" in result
    assert result["patient_id"] == "P001"


# ---- Test 2: Patient not found ----
def test_get_patient_not_found():
    result = get_patient("P999")
    assert "error" in result


# ---- Test 3: P001 diagnoses include E11.9 ----
def test_get_diagnoses_p001():
    result = get_patient_diagnoses("P001")
    assert isinstance(result, list)
    assert len(result) > 0
    assert any(d["icd10_code"] == "E11.9" for d in result)


# ---- Test 4: P001 medications include Metformin ----
def test_get_medications_p001():
    result = get_patient_medications("P001")
    assert isinstance(result, list)
    assert any(m["drug_name"] == "Metformin" for m in result)


# ---- Test 5: P005 does NOT have Metformin ----
def test_p005_no_metformin():
    result = get_patient_medications("P005")
    assert not any(m["drug_name"] == "Metformin" for m in result)


# ---- Test 6: Policy checker — Ozempic + BlueCross ----
def test_policy_checker_ozempic_bluecross():
    result = get_policy_for_drug("BlueCross", "Ozempic")
    assert isinstance(result, dict)
    assert "requires_diagnosis" in result
    assert "E11.9" in result["requires_diagnosis"]


# ---- Test 7: Prior auth history for P001 ----
def test_prior_auth_history_p001():
    result = get_prior_auth_history("P001")
    assert isinstance(result, list)


# ---- Test 8: Full profile combines all data ----
def test_full_profile():
    result = get_patient_full_profile("P001")
    assert "patient" in result
    assert "diagnoses" in result
    assert "medications" in result
    assert result["patient"]["patient_id"] == "P001"
    assert len(result["diagnoses"]) > 0
    assert len(result["medications"]) > 0
