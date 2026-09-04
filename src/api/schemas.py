from datetime import datetime
from enum import Enum

from typing import Literal, Optional

from pydantic import BaseModel, Field


class CaseStatus(str, Enum):
    new = "New"
    in_review = "In review"
    escalated = "Escalated"
    resolved = "Resolved"


class RiskCase(BaseModel):
    id: str
    subject: str
    category: str
    score: int = Field(ge=0, le=100)
    exposure: float = Field(ge=0)
    status: CaseStatus
    reason: str
    created_at: datetime


class CaseDecision(BaseModel):
    """A lightweight analyst action recorded against a risk case."""

    action: Literal["review", "escalate", "resolve"]


class DashboardSummary(BaseModel):
    total_exposure: float = Field(ge=0)
    exposure_change_pct: float
    open_cases: int = Field(ge=0)
    new_cases: int = Field(ge=0)
    model_precision: float = Field(ge=0, le=100)
    precision_change_pct: float
    category_exposure: dict[str, float]


class CustomerRisk(BaseModel):
    id: str
    name: str
    email: str = ""
    risk_score: int = Field(ge=0, le=100)
    total_exposure: float = Field(ge=0)
    open_cases: int = Field(ge=0)


class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(default="", max_length=254)
    risk_score: int = Field(default=0, ge=0, le=100)
    total_exposure: float = Field(default=0, ge=0)


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[str] = Field(default=None, max_length=254)
    risk_score: Optional[int] = Field(default=None, ge=0, le=100)
    total_exposure: Optional[float] = Field(default=None, ge=0)


class AgentQuestion(BaseModel):
    question: str = Field(min_length=3, max_length=500)


class AgentResponse(BaseModel):
    answer: str
    suggested_cases: list[str]


class Insight(BaseModel):
    id: str
    title: str
    description: str
    impact: str
    severity: Literal["High", "Medium", "Low"]


class RiskRule(BaseModel):
    id: str
    name: str
    rule_type: Literal["Rule", "Model"]
    status: Literal["Active", "Monitoring", "Paused"]
    precision: float = Field(ge=0, le=100)


class ActivityItem(BaseModel):
    id: str
    title: str
    detail: str
    occurred_at: datetime


class WorkspaceSettings(BaseModel):
    workspace_name: str
    currency: str
    risk_threshold: int = Field(ge=0, le=100)
    analyst_name: str
