"""
Policy Checker Tool — Looks up payer policy rules from JSON.
No AI calls. Pure data retrieval for checking insurance policy requirements.
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")


def get_policy_for_drug(payer: str, drug_name: str) -> dict:
    """Load data/payer_policies.json.
    Find policy where payer matches AND drug_name matches (case-insensitive).
    Return the policy dict. If not found, return {"error": "No policy found", "payer": payer, "drug": drug_name}"""
    filepath = os.path.join(DATA_DIR, "payer_policies.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            policies = json.load(f)
        for policy in policies:
            if (policy["payer"].lower() == payer.lower() and
                    policy["drug_name"].lower() == drug_name.lower()):
                return policy
        return {"error": "No policy found", "payer": payer, "drug": drug_name}
    except FileNotFoundError:
        return {"error": "payer_policies.json not found", "payer": payer, "drug": drug_name}


def get_all_policies_for_payer(payer: str) -> list:
    """Return all policies for a given payer. If none, return []"""
    filepath = os.path.join(DATA_DIR, "payer_policies.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            policies = json.load(f)
        return [p for p in policies if p["payer"].lower() == payer.lower()]
    except FileNotFoundError:
        return []
