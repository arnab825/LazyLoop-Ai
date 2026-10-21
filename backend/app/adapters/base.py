"""
Abstract Model Provider Interface & Deterministic Heuristic Fallback Provider.
Ensures LazyLoop runs reliably whether Ollama is active or not.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import time
import json
import uuid

from app.models.schemas import ExecutionPlan, ToolStep, RiskTier, StepStatus
from app.core.exceptions import ModelInferenceException


class ModelProvider(ABC):
    """Abstract Base Class for replaceable AI model backends."""

    @abstractmethod
    async def generate_plan(
        self,
        task_id: str,
        prompt: str,
        workspace_context: Dict[str, Any],
    ) -> ExecutionPlan:
        """Generates a structured execution plan from a prompt and workspace context."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Returns True if the model provider is operational."""
        pass


class DeterministicMockProvider(ModelProvider):
    """
    Deterministic Mock Provider that uses heuristics to generate reliable plans
    for smart project cleanup, duplicate detection, and docs checklist analysis.
    Useful for offline testing, benchmarks, and environments without local Ollama.
    """

    def __init__(self, model_name: str = "mock-deterministic-v1"):
        self.model_name = model_name

    async def is_available(self) -> bool:
        return True

    async def generate_plan(
        self,
        task_id: str,
        prompt: str,
        workspace_context: Dict[str, Any],
    ) -> ExecutionPlan:
        lower_prompt = prompt.lower()
        steps: List[ToolStep] = []
        explanation = "Generated deterministic workflow based on workspace analysis and request pattern."
        manual_min = 10.0
        step_idx = 0

        # Pattern 1: Smart Project Cleanup / Duplicates / Docs
        if "duplicate" in lower_prompt or "cleanup" in lower_prompt or "clean" in lower_prompt or "analyze" in lower_prompt:
            # Step 1: list workspace directory
            steps.append(
                ToolStep(
                    id=str(uuid.uuid4()),
                    step_index=step_idx,
                    tool_name="list_directory",
                    arguments={"path": ""},
                    description="List workspace root contents to identify files and folder structure.",
                    risk_tier=RiskTier.READ_ONLY,
                )
            )
            step_idx += 1

            # Step 2: find duplicates
            steps.append(
                ToolStep(
                    id=str(uuid.uuid4()),
                    step_index=step_idx,
                    tool_name="find_duplicate_files",
                    arguments={},
                    description="Calculate SHA-256 hashes across workspace files to identify duplicates.",
                    risk_tier=RiskTier.READ_ONLY,
                )
            )
            step_idx += 1

            # Step 3: check doc gaps
            steps.append(
                ToolStep(
                    id=str(uuid.uuid4()),
                    step_index=step_idx,
                    tool_name="check_doc_gaps",
                    arguments={"doc_path": "README.md"},
                    description="Inspect README.md for missing sections, setup instructions, and TODO/FIXME markers.",
                    risk_tier=RiskTier.READ_ONLY,
                )
            )
            step_idx += 1
            manual_min = 15.0

        # Pattern 2: Explicit README or Doc update
        if "readme" in lower_prompt or "document" in lower_prompt or "doc" in lower_prompt:
            if not any(s.tool_name == "check_doc_gaps" for s in steps):
                steps.append(
                    ToolStep(
                        id=str(uuid.uuid4()),
                        step_index=step_idx,
                        tool_name="check_doc_gaps",
                        arguments={"doc_path": "README.md"},
                        description="Check current README structure for documentation gaps.",
                        risk_tier=RiskTier.READ_ONLY,
                    )
                )
                step_idx += 1

        if not steps:
            # Fallback default: list directory and inspect
            steps.append(
                ToolStep(
                    id=str(uuid.uuid4()),
                    step_index=0,
                    tool_name="list_directory",
                    arguments={"path": ""},
                    description="Inspect workspace directory contents.",
                    risk_tier=RiskTier.READ_ONLY,
                )
            )

        highest_risk = RiskTier.READ_ONLY
        for s in steps:
            if s.risk_tier == RiskTier.HIGH_DESTRUCTIVE:
                highest_risk = RiskTier.HIGH_DESTRUCTIVE
                break
            elif s.risk_tier == RiskTier.LOW and highest_risk != RiskTier.HIGH_DESTRUCTIVE:
                highest_risk = RiskTier.LOW

        return ExecutionPlan(
            task_id=task_id,
            explanation=explanation,
            steps=steps,
            total_estimated_manual_minutes=manual_min,
            highest_risk_tier=highest_risk,
        )
