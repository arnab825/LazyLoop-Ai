"""
Pre-Execution Snapshot and Reversible Automation Service.
Takes pre-modification snapshots to `.lazyloop/backups/<task_id>/` and provides bit-for-bit Undo.
"""
import os
import shutil
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from app.core.sandbox import WorkspaceValidator
from app.core.database import get_db_connection


class BackupService:
    """Manages pre-modification file snapshots and deterministic undo rollback."""

    @staticmethod
    def calculate_file_hash(file_path: str) -> str:
        """Calculates SHA-256 hash of a file."""
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            return ""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                sha256.update(chunk)
        return sha256.hexdigest()

    @classmethod
    async def create_snapshot(
        cls,
        task_id: str,
        workspace_root: str,
        target_subpath: str,
        action_type: str,
    ) -> Dict[str, Any]:
        """
        Creates a pre-change backup of target_subpath before an update or delete.
        For file creation, logs a change record with an empty original hash so undo can delete it.
        """
        safe_target_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)
        backup_dir = os.path.join(workspace_root, ".lazyloop", "backups", task_id)
        os.makedirs(backup_dir, exist_ok=True)
        
        record_id = str(uuid.uuid4())
        original_hash = ""
        backup_file_path = ""
        
        if os.path.exists(safe_target_path) and os.path.isfile(safe_target_path):
            original_hash = cls.calculate_file_hash(safe_target_path)
            # Create a unique snapshot filename in backup_dir
            backup_filename = f"{record_id}_{os.path.basename(safe_target_path)}"
            backup_file_path = os.path.join(backup_dir, backup_filename)
            shutil.copy2(safe_target_path, backup_file_path)

        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Persist change record in SQLite
        db = await get_db_connection()
        try:
            await db.execute(
                """
                INSERT INTO change_records (id, task_id, original_path, backup_path, original_sha256, action_type, recorded_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (record_id, task_id, target_subpath, backup_file_path, original_hash, action_type, now_iso),
            )
            await db.commit()
        finally:
            await db.close()

        return {
            "record_id": record_id,
            "original_path": target_subpath,
            "backup_path": backup_file_path,
            "original_sha256": original_hash,
            "action_type": action_type,
        }

    @classmethod
    async def undo_task(cls, task_id: str, workspace_root: str) -> Dict[str, Any]:
        """
        Rolls back all changes executed in a given task in reverse chronological order.
        Restores modified/deleted files and deletes newly created files.
        """
        safe_root = WorkspaceValidator.canonicalize_workspace(workspace_root)
        db = await get_db_connection()
        records = []
        try:
            cursor = await db.execute(
                """
                SELECT * FROM change_records 
                WHERE task_id = ? 
                ORDER BY recorded_at DESC
                """,
                (task_id,),
            )
            records = await cursor.fetchall()
        finally:
            await db.close()

        restored_files = []
        errors = []

        for row in records:
            orig_rel_path = row["original_path"]
            backup_file = row["backup_path"]
            orig_hash = row["original_sha256"]
            action = row["action_type"]

            try:
                target_full_path = WorkspaceValidator.resolve_safe_path(safe_root, orig_rel_path)
                
                if action == "CREATE":
                    # Undo creation by removing the created file
                    if os.path.exists(target_full_path):
                        os.remove(target_full_path)
                        restored_files.append({"path": orig_rel_path, "operation": "DELETED_CREATED_FILE"})
                
                elif action in ("UPDATE", "DELETE", "MOVE"):
                    # Restore file from backup
                    if backup_file and os.path.exists(backup_file):
                        os.makedirs(os.path.dirname(target_full_path), exist_ok=True)
                        shutil.copy2(backup_file, target_full_path)
                        # Verify restored hash
                        current_hash = cls.calculate_file_hash(target_full_path)
                        if current_hash == orig_hash:
                            restored_files.append({"path": orig_rel_path, "operation": "RESTORED_EXACT_HASH"})
                        else:
                            restored_files.append({"path": orig_rel_path, "operation": "RESTORED_HASH_MISMATCH"})
            except Exception as e:
                errors.append({"path": orig_rel_path, "error": str(e)})

        return {
            "task_id": task_id,
            "restored_count": len(restored_files),
            "restored_files": restored_files,
            "errors": errors,
            "success": len(errors) == 0,
        }
