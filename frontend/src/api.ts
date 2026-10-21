import type { Task, Routine, RadarReport } from "./types";

const API_BASE = "http://127.0.0.1:8000/api/v1";

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function validateWorkspace(path: string) {
  const res = await fetch(`${API_BASE}/workspaces/validate?path=${encodeURIComponent(path)}`);
  return res.json();
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
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create task");
  }
  return res.json();
}

export async function getTask(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`);
  return res.json();
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
  return res.json();
}

export async function undoTask(taskId: string, workspacePath: string) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/undo?workspace_path=${encodeURIComponent(workspacePath)}`, {
    method: "POST",
  });
  return res.json();
}

export async function getReceipt(taskId: string) {
  const res = await fetch(`${API_BASE}/receipts/${taskId}`);
  return res.json();
}

export async function listRoutines(): Promise<Routine[]> {
  const res = await fetch(`${API_BASE}/routines`);
  return res.json();
}

export async function createRoutine(name: string, description: string, taskId: string, workspacePath: string) {
  const params = new URLSearchParams({ name, description, task_id: taskId, workspace_path: workspacePath });
  const res = await fetch(`${API_BASE}/routines?${params.toString()}`, { method: "POST" });
  return res.json();
}

export async function scanRadar(workspacePath: string): Promise<RadarReport> {
  const res = await fetch(`${API_BASE}/radar/scan?workspace_path=${encodeURIComponent(workspacePath)}`);
  return res.json();
}

export async function getModels() {
  const res = await fetch(`${API_BASE}/models`);
  return res.json();
}

export async function auditDocs(workspacePath: string, docPath: string = "README.md") {
  const res = await fetch(
    `${API_BASE}/audit/docs?workspace_path=${encodeURIComponent(workspacePath)}&doc_path=${encodeURIComponent(docPath)}`
  );
  return res.json();
}

export async function getDuplicateFiles(workspacePath: string) {
  const res = await fetch(`${API_BASE}/cleanup/duplicates?workspace_path=${encodeURIComponent(workspacePath)}`);
  return res.json();
}
