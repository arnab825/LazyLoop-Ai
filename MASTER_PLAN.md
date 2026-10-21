# LazyLoop AI — Comprehensive Master Implementation Plan

> **Product Tagline:** *"Do less busywork. Get proof, not promises."*  
> **Challenge Target:** DEV Community Hacktoberfest 2026 "Slow and Steady" Challenge  
> **Environment Context:** Windows OS, Python 3.12.10, Node v24.12.0, npm 11.12.1, SQLite, Ollama / Deterministic Mock Provider fallback.

---

## 1. Executive Summary & Architectural Decisions

LazyLoop AI is an open-source, local-first workflow automation assistant designed to eliminate digital busywork while ensuring **user control, safety, proof of execution, and reversibility**. The AI model acts strictly as a **planner/proposer**, never as an unconstrained executor. Every file modification requires explicit human approval, creates automatic backups, runs deterministic verification checks (e.g. SHA-256 hashes, file existence, content checks), and produces a tamper-evident **Proof-of-Work Receipt**.

### Key Architectural Boundaries
1. **Frontend:** React 19 + TypeScript (Strict) + Vite + Tailwind CSS v4 + React Router. Dark graphite palette (`#0F1117` / `#161922`) with restrained neon-green / emerald accents (`#10B981` / `#059669`).
2. **Backend:** Python 3.12 + FastAPI + Pydantic v2 + SQLite (with clean repository/service pattern for future PostgreSQL transition) + Server-Sent Events (SSE) for real-time task progression.
3. **AI Layer:** Replaceable Model Adapter Interface. Supports local **Ollama** (`llama3.2:3b`, `qwen2.5:coder`, etc.) with built-in fallback to an intelligent **Deterministic Mock Provider** (allowing testing and local analysis even if Ollama is not installed or running).
4. **Security & Sandbox:** 
   - Strict workspace boundary enforcement (`os.path.realpath`, resolving symlinks).
   - Path traversal prevention (`..` checks, anchor validation).
   - Tool allowlisting with Pydantic schema validation.
   - Exact-action approval binding (tokens bound to exact proposed action hash and parameters).
   - Automatic dry-run previews and reversible file backups in `.lazyloop/backups/`.

---

## 2. Target Documentation Structure (`docs/`)

Per requirements, documentation is treated as a first-class citizen. Before and alongside implementation, the following documentation structure will be created:

```
docs/
  README.md                   # Documentation Index & navigation
  PRD.md                      # Product Requirements Document
  TRD.md                      # Technical Requirements Document
  SRS.md                      # Software Requirements Specification (stable IDs: FR-*, NFR-*)
  ARCHITECTURE.md             # System architecture & component responsibilities
  DATA_FLOW.md                # Request, plan, approval, execution, and receipt data flow
  DATABASE_DESIGN.md          # SQLite schema, tables, relations, and migration roadmap
  API_SPECIFICATION.md        # Full OpenAPI/FastAPI endpoint reference with schemas
  SECURITY.md                 # Security policies, boundaries, threat model
  THREAT_MODEL.md             # Threat enumeration, STRIDE analysis, mitigations
  UI_UX_SPECIFICATION.md      # Design system tokens, navigation, views, accessibility
  AI_MODEL_STRATEGY.md        # Local model adapters, Ollama integration, structured prompts
  TEST_PLAN.md                # Unit, integration, security, and benchmark test plans
  TEST_REPORT.md              # Real execution logs, pass/fail results, and coverage
  DEPLOYMENT.md               # Windows/Linux setup, Ollama config, Podman instructions
  CONFIGURATION.md            # Environment variables and configuration reference
  ERROR_HANDLING.md           # Error taxonomy, recovery procedures, and edge cases
  LOGGING_AND_MONITORING.md   # Privacy-preserving logging and audit events
  BACKUP_AND_RECOVERY.md      # Snapshot mechanisms, undo engine, failure recovery
  BENCHMARKS.md               # Repeatable benchmark suite & manual vs auto metrics
  ROADMAP.md                  # Implemented vs in-progress vs future milestones
  DECISIONS.md                # Architecture Decision Records (ADRs)
  CONTRIBUTING.md             # Contribution guidelines, code style, PR process
  RELEASE_NOTES.md            # Version release notes
  HACKTOBERFEST_SUBMISSION.md # Submission writeup for DEV Hacktoberfest 2026
  diagrams/
    system_architecture.mmd   # System architecture diagram (Mermaid)
    task_execution_flow.mmd   # Task planning & execution state machine
    database_relationships.mmd# Entity-relationship diagram
    security_boundaries.mmd   # Security perimeters and data flow
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Project Setup, Architecture & Documentation Foundation
- Initialize repository structure: `backend/`, `frontend/`, `docs/`, `tests/`.
- Create foundational root files: `README.md`, `LICENSE` (Apache 2.0 or MIT), `.gitignore`, `.env.example`, `CONTRIBUTING.md`, `CHANGELOG.md`.
- Author foundational docs: `docs/README.md`, `docs/PRD.md`, `docs/TRD.md`, `docs/SRS.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and all 4 Mermaid diagrams.

### Phase 2: FastAPI Backend Core & Security Sandbox Engine
- Set up Python virtual environment, dependencies (`fastapi`, `uvicorn`, `pydantic`, `pytest`, `aiosqlite`, `sqlalchemy` or lightweight raw SQL repository, `httpx`).
- Implement **Workspace Sandbox Engine**:
  - `WorkspaceValidator`: verifies paths stay strictly inside user-configured workspace root. Detects symlink escapes, path traversals (`..`), system directories.
