# API Specification — LazyLoop AI

## 1. Overview & Conventions
- **Base URL:** `http://127.0.0.1:8000/api/v1`
- **Content-Type:** `application/json`
- **Real-Time Stream:** Server-Sent Events (`text/event-stream`)
- **Default Error Structure:**
  ```json
  {
    "detail": {
      "error_code": "WORKSPACE_ESCAPE_VIOLATION",
      "message": "Target path resolves outside authorized workspace root."
    }
  }
  ```

---

## 2. Core Endpoints

### 2.1 Workspace & System
- `GET /health`: Healthcheck, version, Ollama connection status, database status.
- `GET /workspaces/validate?path=<path>`: Validates that a directory exists, is readable, and safe to use as a workspace.

### 2.2 Tasks & Execution
- `POST /tasks`: Initiate a new task.
  - **Request Body:**
    ```json
    {
      "prompt": "Find duplicate assets and clean up temporary markdown drafts",
      "workspace_path": "D:/projects/my-app",
      "autonomy_mode": "SAFE_AUTO",
      "preferred_model": "llama3.2"
    }
    ```
  - **Response (201 Created):**
    ```json
    {
      "task_id": "8f3b23e1-...",
      "status": "PLANNING",
      "steps": []
    }
    ```
- `GET /tasks/{task_id}`: Fetch task details, steps, approval status, and receipt.
- `GET /tasks/{task_id}/stream`: SSE endpoint streaming live task events (`step_started`, `step_completed`, `awaiting_approval`, `verifying`, `done`).
- `POST /tasks/{task_id}/plan`: Trigger plan generation (if created as draft).
- `POST /tasks/{task_id}/execute`: Trigger execution for approved steps.
- `POST /tasks/{task_id}/cancel`: Stop task execution safely.
- `POST /tasks/{task_id}/undo`: Restore backed-up files from `.lazyloop/backups/{task_id}`.

### 2.3 Approvals
- `POST /tasks/{task_id}/approvals`: Approve or reject specific action steps.
  - **Request Body:**
    ```json
    {
      "approval_tokens": [
        {
          "step_id": "step-1",
          "token": "d748f2c3-...",
          "action": "APPROVE"
        }
      ]
    }
    ```

### 2.4 Receipts & Proof-of-Work
- `GET /receipts/{task_id}`: Fetch the immutable Proof-of-Work receipt with verification hashes and manual time saved.
- `GET /receipts/{task_id}/export`: Download receipt as a standalone `.json` file.

### 2.5 Routines (Routine DNA)
- `GET /routines`: List all saved routines.
- `POST /routines`: Create a new routine from a completed task.
- `GET /routines/{routine_id}`: Get routine details, preconditions, and version history.
- `POST /routines/{routine_id}/run`: Replay a routine against a workspace, running drift detection first.

### 2.6 Procrastination Radar & Model Lab
- `GET /radar/scan?workspace_path=<path>`: Scan workspace for missing README sections, duplicate assets, and TODO/FIXME markers.
- `GET /models`: List installed Ollama models and available mock providers.
- `POST /models/test`: Run structured plan compliance test and measure latency.
