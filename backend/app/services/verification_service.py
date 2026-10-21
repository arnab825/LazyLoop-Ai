"""
Verification Engine for Deterministic Proof of Work.
Calculates SHA-256 hashes, file existence assertions, and diff validity.
"""
import os
import hashlib
from typing import Dict, Any, List
from app.core.sandbox import WorkspaceValidator
from app.models.schemas import VerificationResultModel


class VerificationEngine:
    """Verifies actual filesystem outcomes after tool execution."""

    @staticmethod
    def calculate_file_hash(full_path: str) -> str:
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            return ""
        sha = hashlib.sha256()
        with open(full_path, "rb") as f:
            while chunk := f.read(65536):
                sha.update(chunk)
        return sha.hexdigest()

    @classmethod
    def verify_step(
        cls,
        step_id: str,
        tool_name: str,
        workspace_root: str,
        arguments: Dict[str, Any],
        execution_result: Dict[str, Any],
    ) -> List[VerificationResultModel]:
        """Runs deterministic postcondition assertions for a completed step."""
        verifications = []

        if tool_name == "create_file":
            target_subpath = arguments.get("path", "")
            safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)
            expected_content = arguments.get("content", "")
            expected_sha = hashlib.sha256(expected_content.encode("utf-8")).hexdigest()
            actual_sha = cls.calculate_file_hash(safe_path)
            
            verifications.append(
                VerificationResultModel(
                    step_id=step_id,
                    target_path=target_subpath,
                    method="file_sha256_match",
                    expected=expected_sha,
                    actual=actual_sha,
                    passed=(expected_sha == actual_sha and len(actual_sha) > 0),
                )
            )

        elif tool_name == "update_file":
            target_subpath = arguments.get("path", "")
            safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)
            expected_content = arguments.get("content", "")
            expected_sha = hashlib.sha256(expected_content.encode("utf-8")).hexdigest()
            actual_sha = cls.calculate_file_hash(safe_path)

            verifications.append(
                VerificationResultModel(
                    step_id=step_id,
                    target_path=target_subpath,
                    method="file_sha256_match",
                    expected=expected_sha,
                    actual=actual_sha,
                    passed=(expected_sha == actual_sha and len(actual_sha) > 0),
                )
            )

        elif tool_name == "delete_file":
            target_subpath = arguments.get("path", "")
            safe_path = WorkspaceValidator.resolve_safe_path(workspace_root, target_subpath)
            exists = os.path.exists(safe_path)

            verifications.append(
                VerificationResultModel(
                    step_id=step_id,
                    target_path=target_subpath,
                    method="file_absence",
                    expected="file_does_not_exist",
                    actual="file_does_not_exist" if not exists else "file_still_exists",
                    passed=not exists,
                )
            )

        elif tool_name == "move_file":
            src = arguments.get("src", "")
            dest = arguments.get("dest", "")
            safe_src = WorkspaceValidator.resolve_safe_path(workspace_root, src)
            safe_dest = WorkspaceValidator.resolve_safe_path(workspace_root, dest)

            src_gone = not os.path.exists(safe_src)
            dest_exists = os.path.exists(safe_dest)

            verifications.append(
                VerificationResultModel(
                    step_id=step_id,
                    target_path=dest,
                    method="file_presence",
                    expected="file_exists",
                    actual="file_exists" if dest_exists else "file_missing",
                    passed=dest_exists and src_gone,
                )
            )

        elif tool_name in ("list_directory", "read_file", "find_duplicate_files", "check_doc_gaps"):
            # Read-only tools verify output payload integrity
            verifications.append(
                VerificationResultModel(
                    step_id=step_id,
                    target_path=arguments.get("path", arguments.get("doc_path", "workspace")),
                    method="read_payload_verified",
                    expected="valid_structure",
                    actual="valid_structure" if isinstance(execution_result, dict) else "invalid",
                    passed=isinstance(execution_result, dict),
                )
            )

        return verifications
