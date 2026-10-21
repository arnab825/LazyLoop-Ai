# Database Design Specification — LazyLoop AI

## 1. Storage Overview

LazyLoop AI uses an embedded SQLite 3 database (`data/lazyloop.db`) configured with:
- **Journal Mode:** Write-Ahead Logging (`PRAGMA journal_mode=WAL;`) for high concurrency.
- **Foreign Keys:** Enabled (`PRAGMA foreign_keys=ON;`) to enforce referential integrity.
- **Synchronous Mode:** Normal (`PRAGMA synchronous=NORMAL;`) for optimal durability without latency bottlenecks.

The database logic is wrapped behind clean Repository classes (`TaskRepository`, `RoutineRepository`, `ReceiptRepository`), ensuring that upgrading to PostgreSQL in a future multi-user release requires zero changes to core business logic.

---

## 2. Table Definitions

### 2.1 `tasks`
Stores the lifecycle and metadata of each initiated workflow.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID string. |
| `prompt` | TEXT | NOT NULL | Original user natural-language instruction. |
| `workspace_path` | TEXT | NOT NULL | Absolute canonical path to the authorized workspace. |
| `autonomy_mode` | TEXT | NOT NULL | `REVIEW_ALL`, `SAFE_AUTO`, or `DRY_RUN`. |
| `status` | TEXT | NOT NULL | `PENDING`, `PLANNING`, `AWAITING_APPROVAL`, `EXECUTING`, `COMPLETED`, `FAILED`, `CANCELLED`. |
| `model_used` | TEXT | NOT NULL | Name of model (e.g. `llama3.2`, `mock-deterministic-v1`). |
| `wall_time_ms` | REAL | DEFAULT 0.0 | Total execution wall clock time in milliseconds. |
| `created_at` | TEXT | NOT NULL | ISO-8601 UTC timestamp. |
| `completed_at` | TEXT | NULL | ISO-8601 UTC timestamp when finalized. |

---

### 2.2 `task_steps`
Represents the individual operations planned by the AI or routine template.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID string. |
| `task_id` | TEXT | NOT NULL, FK(`tasks.id` ON DELETE CASCADE) | Parent task identifier. |
| `step_index` | INTEGER | NOT NULL | Sequence index (0-based). |
| `tool_name` | TEXT | NOT NULL | Registered tool (e.g. `list_directory`, `update_file`). |
| `arguments_json` | TEXT | NOT NULL | JSON string of tool parameters. |
| `risk_tier` | TEXT | NOT NULL | `READ_ONLY`, `LOW`, or `HIGH_DESTRUCTIVE`. |
| `status` | TEXT | NOT NULL | `PENDING`, `APPROVED`, `EXECUTING`, `COMPLETED`, `FAILED`, `SKIPPED`. |
| `error_message` | TEXT | NULL | Reason for failure or skip. |

---

### 2.3 `approvals`
Tracks explicit user approvals for state-changing or high-risk actions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Secure random token (UUID). |
| `task_id` | TEXT | NOT NULL, FK(`tasks.id` ON DELETE CASCADE) | Task identifier. |
| `step_id` | TEXT | NOT NULL, FK(`task_steps.id` ON DELETE CASCADE) | Specific step identifier. |
| `parameter_hash` | TEXT | NOT NULL | SHA-256 hash of step tool arguments preventing tampering. |
| `status` | TEXT | NOT NULL | `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`. |
| `approved_at` | TEXT | NULL | Timestamp of approval. |

---

### 2.4 `change_records`
Backs the Reversible Automation engine by recording pre-change snapshots.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID string. |
| `task_id` | TEXT | NOT NULL, FK(`tasks.id` ON DELETE CASCADE) | Task identifier. |
| `original_path` | TEXT | NOT NULL | Relative path within workspace. |
| `backup_path` | TEXT | NOT NULL | Snapshot path in `.lazyloop/backups/<task_id>/`. |
| `original_sha256`| TEXT | NOT NULL | SHA-256 hash of original file before edit. |
| `action_type` | TEXT | NOT NULL | `CREATE`, `UPDATE`, `DELETE`, `MOVE`. |
| `recorded_at` | TEXT | NOT NULL | Timestamp when snapshot was created. |

---

### 2.5 `verification_results`
Stores deterministic proof of outcomes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID string. |
| `task_id` | TEXT | NOT NULL, FK(`tasks.id` ON DELETE CASCADE) | Task identifier. |
| `step_id` | TEXT | NOT NULL, FK(`task_steps.id` ON DELETE CASCADE) | Step identifier. |
| `target_path` | TEXT | NOT NULL | Target file checked. |
| `verification_method` | TEXT | NOT NULL | `file_sha256_match`, `file_absence`, `file_presence`. |
| `expected_value` | TEXT | NOT NULL | Expected hash or presence state. |
| `actual_value` | TEXT | NOT NULL | Observed hash or presence state. |
| `passed` | INTEGER | NOT NULL | 1 (true) or 0 (false). |

---

### 2.6 `execution_receipts`
Immutable Proof-of-Work receipt generated at task completion.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID string. |
| `task_id` | TEXT | NOT NULL, UNIQUE, FK(`tasks.id` ON DELETE CASCADE) | Task identifier. |
| `receipt_json` | TEXT | NOT NULL | Full verifiable receipt document (JSON). |
| `inference_latency_ms` | REAL | NOT NULL | AI model latency in ms. |
| `execution_latency_ms` | REAL | NOT NULL | Tool execution time in ms. |
| `manual_time_avoided_min` | REAL | NOT NULL | Estimated manual minutes avoided. |
| `generated_at` | TEXT | NOT NULL | Timestamp of receipt creation. |

---

### 2.7 `routines` & `routine_versions`
Stores reusable "Routine DNA" definitions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique UUID string. |
| `name` | TEXT | NOT NULL | Human-friendly name (e.g. "Clean Temp & Docs"). |
| `description` | TEXT | NOT NULL | Purpose and instructions. |
| `current_version`| INTEGER | NOT NULL DEFAULT 1 | Active version number. |
| `is_active` | INTEGER | NOT NULL DEFAULT 1 | Active flag. |
| `created_at` | TEXT | NOT NULL | Timestamp created. |

`routine_versions`:
- `id`: TEXT PK
- `routine_id`: TEXT FK(`routines.id`)
- `version_number`: INTEGER
- `plan_template_json`: TEXT (reusable step templates)
- `preconditions_json`: TEXT (required folders, allowed file extensions)
- `drift_hash`: TEXT (baseline workspace structure hash)
