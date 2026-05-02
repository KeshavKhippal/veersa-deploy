"""
Patient Lookup Tool — Pure data retrieval from JSON files.
No AI calls. These are the "hands" that agents use to get patient information.
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")


def get_patient(patient_id: str) -> dict:
    """Load data/patients.json, find patient by patient_id, return the dict.
    If not found, return {"error": "Patient not found", "patient_id": patient_id}"""
    filepath = os.path.join(DATA_DIR, "patients.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            patients = json.load(f)
        for patient in patients:
            if patient["patient_id"] == patient_id:
                return patient
        return {"error": "Patient not found", "patient_id": patient_id}
    except FileNotFoundError:
        return {"error": "patients.json not found", "patient_id": patient_id}


def get_patient_diagnoses(patient_id: str) -> list:
    """Load data/diagnoses.json, return ALL diagnosis records for this patient_id.
    If none found, return empty list []"""
    filepath = os.path.join(DATA_DIR, "diagnoses.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            diagnoses = json.load(f)
        return [d for d in diagnoses if d["patient_id"] == patient_id]
    except FileNotFoundError:
        return []


def get_patient_medications(patient_id: str) -> list:
    """Load data/medications.json, return ALL medication records for this patient_id.
    Filter to only status: active. If none found, return []"""
    filepath = os.path.join(DATA_DIR, "medications.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            medications = json.load(f)
        return [
            m for m in medications
            if m["patient_id"] == patient_id and m.get("status") == "active"
        ]
    except FileNotFoundError:
        return []


def get_patient_full_profile(patient_id: str) -> dict:
    """Combine all three above into one dict:
    {
      "patient": get_patient(patient_id),
      "diagnoses": get_patient_diagnoses(patient_id),
      "medications": get_patient_medications(patient_id)
    }
    Return this combined dict."""
    return {
        "patient": get_patient(patient_id),
        "diagnoses": get_patient_diagnoses(patient_id),
        "medications": get_patient_medications(patient_id)
    }
