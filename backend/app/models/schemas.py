"""
Core Domain Models for Tasks, Steps, Approvals, and Receipts.
"""
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class RiskTier(str, Enum):
    READ_ONLY = "READ_ONLY"
    LOW = "LOW"
    HIGH_DESTRUCTIVE = "HIGH_DESTRUCTIVE"


class AutonomyMode(str, Enum):
    REVIEW_ALL = "REVIEW_ALL"      # Requires approval for every single action
    SAFE_AUTO = "SAFE_AUTO"        # Auto-runs read-only; requires approval for modifications
    DRY_RUN = "DRY_RUN"            # Previews diffs & plans; modifies 0 files


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    PLANNING = "PLANNING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class StepStatus(str, Enum):
    PENDING = "PENDING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    APPROVED = "APPROVED"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class ToolStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    step_index: int
    tool_name: str
    arguments: Dict[str, Any]
    description: str
    risk_tier: RiskTier
    status: StepStatus = StepStatus.PENDING
    diff_preview: Optional[str] = None
    error_message: Optional[str] = None


class ExecutionPlan(BaseModel):
    task_id: str
    explanation: str
    steps: List[ToolStep] = []
    total_estimated_manual_minutes: float = 0.0
    highest_risk_tier: RiskTier = RiskTier.READ_ONLY


class TaskCreateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Natural-language task description")
    workspace_path: str = Field(..., description="Absolute path to target workspace directory")
    autonomy_mode: AutonomyMode = AutonomyMode.SAFE_AUTO
    preferred_model: Optional[str] = None


class ApprovalItem(BaseModel):
    step_id: str
    token: str
    approved: bool


class ApprovalRequest(BaseModel):
    approvals: List[ApprovalItem]


class VerificationResultModel(BaseModel):
    step_id: str
    target_path: str
    method: str  # e.g. "sha256_match", "file_absence", "file_presence"
    expected: str
    actual: str
    passed: bool


class ProofOfWorkReceipt(BaseModel):
    receipt_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    prompt: str
    workspace_path: str
    model_used: str
    created_at: str
    completed_at: str
    planned_steps_count: int
    approved_steps_count: int
    executed_steps_count: int
    verified_steps_count: int
    verification_results: List[VerificationResultModel] = []
    wall_clock_ms: float
    model_latency_ms: float
    manual_time_avoided_minutes: float
    status: TaskStatus
