# Software Requirements Specification (SRS) — LazyLoop AI

## 1. Introduction & Traceability

This document defines the formal functional and non-functional requirements for LazyLoop AI with persistent, testable requirement identifiers. Every requirement maps directly to code modules and automated test cases.

---

## 2. Functional Requirements (FR)

### Task Ingestion & Planning
- **FR-TASK-001 (Task Submission):** The system shall accept a natural-language task prompt and an explicit workspace directory path from the user.
- **FR-TASK-002 (Autonomy Mode Selection):** The system shall support autonomy modes: `REVIEW_ALL` (require confirmation on every action), `SAFE_AUTO` (auto-execute read-only, require approval for modifications), and `DRY_RUN` (simulate execution without changing files).
- **FR-PLAN-001 (Schema Validation):** The system shall validate any model-generated task plan against a strict Pydantic JSON schema before displaying or executing it.
- **FR-PLAN-002 (Bounded Retry on Malformed Output):** If the AI model returns malformed JSON or invalid tool arguments, the system shall attempt bounded correction (max 2 retries) before safely failing with a transparent error message.
- **FR-PLAN-003 (Deterministic Fallback Planner):** The system shall include an offline deterministic planner capable of processing smart project cleanup, duplicate detection, and documentation gap checks without an active LLM.

### Security, Boundaries & Approvals
- **FR-SEC-001 (Workspace Boundary Check):** The system shall reject any operation targeting paths outside the designated workspace root, resolving symlinks to prevent traversal.
- **FR-SEC-002 (Path Traversal Rejection):** The system shall explicitly sanitize and reject paths containing `..` or leading slashes attempting root breakout.
- **FR-SEC-003 (Tool Allowlisting):** The system shall only execute tools registered in the internal `ToolRegistry`. Raw shell execution (`exec`, `bash`, `cmd`) is strictly forbidden.
- **FR-APP-001 (Action Approval Tokens):** The system shall generate a unique cryptographic token for each proposed modification step, bound strictly to the step ID and parameter hash.
- **FR-APP-002 (No Phantom Approvals):** An approval token granted for one step shall not be accepted for any other step or altered parameters.

### Execution, Backup & Verification
- **FR-EXEC-001 (Pre-Execution Snapshot):** Before modifying or deleting any file, the system shall snapshot the file to `.lazyloop/backups/<task_id>/` and record its pre-change SHA-256 hash.
- **FR-EXEC-002 (Safe Execution Engine):** The system shall execute only approved steps in deterministic sequential order.
- **FR-VERIFY-001 (Deterministic Verification):** The system shall verify each executed modification using postcondition checks (SHA-256 hash match, file presence, or file absence).
- **FR-VERIFY-002 (Accurate Status Separation):** The system shall report `SUCCESS`, `FAILED`, `SKIPPED`, and `UNVERIFIED` steps distinctly. An unverified step shall never be marked as successful.
- **FR-UNDO-001 (Reversible Automation):** The system shall provide an undo mechanism that restores modified or deleted files from `.lazyloop/backups/` bit-for-bit, confirming restored SHA-256 hashes.

### Proof-of-Work, Routines & Productivity
- **FR-RECEIPT-001 (Proof-of-Work Receipt):** Upon task completion or termination, the system shall generate an immutable receipt containing original prompt, planned vs approved vs executed steps, verification hashes, latency, and estimated manual time avoided.
- **FR-RECEIPT-002 (Receipt Export):** The system shall allow users to view and export the Proof-of-Work receipt as standard JSON.
- **FR-ROUTINE-001 (Routine DNA Extraction):** The system shall allow users to save a successful execution sequence as a named "Routine" with preconditions, parameters, and versioning.
- **FR-ROUTINE-002 (Routine Drift Detection):** Before replaying a routine, the system shall verify workspace preconditions (directory existence, file state) and halt for review if drift is detected.
- **FR-RADAR-001 (Procrastination Radar):** The system shall scan the designated workspace for common neglected maintenance: missing README, missing installation instructions, duplicate asset files, and TODO/FIXME markers.
- **FR-BUDGET-001 (Lazy Budget Metrics):** The system shall record real wall-clock execution duration, model inference latency, and human intervention time, clearly distinguishing measured values from manual-time-saved estimates.

---

## 3. Non-Functional Requirements (NFR)

### Security & Privacy
- **NFR-SEC-001 (Loopback Default):** The backend service shall bind exclusively to `127.0.0.1` by default.
- **NFR-SEC-002 (CORS Restriction):** Cross-Origin Resource Sharing (CORS) shall be restricted strictly to the configured local frontend origin (`http://localhost:5173`).
- **NFR-SEC-003 (Local-First Data Retention):** No workspace file contents or execution history shall be transmitted to external servers without explicit user configuration.

### Reliability & Resilience
- **NFR-REL-001 (Persistent State):** All task histories, receipts, and routines stored in SQLite shall persist reliably across process restarts.
- **NFR-REL-002 (Crash Recovery):** If an execution is interrupted, the system shall mark the in-flight step as `INTERRUPTED` and provide full recovery and undo options upon restart.

### Usability & Accessibility
- **NFR-UX-001 (Aesthetic Standard):** The interface shall feature a refined dark graphite background with neon-green accents, clear typographic hierarchy, and responsive layout.
- **NFR-UX-002 (Clear Diff Visualizer):** All file modifications shall present before-and-after visual diffs before user approval.
- **NFR-UX-003 (Accessibility):** The frontend shall conform to WCAG 2.1 AA standards for contrast, keyboard navigation, and aria attributes.