- Implement **Tool Registry & Execution Engine**:
  - Registered safe tools: `list_directory`, `read_file`, `find_duplicate_files`, `check_doc_gaps`, `create_file`, `update_file`, `delete_file`, `move_file`.
  - Risk classification (`READ_ONLY`, `LOW`, `HIGH_DESTRUCTIVE`).
  - Precondition checks & Postcondition verification (SHA-256 hash checks, file presence).
- Implement **Backup & Reversible Automation Service**:
  - Generates `.lazyloop/backups/<task_id>/` snapshots before modifying files.
  - Implements reliable `undo` restoring exact original bytes.
- Set up SQLite Database & Schema (Tasks, Steps, Approvals, Receipts, Routines, Settings).
- Implement Deterministic Mock Model Provider for testing without Ollama.

### Phase 3: AI Inference & Structured Plan Validation
- Implement Model Adapter interface (`ModelProvider` abstract base class).
- Implement `OllamaProvider` connecting to local Ollama API (`/api/generate` with strict JSON schema format).
- Implement `DeterministicMockProvider` with predefined deterministic planning logic for smart project cleanup, docs checks, and duplicate detection.
- Implement strict Pydantic Plan Validator:
  - Validates model output against strict JSON schema.
  - Normalizes operations, flags unsupported actions, calculates plan risk.
  - Bounded retries and error correction prompts on schema violations.

### Phase 4: Execution Engine, Verification & Proof-of-Work Receipts
- Implement Execution State Machine:
  - `PENDING_PLAN` -> `PLAN_GENERATED` -> `AWAITING_APPROVAL` -> `EXECUTING` -> `VERIFYING` -> `COMPLETED` / `FAILED`.
- Approval Engine: cryptographic/unique token per action; prevents approval tampering.
- Verification Engine: deterministic evidence gathering (file hash before/after, existence checks, diff generation).
- **Proof-of-Work Receipt Generator**:
  - Generates machine-readable and exportable JSON receipts: planned vs approved vs executed vs verified, execution time, avoided manual time calculation.

### Phase 5: Distinctive Features Backend
- **Feature A: Routine DNA (`routines` table)**:
  - Save completed plan as reusable routine with parameters, preconditions, approval requirements.
  - Routine replay with drift detection (verifies if directories/files changed before replaying).
- **Feature C: Procrastination Radar**:
  - Analyzes workspace for common neglected maintenance: missing README, missing setup instructions, TODO/FIXME clusters, orphan/duplicate assets.
- **Feature D: Lazy Budget**:
  - Measures execution wall-clock time, model latency, manual time avoided calculation.
- **Feature G: Lazy vs Manual Decision Engine**:
  - Estimates risk, complexity, manual effort vs automation overhead before task start.
- **Feature I: Model Swap Lab**:
  - Endpoints to list local Ollama models, test latency and JSON compliance.

### Phase 6: React 19 + Vite + Tailwind CSS v4 Frontend
- Initialize Vite + React 19 + TypeScript template.
- Build modern Dark Graphite + Neon Green design system:
  - Header with local status, workspace selector, and model connection indicator.
  - Sidebar / Navigation: Overview, New Task, Routines, Execution History, Proof-of-Work, Procrastination Radar, Model Lab, Settings.
- View 1: **Overview Dashboard** (stats, verified rate, pending approvals, recent tasks, budget summary).
- View 2: **New Task Studio** (natural language prompt, workspace selector, autonomy level, dynamic plan preview, risk badges, action approval modal).
- View 3: **Live Execution & Verification Timeline** (real-time progress, diff viewer, verification badges, dry-run vs actual, cancel/undo button).
- View 4: **Proof-of-Work Receipts Viewer** (view receipt breakdown, verification evidence table, export JSON receipt).
- View 5: **Routines Manager** (inspect, edit, replay, drift detection alerts).
- View 6: **Procrastination Radar** (impact/urgency radar, 1-click routine generation).
- View 7: **Model Swap Lab** (benchmark prompt, latency tester, Ollama model switcher).
- View 8: **Settings & Workspace Permissions** (allowed directories, safe boundaries, backup retention).

### Phase 7: Automated Testing & Verification Suite
- Backend Pytest suite:
  - Path traversal and security boundary tests.
  - Plan schema validation and rejection tests.
  - Backup creation and undo restoration tests.
  - Hash verification and proof-of-work generation tests.
  - Routine save, replay, and drift detection tests.
- Frontend test suite (Vitest + React Testing Library).
- Synthetic test workspace generator for reproducible benchmarks.

### Phase 8: Benchmarks, Containerization & Polish
- Podman / Docker configuration (`Containerfile` / `docker-compose.yml`).
- Benchmark runner comparing manual baseline vs LazyLoop automated execution.
- Update `TEST_REPORT.md` and `BENCHMARKS.md` with verified runs.
- Final polish of all documentation, screenshots, and Hacktoberfest submission artifact.

---

## 4. Verification & Demonstration Plan

1. **Security Verification:** Run test vectors trying `../../`, symlinks escaping workspace, unauthorized write operations; confirm immediate rejection.
2. **End-to-End Smart Project Cleanup Demo:**
   - Create synthetic test workspace (`tests/fixtures/sample_workspace`) with duplicate assets, missing README sections, and temp files.
   - Run task: "Analyze project folder, detect duplicate files, find documentation gaps, prepare cleanup plan."
   - AI proposes plan -> user reviews dry-run diffs -> user approves modifications -> system creates backup -> executes -> verifies SHA-256 and file states -> generates Proof-of-Work receipt -> saves as "Routine DNA".
   - Test Undo: trigger undo, verify workspace state is restored bit-for-bit.
   - Replay Routine: trigger routine on modified workspace; verify drift detection triggers review.
