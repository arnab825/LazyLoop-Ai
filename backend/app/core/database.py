"""
SQLite Database Connection & Schema Migration Engine.
Uses aiosqlite for non-blocking asynchronous database operations.
"""
import aiosqlite
import os
from app.core.config import settings

SCHEMA_SQL = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    workspace_path TEXT NOT NULL,
    autonomy_mode TEXT NOT NULL,
    status TEXT NOT NULL,
    model_used TEXT NOT NULL,
    wall_time_ms REAL DEFAULT 0.0,
    created_at TEXT NOT NULL,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS task_steps (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    step_index INTEGER NOT NULL,
    tool_name TEXT NOT NULL,
    arguments_json TEXT NOT NULL,
    risk_tier TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    parameter_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    approved_at TEXT,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(step_id) REFERENCES task_steps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS change_records (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    original_path TEXT NOT NULL,
    backup_path TEXT NOT NULL,
    original_sha256 TEXT NOT NULL,
    action_type TEXT NOT NULL,
    recorded_at TEXT NOT NULL,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_results (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    target_path TEXT NOT NULL,
    verification_method TEXT NOT NULL,
    expected_value TEXT NOT NULL,
    actual_value TEXT NOT NULL,
    passed INTEGER NOT NULL,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(step_id) REFERENCES task_steps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS execution_receipts (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,
    receipt_json TEXT NOT NULL,
    inference_latency_ms REAL NOT NULL,
    execution_latency_ms REAL NOT NULL,
    manual_time_avoided_min REAL NOT NULL,
    generated_at TEXT NOT NULL,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    current_version INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    plan_template_json TEXT NOT NULL,
    preconditions_json TEXT NOT NULL,
    drift_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS application_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""


async def get_db_connection() -> aiosqlite.Connection:
    """Returns an active SQLite connection configured with Row factory."""
    db_dir = os.path.dirname(settings.database_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
    db = await aiosqlite.connect(settings.database_path)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA foreign_keys = ON;")
    return db


async def init_db():
    """Initializes SQLite database tables and indexes."""
    db = await get_db_connection()
    try:
        await db.executescript(SCHEMA_SQL)
        await db.commit()
    finally:
        await db.close()
