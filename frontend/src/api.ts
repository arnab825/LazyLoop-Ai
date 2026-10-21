import type { Task, Routine, RadarReport } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api/v1";

async function handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    let msg = `${fallbackError} (${res.status})`;
    try {
      const err = await res.json();
      msg = err.detail || err.message || msg;
    } catch {
      msg = `${fallbackError}: Server responded with HTTP ${res.status} ${res.statusText}`;
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse(res, "Health check failed");
}

export async function validateWorkspace(path: string) {
  const res = await fetch(`${API_BASE}/workspaces/validate?path=${encodeURIComponent(path)}`);
  return handleResponse(res, "Workspace validation failed");
}

export async function createTask(
  prompt: string,
  workspace_path: string,
  autonomy_mode: string = "SAFE_AUTO",
  preferred_model?: string
): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, workspace_path, autonomy_mode, preferred_model }),
  });
  return handleResponse<Task>(res, "Failed to create task");
}

export async function getTask(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`);
  return handleResponse<Task>(res, "Failed to retrieve task");
}

export async function submitApprovals(
  taskId: string,
  approvals: { step_id: string; token: string; approved: boolean }[]
): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/approvals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvals }),
  });
  return handleResponse<Task>(res, "Failed to submit approvals");
}

export async function undoTask(taskId: string, workspacePath: string) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/undo?workspace_path=${encodeURIComponent(workspacePath)}`, {
    method: "POST",
  });
  return handleResponse(res, "Failed to undo task");
}

export async function getReceipt(taskId: string) {
  const res = await fetch(`${API_BASE}/receipts/${taskId}`);
  return handleResponse(res, "Failed to retrieve receipt");
}

export async function listRoutines(): Promise<Routine[]> {
  const res = await fetch(`${API_BASE}/routines`);
  return handleResponse<Routine[]>(res, "Failed to list routines");
}

export async function createRoutine(name: string, description: string, taskId: string, workspacePath: string) {
  const params = new URLSearchParams({ name, description, task_id: taskId, workspace_path: workspacePath });
  const res = await fetch(`${API_BASE}/routines?${params.toString()}`, { method: "POST" });
  return handleResponse(res, "Failed to create routine");
}

export async function scanRadar(workspacePath: string): Promise<RadarReport> {
  const res = await fetch(`${API_BASE}/radar/scan?workspace_path=${encodeURIComponent(workspacePath)}`);
  return handleResponse<RadarReport>(res, "Radar scan failed");
}

export async function getModels() {
  const res = await fetch(`${API_BASE}/models`);
  return handleResponse(res, "Failed to retrieve models");
}

export async function auditDocs(workspacePath: string, docPath: string = "README.md") {
  const res = await fetch(
    `${API_BASE}/audit/docs?workspace_path=${encodeURIComponent(workspacePath)}&doc_path=${encodeURIComponent(docPath)}`
  );
  return handleResponse(res, "Documentation audit failed");
}

export async function getDuplicateFiles(workspacePath: string) {
  const res = await fetch(`${API_BASE}/cleanup/duplicates?workspace_path=${encodeURIComponent(workspacePath)}`);
  return handleResponse(res, "Duplicate check failed");
}
