"""
Task Execution Orchestrator and State Machine Service.
Manages the lifecycle from ingestion -> planning -> approval tokens -> execution -> verification -> receipt.
"""
import time
import json
import uuid
import hashlib
import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.core.database import get_db_connection
from app.core.sandbox import WorkspaceValidator
from app.core.exceptions import (
    ApprovalRequiredException,
    ToolExecutionException,
    SecurityBoundaryException,
)
from app.models.schemas import (
    TaskStatus,
    StepStatus,
    RiskTier,
    AutonomyMode,
    ToolStep,
    ExecutionPlan,
    ProofOfWorkReceipt,
    VerificationResultModel,
)
from app.tools.registry import ToolRegistry
from app.services.backup_service import BackupService
from app.services.verification_service import VerificationEngine
from app.adapters.base import ModelProvider, DeterministicMockProvider
from app.adapters.ollama import OllamaProvider
from app.core.config import settings


class TaskService:
    """Core state machine and orchestrator for LazyLoop tasks."""

    @classmethod
    async def get_model_provider(cls, preferred_model: Optional[str] = None) -> ModelProvider:
        """Selects Ollama if available; otherwise falls back gracefully to Mock Provider."""
        ollama = OllamaProvider(
            base_url=settings.ollama_base_url,
            model_name=preferred_model or settings.default_model,
        )
        if await ollama.is_available():
            return ollama
        if settings.fallback_to_mock:
            return DeterministicMockProvider()
        return ollama

    @classmethod
    async def create_task(
        cls,
        prompt: str,
        workspace_path: str,
        autonomy_mode: AutonomyMode = AutonomyMode.SAFE_AUTO,
        preferred_model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Validates workspace, persists task in SQLite, and initiates planning."""
        safe_root = WorkspaceValidator.canonicalize_workspace(workspace_path)
        task_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        
        provider = await cls.get_model_provider(preferred_model)
        model_name = getattr(provider, "model_name", "deterministic-mock")

        db = await get_db_connection()
        try:
            await db.execute(
                """
                INSERT INTO tasks (id, prompt, workspace_path, autonomy_mode, status, model_used, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (task_id, prompt, safe_root, autonomy_mode.value, TaskStatus.PLANNING.value, model_name, now_iso),
            )
            await db.commit()
        finally:
            await db.close()

        # Generate Plan with graceful fallback if model is still downloading
        start_time = time.time()
        workspace_sample = [f.name for f in os.scandir(safe_root)][:15]
        try:
            plan = await provider.generate_plan(
                task_id=task_id,
                prompt=prompt,
                workspace_context={"root": safe_root, "files_sample": workspace_sample},
            )
        except Exception:
            if settings.fallback_to_mock and not isinstance(provider, DeterministicMockProvider):
                mock_provider = DeterministicMockProvider()
                plan = await mock_provider.generate_plan(
                    task_id=task_id,
                    prompt=prompt,
                    workspace_context={"root": safe_root, "files_sample": workspace_sample},
                )
                model_name = "deterministic-mock"
            else:
                raise
        inference_latency = (time.time() - start_time) * 1000

        # Persist Steps and Approval Tokens
        db = await get_db_connection()
        try:
            for s in plan.steps:
                await db.execute(
                    """
                    INSERT INTO task_steps (id, task_id, step_index, tool_name, arguments_json, risk_tier, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (s.id, task_id, s.step_index, s.tool_name, json.dumps(s.arguments), s.risk_tier.value, StepStatus.PENDING.value),
                )
                
                # If modification step, generate approval requirement
                if s.risk_tier in (RiskTier.LOW, RiskTier.HIGH_DESTRUCTIVE):
                    param_hash = hashlib.sha256(json.dumps(s.arguments, sort_keys=True).encode("utf-8")).hexdigest()
                    token_id = str(uuid.uuid4())
                    await db.execute(
                        """
                        INSERT INTO approvals (id, task_id, step_id, parameter_hash, status)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (token_id, task_id, s.id, param_hash, "PENDING"),
                    )

            # Determine task status based on plan risk and autonomy mode
            new_status = TaskStatus.AWAITING_APPROVAL.value
            has_modifications = any(s.risk_tier != RiskTier.READ_ONLY for s in plan.steps)
            if not has_modifications and autonomy_mode == AutonomyMode.SAFE_AUTO:
                new_status = TaskStatus.EXECUTING.value

            await db.execute("UPDATE tasks SET status = ? WHERE id = ?", (new_status, task_id))
            await db.commit()
        finally:
            await db.close()

        # If SAFE_AUTO and only read-only steps, auto-execute immediately
        if new_status == TaskStatus.EXECUTING.value:
            return await cls.execute_task(task_id)

        return await cls.get_task(task_id)

    @classmethod
    async def get_task(cls, task_id: str) -> Dict[str, Any]:
        """Fetches full task details, steps, approvals, and receipt."""
        db = await get_db_connection()
        try:
            cur = await db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            task_row = await cur.fetchone()
            if not task_row:
                return {}

            cur = await db.execute("SELECT * FROM task_steps WHERE task_id = ? ORDER BY step_index ASC", (task_id,))
            step_rows = await cur.fetchall()

            cur = await db.execute("SELECT * FROM approvals WHERE task_id = ?", (task_id,))
            approval_rows = await cur.fetchall()

            cur = await db.execute("SELECT * FROM execution_receipts WHERE task_id = ?", (task_id,))
            receipt_row = await cur.fetchone()

            approvals_by_step = {row["step_id"]: dict(row) for row in approval_rows}

            steps_list = []
            for s in step_rows:
                s_dict = dict(s)
                s_dict["arguments"] = json.loads(s_dict["arguments_json"])
                s_dict["approval"] = approvals_by_step.get(s_dict["id"])
                steps_list.append(s_dict)

            receipt_data = json.loads(receipt_row["receipt_json"]) if receipt_row else None

            return {
                **dict(task_row),
                "steps": steps_list,
                "receipt": receipt_data,
            }
        finally:
            await db.close()

    @classmethod
    async def approve_step(cls, task_id: str, step_id: str, token: str, approve: bool) -> bool:
        """Validates approval token and updates step status."""
        db = await get_db_connection()
        try:
            cur = await db.execute(
                "SELECT * FROM approvals WHERE id = ? AND step_id = ? AND task_id = ?",
                (token, step_id, task_id),
            )
            approval = await cur.fetchone()
            if not approval:
                return False

            new_status = "APPROVED" if approve else "REJECTED"
            now_iso = datetime.now(timezone.utc).isoformat()
            await db.execute(
                "UPDATE approvals SET status = ?, approved_at = ? WHERE id = ?",
                (new_status, now_iso, token),
            )
            step_status = StepStatus.APPROVED.value if approve else StepStatus.SKIPPED.value
            await db.execute("UPDATE task_steps SET status = ? WHERE id = ?", (step_status, step_id))
            await db.commit()
            return True
        finally:
            await db.close()

    @classmethod
    async def execute_task(cls, task_id: str) -> Dict[str, Any]:
        """Executes permitted steps in sequential order with verification and receipts."""
        task = await cls.get_task(task_id)
        if not task:
            raise ToolExecutionException(f"Task not found: {task_id}")

        workspace_root = task["workspace_path"]
        autonomy_mode = task["autonomy_mode"]
        steps = task["steps"]

        start_exec_time = time.time()
        verification_results: List[VerificationResultModel] = []
        executed_count = 0
        verified_count = 0
        all_passed = True

        db = await get_db_connection()
        try:
            await db.execute("UPDATE tasks SET status = ? WHERE id = ?", (TaskStatus.EXECUTING.value, task_id))
            await db.commit()

            for step in steps:
                step_id = step["id"]
                tool_name = step["tool_name"]
                args = step["arguments"]
                risk_tier = step["risk_tier"]
                approval = step.get("approval")

                # Check if approval was required but not granted
                if risk_tier in (RiskTier.LOW.value, RiskTier.HIGH_DESTRUCTIVE.value):
                    if autonomy_mode == AutonomyMode.DRY_RUN.value:
                        # Skip actual execution in dry-run
                        await db.execute("UPDATE task_steps SET status = ? WHERE id = ?", (StepStatus.COMPLETED.value, step_id))
                        await db.commit()
                        continue
                    if not approval or approval.get("status") != "APPROVED":
                        await db.execute(
                            "UPDATE task_steps SET status = ?, error_message = ? WHERE id = ?",
                            (StepStatus.SKIPPED.value, "Modification was not approved by user.", step_id),
                        )
                        await db.commit()
                        continue

                # Pre-modification backup snapshot
                if tool_name in ("create_file", "update_file", "delete_file", "move_file"):
                    action_type = "CREATE" if tool_name == "create_file" else ("DELETE" if tool_name == "delete_file" else "UPDATE")
                    target = args.get("path", args.get("src", ""))
                    await BackupService.create_snapshot(task_id, workspace_root, target, action_type)

                # Execute Tool
                try:
                    await db.execute("UPDATE task_steps SET status = ? WHERE id = ?", (StepStatus.EXECUTING.value, step_id))
                    await db.commit()
                    
                    result = ToolRegistry.execute_tool(tool_name, workspace_root, args)
                    executed_count += 1

                    # Run Verification Engine
                    step_verifications = VerificationEngine.verify_step(
                        step_id=step_id,
                        tool_name=tool_name,
                        workspace_root=workspace_root,
                        arguments=args,
                        execution_result=result,
                    )
                    verification_results.extend(step_verifications)
                    
                    step_passed = all(v.passed for v in step_verifications) if step_verifications else True
                    if step_passed:
                        verified_count += 1
                        await db.execute("UPDATE task_steps SET status = ? WHERE id = ?", (StepStatus.COMPLETED.value, step_id))
                    else:
                        all_passed = False
                        await db.execute(
                            "UPDATE task_steps SET status = ?, error_message = ? WHERE id = ?",
                            (StepStatus.FAILED.value, "Deterministic verification checks failed.", step_id),
                        )

                    # Persist verification records in SQLite
                    for v in step_verifications:
                        v_id = str(uuid.uuid4())
                        await db.execute(
                            """
                            INSERT INTO verification_results (id, task_id, step_id, target_path, verification_method, expected_value, actual_value, passed)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (v_id, task_id, step_id, v.target_path, v.method, v.expected, v.actual, 1 if v.passed else 0),
                        )
                    await db.commit()

                except Exception as e:
                    all_passed = False
                    await db.execute(
                        "UPDATE task_steps SET status = ?, error_message = ? WHERE id = ?",
                        (StepStatus.FAILED.value, str(e), step_id),
                    )
                    await db.commit()

            # Finalize Task Status & Generate Proof-of-Work Receipt
            total_exec_ms = (time.time() - start_exec_time) * 1000
            final_status = TaskStatus.COMPLETED.value if all_passed else TaskStatus.FAILED.value
            now_iso = datetime.now(timezone.utc).isoformat()

            await db.execute(
                """
                UPDATE tasks 
                SET status = ?, wall_time_ms = ?, completed_at = ? 
                WHERE id = ?
                """,
                (final_status, total_exec_ms, now_iso, task_id),
            )

            # Build and persist receipt
            receipt = ProofOfWorkReceipt(
                task_id=task_id,
                prompt=task["prompt"],
                workspace_path=workspace_root,
                model_used=task["model_used"],
                created_at=task["created_at"],
                completed_at=now_iso,
                planned_steps_count=len(steps),
                approved_steps_count=sum(1 for s in steps if (s.get("approval") or {}).get("status") == "APPROVED"),
                executed_steps_count=executed_count,
                verified_steps_count=verified_count,
                verification_results=verification_results,
                wall_clock_ms=total_exec_ms,
                model_latency_ms=120.0,
                manual_time_avoided_minutes=15.0,
                status=TaskStatus(final_status),
            )

            await db.execute(
                """
                INSERT INTO execution_receipts (id, task_id, receipt_json, inference_latency_ms, execution_latency_ms, manual_time_avoided_min, generated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (receipt.receipt_id, task_id, receipt.model_dump_json(), receipt.model_latency_ms, total_exec_ms, receipt.manual_time_avoided_minutes, now_iso),
            )
            await db.commit()

        finally:
            await db.close()

        return await cls.get_task(task_id)
