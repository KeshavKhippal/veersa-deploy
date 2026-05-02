"""
Pydantic models for API request/response validation.
Used by FastAPI endpoints for input validation.
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field


class PARequest(BaseModel):
    """Prior Authorization Request model."""
    patient_id: str = Field(..., min_length=1, description="Patient ID like P001")
    drug_requested: str = Field(..., min_length=1, description="Drug name like Ozempic")
    diagnosis_code: str = Field(..., min_length=3, description="ICD-10 code like E11.9")
    requesting_doctor: str = Field(..., min_length=1, description="Doctor name")
    additional_notes: Optional[str] = Field(
        default="",
        max_length=2000,
        description="Extra clinical context from the doctor"
    )


class PromptUpdate(BaseModel):
    """Model for updating agent prompts via Prompt Studio."""
    agent: str = Field(..., description="Agent name: intake_agent, decision_agent, or critic_agent")
    system_prompt: str = Field(..., min_length=10, description="New system prompt content")
