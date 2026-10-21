"""
End-to-End Orchestrator and Receipt Verification Tests.
Tests full pipeline: Task Creation -> Deterministic Planning -> Action Approval -> Execution -> Proof-of-Work Receipt.
"""
import pytest
import os
import tempfile
import shutil

from app.core.database import init_db
from app.services.task_service import TaskService
from app.models.schemas import AutonomyMode, TaskStatus, StepStatus


@pytest.fixture
def workspace_with_fixtures():
    """Sets up a realistic test workspace fixture with duplicate files and markdown drafts."""
    temp_dir = tempfile.mkdtemp(prefix="lazyloop_e2e_ws_")
    
    # 1. README
    with open(os.path.join(temp_dir, "README.md"), "w", encoding="utf-8") as f:
        f.write("# Demo App\nTODO: document setup\n")
        
    # 2. Duplicate assets
    assets = os.path.join(temp_dir, "public")
    os.makedirs(assets, exist_ok=True)
    with open(os.path.join(assets, "hero.png"), "w") as f:
        f.write("PIXEL_CONTENT_HERO")
    with open(os.path.join(assets, "hero_copy.png"), "w") as f:
        f.write("PIXEL_CONTENT_HERO")

    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.mark.asyncio
async def test_end_to_end_smart_cleanup_workflow(workspace_with_fixtures):
    """
    Tests complete 'Smart Project Cleanup' workflow:
    1. User submits natural-language prompt
    2. Deterministic mock provider generates structured plan
    3. Plan is validated against Pydantic schema
    4. Auto-executes read-only steps in SAFE_AUTO mode
    5. Verifies outcomes deterministically
    6. Generates tamper-evident Proof-of-Work receipt
    """
    await init_db()
    prompt = "Analyze my project folder, identify duplicate files, find documentation gaps, and prepare a cleanup plan."
    
    # Create task
    task = await TaskService.create_task(
        prompt=prompt,
        workspace_path=workspace_with_fixtures,
        autonomy_mode=AutonomyMode.SAFE_AUTO,
        preferred_model="mock-deterministic-v1",
    )

    assert task["id"] is not None
    assert task["prompt"] == prompt
    assert len(task["steps"]) >= 3
    assert task["status"] in (TaskStatus.COMPLETED.value, TaskStatus.EXECUTING.value)

    # Inspect steps
    steps = task["steps"]
    tools_planned = [s["tool_name"] for s in steps]
    assert "list_directory" in tools_planned
    assert "find_duplicate_files" in tools_planned
    assert "check_doc_gaps" in tools_planned

    # Inspect Proof-of-Work receipt
    receipt = task.get("receipt")
    assert receipt is not None
    assert receipt["task_id"] == task["id"]
    assert receipt["status"] == TaskStatus.COMPLETED.value
    assert receipt["planned_steps_count"] >= 3
    assert receipt["executed_steps_count"] >= 3
    assert receipt["verified_steps_count"] >= 3
    assert len(receipt["verification_results"]) >= 3
    assert all(v["passed"] for v in receipt["verification_results"])
    assert receipt["manual_time_avoided_minutes"] > 0
