"""
Routine DNA Service.
Saves successful workflows as reusable routines, detects drift, and allows replays.
"""
import uuid
import json
import hashlib
import os
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.core.database import get_db_connection
from app.core.sandbox import WorkspaceValidator


class RoutineService:
    """Manages Routine DNA templates, drift detection, and automated replay."""

    @classmethod
    def calculate_workspace_drift_hash(cls, workspace_path: str) -> str:
        """Computes a structural hash of folder structure to detect workspace drift."""
        safe_root = WorkspaceValidator.canonicalize_workspace(workspace_path)
        sha = hashlib.sha256()
        for root, dirs, files in os.walk(safe_root):
            dirs[:] = [d for d in dirs if not d.startswith(".") and d != "node_modules"]
            for d in sorted(dirs):
                sha.update(d.encode("utf-8"))
        return sha.hexdigest()

    @classmethod
    async def create_routine(
        cls,
        name: str,
        description: str,
        task_id: str,
        workspace_path: str,
    ) -> Dict[str, Any]:
        """Creates a reusable routine from a successfully executed task."""
        safe_root = WorkspaceValidator.canonicalize_workspace(workspace_path)
        drift_hash = cls.calculate_workspace_drift_hash(safe_root)
        routine_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()

        db = await get_db_connection()
        try:
            # Fetch steps from task
            cur = await db.execute("SELECT * FROM task_steps WHERE task_id = ? ORDER BY step_index ASC", (task_id,))
            steps = await cur.fetchall()

            plan_template = [
                {
                    "step_index": s["step_index"],
                    "tool_name": s["tool_name"],
                    "arguments": json.loads(s["arguments_json"]),
                    "risk_tier": s["risk_tier"],
                }
                for s in steps
            ]

            preconditions = {
                "required_folders": ["."],
                "baseline_drift_hash": drift_hash,
            }

            await db.execute(
                """
                INSERT INTO routines (id, name, description, current_version, is_active, plan_template_json, preconditions_json, drift_hash, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (routine_id, name, description, 1, 1, json.dumps(plan_template), json.dumps(preconditions), drift_hash, now_iso),
            )
            await db.commit()
        finally:
            await db.close()

        return {
            "id": routine_id,
            "name": name,
            "description": description,
            "version": 1,
            "preconditions": preconditions,
            "created_at": now_iso,
        }

    @classmethod
    async def list_routines(cls) -> List[Dict[str, Any]]:
        db = await get_db_connection()
        try:
            cur = await db.execute("SELECT * FROM routines WHERE is_active = 1 ORDER BY created_at DESC")
            rows = await cur.fetchall()
            return [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "description": r["description"],
                    "version": r["current_version"],
                    "created_at": r["created_at"],
                    "steps_count": len(json.loads(r["plan_template_json"])),
                }
                for r in rows
            ]
        finally:
            await db.close()

    @classmethod
    async def check_drift(cls, routine_id: str, workspace_path: str) -> Dict[str, Any]:
        """Checks if current workspace matches the baseline preconditions of the routine."""
        db = await get_db_connection()
        try:
            cur = await db.execute("SELECT * FROM routines WHERE id = ?", (routine_id,))
            routine = await cur.fetchone()
            if not routine:
                return {"error": "Routine not found"}

            current_hash = cls.calculate_workspace_drift_hash(workspace_path)
            baseline_hash = routine["drift_hash"]
            drift_detected = current_hash != baseline_hash

            return {
                "routine_id": routine_id,
                "drift_detected": drift_detected,
                "baseline_hash": baseline_hash,
                "current_hash": current_hash,
                "message": "Workspace layout has changed since routine was created. Review recommended." if drift_detected else "Workspace preconditions verified.",
            }
        finally:
            await db.close()
