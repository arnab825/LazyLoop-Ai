"""
FastAPI REST API Endpoints for LazyLoop AI.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
import os

from app.models.schemas import TaskCreateRequest, ApprovalRequest, AutonomyMode
from app.services.task_service import TaskService
from app.services.routine_service import RoutineService
from app.services.radar_service import RadarService
from app.services.backup_service import BackupService
from app.adapters.ollama import OllamaProvider
from app.core.config import settings

api_router = APIRouter(prefix="/v1")


@api_router.get("/health")
async def health_check():
    ollama = OllamaProvider(base_url=settings.ollama_base_url)
    ollama_ready = await ollama.is_available()
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.version,
        "ollama_connected": ollama_ready,
        "active_model": settings.default_model,
        "fallback_mock_enabled": settings.fallback_to_mock,
    }


@api_router.get("/workspaces/validate")
async def validate_workspace(path: str = Query(..., description="Target directory path")):
    clean_path = path.strip()
    if not os.path.exists(clean_path):
        return {"valid": False, "error": "Directory does not exist"}
    if not os.path.isdir(clean_path):
        return {"valid": False, "error": "Path is not a directory"}
    return {
        "valid": True,
        "canonical_path": os.path.realpath(clean_path).replace("\\", "/"),
    }


@api_router.post("/tasks")
async def create_task(req: TaskCreateRequest):
    try:
        task = await TaskService.create_task(
            prompt=req.prompt,
            workspace_path=req.workspace_path,
            autonomy_mode=req.autonomy_mode,
            preferred_model=req.preferred_model,
        )
        return task
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/tasks/{task_id}")
async def get_task(task_id: str):
    task = await TaskService.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@api_router.post("/tasks/{task_id}/approvals")
async def submit_approvals(task_id: str, req: ApprovalRequest):
    for item in req.approvals:
        success = await TaskService.approve_step(
            task_id=task_id,
            step_id=item.step_id,
            token=item.token,
            approve=item.approved,
        )
        if not success:
            raise HTTPException(status_code=400, detail=f"Invalid approval token for step {item.step_id}")

    # After processing approvals, execute pending approved steps
    return await TaskService.execute_task(task_id)


@api_router.post("/tasks/{task_id}/undo")
async def undo_task(task_id: str, workspace_path: str = Query(...)):
    result = await BackupService.undo_task(task_id, workspace_path)
    return result


@api_router.get("/receipts/{task_id}")
async def get_receipt(task_id: str):
    task = await TaskService.get_task(task_id)
    if not task or not task.get("receipt"):
        raise HTTPException(status_code=404, detail="Receipt not found for this task")
    return task["receipt"]


@api_router.get("/routines")
async def list_routines():
    return await RoutineService.list_routines()


@api_router.post("/routines")
async def create_routine(name: str, description: str, task_id: str, workspace_path: str):
    return await RoutineService.create_routine(name, description, task_id, workspace_path)


@api_router.get("/routines/{routine_id}/drift")
async def check_routine_drift(routine_id: str, workspace_path: str = Query(...)):
    return await RoutineService.check_drift(routine_id, workspace_path)


@api_router.get("/radar/scan")
async def scan_radar(workspace_path: str = Query(...)):
    return await RadarService.scan_workspace(workspace_path)


@api_router.get("/models")
async def get_models():
    ollama = OllamaProvider(base_url=settings.ollama_base_url)
    is_ready = await ollama.is_available()
    models = await ollama.list_models() if is_ready else []
    return {
        "ollama_available": is_ready,
        "available_models": models,
        "mock_provider_available": True,
        "active_model": settings.default_model if is_ready else "deterministic-mock-v1",
    }


@api_router.get("/audit/docs")
async def audit_docs(workspace_path: str = Query(...), doc_path: str = Query("README.md")):
    from app.tools.registry import ToolRegistry
    return ToolRegistry.execute_tool("check_doc_gaps", workspace_path, {"doc_path": doc_path})


@api_router.get("/cleanup/duplicates")
async def cleanup_duplicates(workspace_path: str = Query(...)):
    from app.tools.registry import ToolRegistry
    return ToolRegistry.execute_tool("find_duplicate_files", workspace_path, {})

