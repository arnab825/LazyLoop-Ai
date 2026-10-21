# System Architecture Specification — LazyLoop AI

## 1. Architectural Philosophy

LazyLoop AI is engineered around the principle of **Defense-in-Depth for Agentic Automation**:
1. **AI as Planner, Not Root:** The AI model is strictly a heuristic planner that outputs structured JSON. It never interacts with the OS or filesystem directly.
2. **Schema & Sandbox Boundary:** Plans pass through a rigorous schema validator and a sandboxed tool executor that prevents workspace breakouts.
3. **Deterministic Verification:** The application does not trust the AI's claim that a task succeeded. Success is verified solely by deterministic hash calculations, file existence checks, and diff validations.
4. **Local Sovereignty:** Storage, inference, execution, and verification occur on the user's local machine.

---

## 2. Layered Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                   |
|  React 19 + TypeScript (Strict) + Vite + Light Neo-Brutalist Design System              |
|  Views: Overview | New Task Studio | Execution Timeline | Receipts | Routines | Lab    |
+-----------------------------------------------------------------------------------------+
                                           | HTTP / SSE Stream
+-----------------------------------------------------------------------------------------+
|                                    APPLICATION LAYER                                    |
|  FastAPI Router: /api/v1/tasks, /api/v1/routines, /api/v1/receipts, /api/v1/models     |
|  Middleware: Loopback Host Enforcer, Strict CORS, Request Logging                       |
+-----------------------------------------------------------------------------------------+
       |                                           |                                |
       v                                           v                                v
+------------------+                    +---------------------+           +---------------+
| PLANNING DOMAIN  |                    |  EXECUTION DOMAIN   |           | ROUTINE DOMAIN|
| Model Adapters   |                    |  Approval Engine    |           | Routine DNA   |
| (Ollama / Mock)  |                    |  Tool Registry      |           | Preconditions |
| Plan Validator   |                    |  Backup Service     |           | Drift Checker |
| Risk Classifier  |                    |  Verify Engine      |           +---------------+
+------------------+                    +---------------------+
       |                                           |
       +-------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                                    PERSISTENCE LAYER                                    |
|  SQLite 3 (WAL Mode)                                                                    |
|  Repositories: TaskRepository, RoutineRepository, ReceiptRepository, SettingsRepo      |
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
|                                  LOCAL FILESYSTEM LAYER                                 |
|  Target Workspace Directory (Isolated) & Backup Store (.lazyloop/backups/)             |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Core Subsystems

### 3.1 Model Adapter Subsystem
- Abstract Base Class: `ModelProvider`
- Implementations:
  - `OllamaProvider`: Communicates with `http://127.0.0.1:11434/api/generate` using `format: "json"`.
  - `DeterministicMockProvider`: Deterministic heuristic generator for offline testing, benchmarks, and environments where Ollama is unavailable.
- Failover: If Ollama is unreachable, LazyLoop allows switching smoothly to the mock provider with honest UI status.

### 3.2 Workspace & Security Subsystem
- `WorkspaceValidator`:
  - Resolves symlinks using `os.path.realpath`.
  - Asserts that all read/write paths strictly start with `workspace_root`.
  - Blocks path traversal strings (`..`, `/`, `\`, null bytes).
  - Explicitly protects internal directories like `.git/` unless specifically authorized.

### 3.3 Backup & Undo Subsystem
- `BackupService`:
  - Maintains task-specific backup directories: `.lazyloop/backups/<task_id>/`.
  - Creates pre-change copies and computes pre-change SHA-256 hashes.
  - Implements reversible `undo_task()` that iterates backwards and restores files to their verified baseline.

### 3.4 Verification & Receipt Subsystem
- `VerificationEngine`:
  - Executes deterministic assertions after tool execution.
  - Generates verifiable evidence records:
    - `file_sha256_match`: Target file SHA-256 matches expected content hash.
    - `file_absence`: Deleted file no longer exists on disk.
    - `file_presence`: Created file exists with non-zero size.
- `ReceiptService`:
  - Collates planned steps, approved steps, executed steps, and verification records into an immutable Proof-of-Work receipt.
