# Technical Requirements Document (TRD) — LazyLoop AI

## 1. System Architecture & Technical Stack

### 1.1 Core Technologies

| Layer | Technology | Version | Rationale & Responsibility |
|---|---|---|---|
| **Frontend Framework** | React | 19.x | Modern UI components, Server Components compatibility, declarative rendering. |
| **Language (Frontend)** | TypeScript | 5.x (Strict) | End-to-end type safety, reliable API contract alignment. |
| **Styling & Design System** | Light Neo-Brutalism (Vanilla CSS) | Custom Tokens | High-contrast tactile design system with warm canvas, solid black borders, and hard drop shadows. |
| **Backend Framework** | FastAPI | 0.115+ | High-performance Python async REST API, auto OpenAPI docs, Pydantic v2 validation. |
| **Language (Backend)** | Python | 3.12+ | Clean async/await syntax, standard typing, robust OS path handling. |
| **Persistence (Local)** | SQLite 3 | Embedded | Zero-dependency, file-based SQL ACID storage. Clean repository pattern for future Postgres. |
| **Inference Runtime** | Ollama | Local HTTP | Runs open-weight GGUF models (`llama3.2`, `qwen2.5:coder`) over local loopback (`http://127.0.0.1:11434`). |
| **Testing** | Pytest / Vitest | Latest | Robust automated testing across Python backend and React frontend. |

---

## 2. Component Boundaries & Isolation

```
+------------------------------------------------------------------------------------+
|                                React 19 Frontend                                   |
| (UI Components, State, SSE Stream Listener, Diff Viewer, Routine & Receipt Studio) |
+------------------------------------------------------------------------------------+
                                      | HTTP REST / SSE Stream (127.0.0.1:8000)
+------------------------------------------------------------------------------------+
|                                FastAPI Backend Engine                              |
|  +--------------------+   +-----------------------+   +-------------------------+  |
|  | Task Coordinator   |-->| Plan Schema Validator |-->| Risk & Approval Engine  |  |
|  +--------------------+   +-----------------------+   +-------------------------+  |
|            |                         |                             |               |
|            v                         v                             v               |
|  +--------------------+   +-----------------------+   +-------------------------+  |
|  | AI Model Adapter   |   | Backup & Undo Service |   | Sandboxed Tool Registry |  |
|  | (Ollama / Mock)    |   | (.lazyloop/backups/)  |   | (Only Allowed Tools)    |  |
|  +--------------------+   +-----------------------+   +-------------------------+  |
|                                                                    |               |
|                                                                    v               |
|                                                       +-------------------------+  |
|                                                       |  Deterministic Verify   |  |
|                                                       |  (SHA-256 / File State) |  |
+------------------------------------------------------------------------------------+
              |                                                      |
              v                                                      v
     SQLite Database (data/lazyloop.db)             Designated Workspace Directory
```

---

## 3. Sandboxed Tool Registry Specification

To prevent security vulnerabilities, the application strictly forbids raw terminal command execution (`bash`, `sh`, `cmd`, `powershell`). Only allowlisted tools in `ToolRegistry` can execute.

| Tool Name | Risk Tier | Input Parameters | Safety Precondition | Verification Postcondition | Can Undo? |
|---|---|---|---|---|---|
| `list_directory` | `READ_ONLY` | `path: str`, `depth: int` | Path must resolve within workspace root. | None (read only). | N/A |
| `read_file` | `READ_ONLY` | `path: str`, `max_lines: int` | Path must resolve within workspace root. | None (read only). | N/A |
| `find_duplicate_files`| `READ_ONLY` | `subfolder: Optional[str]` | Subfolder within workspace. | Returns file groups with matching SHA-256. | N/A |
| `check_doc_gaps` | `READ_ONLY` | `doc_path: str` | Path within workspace. | Returns missing headers/checkpoints. | N/A |
| `create_file` | `LOW` | `path: str`, `content: str` | Target file must NOT already exist without explicit overwrite flag. | Verify file exists and SHA-256 matches content. | Yes (delete created file). |
| `update_file` | `LOW` | `path: str`, `content: str` | Target file exists; snapshot taken to backup. | Verify file exists, SHA-256 matches, diff generated. | Yes (restore from snapshot). |
| `delete_file` | `HIGH_DESTRUCTIVE` | `path: str` | Target exists; snapshot taken to backup. | Verify file no longer exists at path. | Yes (restore from snapshot). |
| `move_file` | `LOW` | `src: str`, `dest: str` | Source exists, dest in workspace, snapshot taken. | Verify src is gone, dest exists with identical SHA-256. | Yes (move back). |

---

## 4. Reversible Automation & Backup Specification

1. When a task requires executing any modifying tool (`create_file`, `update_file`, `delete_file`, `move_file`), the `BackupService` intercepts the operation:
   - Creates a dedicated backup directory: `<workspace>/.lazyloop/backups/<task_id>/`.
   - Records metadata in SQLite `change_records` table: original path, backup path, original SHA-256 hash, operation type, timestamp.
   - For `update_file` or `delete_file`, copies the exact original file to the backup directory before touching the live file.
2. An `undo_task(task_id)` endpoint reads `change_records` in reverse chronological order and restores each file bit-for-bit, confirming restored SHA-256 hashes against original records.

---

## 5. Persistence & SQLite Schema Architecture

Local persistence uses standard SQLite 3 with WAL (Write-Ahead Logging) mode enabled for high concurrency and zero lockups.

Tables:
- `tasks`: Core task lifecycle, original prompt, autonomy level, workspace path, status.
- `task_steps`: Individual steps of the execution plan (tool, arguments, risk tier, status).
- `approvals`: Cryptographic/secure random approval tokens bound to specific step hashes and arguments.
- `change_records`: Pre-modification file snapshots, original hashes, backup file paths.
- `verification_results`: Deterministic check logs (method, target, expected, actual, passed boolean).
- `execution_receipts`: Tamper-evident Proof-of-Work receipts, summary JSON, execution timestamps, avoided manual time.
- `routines`: Saved "Routine DNA" templates, preconditions, parameters, versioning, drift hash.
- `application_settings`: Local configuration (selected Ollama model, default autonomy mode, baseline manual times).
