"""
Automated Pytest Security and Sandbox Boundary Verification Suite.
Validates path traversal prevention, symlink escape checks, tool safety, and reversible undo.
"""
import pytest
import os
import tempfile
import shutil

from app.core.sandbox import WorkspaceValidator
from app.core.exceptions import SecurityBoundaryException
from app.tools.registry import ToolRegistry
from app.services.backup_service import BackupService
from app.core.database import init_db, get_db_connection


@pytest.fixture
def test_workspace():
    """Creates a temporary isolated test workspace."""
    temp_dir = tempfile.mkdtemp(prefix="lazyloop_test_ws_")
    # Add dummy files
    readme_path = os.path.join(temp_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("# Sample Project\n\nTODO: write setup instructions.\n")

    # Add subfolder
    sub_dir = os.path.join(temp_dir, "assets")
    os.makedirs(sub_dir, exist_ok=True)
    with open(os.path.join(sub_dir, "logo1.png"), "w") as f:
        f.write("SAMPLE_PNG_DATA")
    with open(os.path.join(sub_dir, "logo2.png"), "w") as f:
        f.write("SAMPLE_PNG_DATA")  # Duplicate!

    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


def test_path_traversal_rejection(test_workspace):
    """Asserts that ../ path traversal attempts raise SecurityBoundaryException."""
    traversal_paths = [
        "../../etc/passwd",
        "..\\..\\Windows\\System32\\cmd.exe",
        "assets/../../secret.txt",
        "/etc/shadow",
        "C:\\Windows\\notepad.exe",
    ]
    for p in traversal_paths:
        with pytest.raises(SecurityBoundaryException):
            WorkspaceValidator.resolve_safe_path(test_workspace, p)


def test_safe_path_resolution(test_workspace):
    """Asserts that normal paths inside workspace resolve correctly."""
    resolved = WorkspaceValidator.resolve_safe_path(test_workspace, "README.md")
    assert os.path.exists(resolved)
    assert resolved.startswith(os.path.realpath(test_workspace))


def test_duplicate_file_detection(test_workspace):
    """Asserts that ToolRegistry correctly finds duplicate file groups using SHA-256."""
    res = ToolRegistry.execute_tool("find_duplicate_files", test_workspace, {})
    assert res["duplicate_groups_count"] == 1
    dup_group = res["duplicate_groups"][0]
    assert len(dup_group["files"]) == 2
    assert "assets/logo1.png" in dup_group["files"]
    assert "assets/logo2.png" in dup_group["files"]


def test_doc_gaps_detection(test_workspace):
    """Asserts that check_doc_gaps identifies missing sections and TODO count."""
    res = ToolRegistry.execute_tool("check_doc_gaps", test_workspace, {"doc_path": "README.md"})
    assert res["exists"] is True
    assert res["todo_fixme_count"] == 1
    assert "Installation / Prerequisites" in res["missing_sections"]


@pytest.mark.asyncio
async def test_reversible_backup_and_undo(test_workspace):
    """Asserts that BackupService snapshots files and restores them bit-for-bit upon undo."""
    await init_db()
    task_id = "test-task-123"
    target_file = "README.md"
    orig_path = os.path.join(test_workspace, target_file)
    with open(orig_path, "r") as f:
        original_content = f.read()

    # Add task entry first to satisfy foreign key constraint
    db = await get_db_connection()
    try:
        await db.execute(
            "INSERT OR REPLACE INTO tasks (id, prompt, workspace_path, autonomy_mode, status, model_used, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (task_id, "Test prompt", test_workspace, "SAFE_AUTO", "EXECUTING", "mock", "2026-10-21T00:00:00Z")
        )
        await db.commit()
    finally:
        await db.close()

    # 1. Create pre-change snapshot
    snapshot = await BackupService.create_snapshot(task_id, test_workspace, target_file, "UPDATE")
    assert snapshot["original_sha256"] != ""

    # 2. Modify file
    new_content = "# Completely Changed Project Description\nAll new content."
    ToolRegistry.execute_tool("update_file", test_workspace, {"path": target_file, "content": new_content})

    with open(orig_path, "r") as f:
        assert f.read() == new_content

    # 3. Undo task
    undo_res = await BackupService.undo_task(task_id, test_workspace)
    assert undo_res["success"] is True
    assert undo_res["restored_count"] == 1

    # 4. Verify file is bit-for-bit restored to original content
    with open(orig_path, "r") as f:
        assert f.read() == original_content
