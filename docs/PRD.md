# Product Requirements Document (PRD) — LazyLoop AI

## 1. Document Control
- **Document Version:** 1.0.0
- **Status:** Approved / Active
- **Target Challenge:** DEV Community Hacktoberfest 2026 "Slow and Steady" Challenge
- **Product Name:** LazyLoop AI
- **Product Tagline:** *"Do less busywork. Get proof, not promises."*

---

## 2. Product Vision & Mission

### 2.1 Vision
To give individuals complete sovereignty over their daily digital workflows by building an AI assistant that reliably plans, executes, and deterministically verifies repetitive chores—keeping all data local and ensuring that no changes happen without transparent proof and human consent.

### 2.2 Mission
LazyLoop AI eliminates tedious digital busywork for students, developers, and freelancers. Users describe what they want done in plain English; LazyLoop generates a machine-checked operational plan, validates all boundaries, requests approval for destructive or state-changing actions, executes permitted tools inside a sandboxed workspace, verifies every single outcome with deterministic checks (hashes, diffs, existence assertions), and returns a verifiable Proof-of-Work receipt.

---

## 3. The Problem LazyLoop AI Solves

Every day, developers, students, and digital workers waste significant cognitive energy on repetitive digital hygiene:
1. **Uncertainty & Fear of Breakage:** Running ad-hoc scripts or asking general LLMs to "organize my files" often results in lost data, deleted files, or hallucinated changes without backups.
2. **"Promises Instead of Proof":** Modern AI assistants claim "I have cleaned your project", but provide no cryptographic or deterministic evidence that the files actually changed correctly.
3. **Repetition Fatigue:** Users solve the same file organization, doc checklist, or cleanup problem repeatedly because workflows cannot be safely saved and re-run with permission checks.
4. **Cloud Privacy Leaks:** Uploading whole local directories or project trees to closed remote APIs leaks proprietary code and personal documents.

---

## 4. Target Users & Personas

### 4.1 Persona 1: Dev Priya (Software Developer)
- **Need:** Keeping open-source repositories tidy—checking missing setup instructions in READMEs, detecting duplicate asset files in `public/`, finding lingering TODOs, and formatting doc structures.
- **Pain Point:** Reluctant to run untrusted agent scripts that execute arbitrary shell commands in her repo.
- **LazyLoop Solution:** Dry-run plan with explicit diffs, safety checks, automatic backup, and instant single-click undo if needed.

### 4.2 Persona 2: Alex (Computer Science Student)
- **Need:** Organizing semester assignment directories, cleaning build artifacts, detecting duplicate downloads, and formatting assignment submission folders.
- **Pain Point:** Forgets manual cleanup rules and fears deleting working assignment files right before deadlines.
- **LazyLoop Solution:** Routine DNA lets Alex save an approved "Assignment Cleanup Routine" and replay it safely with drift detection.

### 4.3 Persona 3: Marcus (Freelance Designer / Creator)
- **Need:** Organizing project asset exports, finding duplicate high-res images, and generating clean file summaries for client handoff.
- **Pain Point:** Doesn't know shell scripts; doesn't want to pay monthly subscriptions for simple file organizers.
- **LazyLoop Solution:** 100% free, local-first app running with local Ollama or lightweight deterministic mode, with exportable Proof-of-Work receipts.

---

## 5. Core User Journeys

```mermaid
flowchart TD
    A[User Selects Designated Workspace] --> B[User Enters Natural Language Prompt]
    B --> C[AI / Deterministic Planner Generates Structured Plan]
    C --> D[Backend Validates Plan Against Pydantic Schema & Workspace Boundary]
    D --> E[UI Shows Plan, Risk Level, Affected Paths & Expected Outcomes]
    E --> F{Plan Contains Modifications?}
    F -- No (Read-Only) --> G[Auto-Execute Read Operations]
    F -- Yes --> H[User Reviews Diffs & Explicitly Approves]
    H --> I[Snapshot Pre-Modification Files to .lazyloop/backups/]
    I --> J[Execute Permitted Operations via Sandboxed Tool Registry]
    J --> K[Run Deterministic Verification (Hashes, File Existence)]
    K --> L[Generate Verifiable Proof-of-Work Receipt]
    L --> M[Offer to Save Routine DNA with Preconditions]
```

---

## 6. MVP Scope vs. Future Exclusions

### 6.1 Included in MVP (Local-First Edition)
- ✅ Local-first single user deployment (bound to loopback `127.0.0.1`).
- ✅ Strict workspace isolation (no access outside chosen workspace root; blocks path traversal & symlink escapes).
- ✅ Replaceable AI Model Provider: Local Ollama integration + built-in Deterministic Mock Provider for offline testing.
- ✅ Strict Pydantic-based JSON plan schema validation.
- ✅ Explicit Action Approval workflow with risk tiers (`READ_ONLY`, `LOW`, `HIGH_DESTRUCTIVE`).
- ✅ Pre-execution snapshot backups and single-click bit-for-bit Undo engine.
- ✅ Deterministic Verification Engine (SHA-256 before/after hash validation).
- ✅ Proof-of-Work Receipts with exportable JSON.
- ✅ Routine DNA: Save, inspect, edit, and replay approved workflows with drift detection.
- ✅ Procrastination Radar: Local repository hygiene scanner (missing README sections, duplicate assets, TODO/FIXME markers).
- ✅ Lazy Budget: Measured wall-clock time, model latency, and manual time avoided calculation.
- ✅ Model Swap Lab: Switch models, measure latency, and test structured output compliance.
- ✅ Modern Dark Graphite + Neon Green React 19 UI with full status indicators.

### 6.2 Explicitly Excluded from MVP (Non-Goals)
- ❌ No arbitrary shell execution (`exec`, `bash`, `cmd`, `sh`).
- ❌ No cloud databases or mandatory remote account creation.
- ❌ No automatic execution of destructive modifications without explicit approval.
- ❌ No unverified claims of "autonomous model learning" or retraining weights.
- ❌ No unrestricted filesystem access outside the designated workspace.

---

## 7. Success Metrics & Value Proposition

| Metric | Target | Measurement Method |
|---|---|---|
| **Safety Violation Rate** | 0% | 0 path escapes or unapproved modifications permitted in test suite. |
| **Deterministic Verification Rate** | 100% of claimed changes | Every reported modification verified via SHA-256 or file existence. |
| **Reversibility Success Rate** | 100% | Backed-up files restored to bit-identical state upon undo request. |
| **Local Model Compliance** | > 95% | Valid JSON plan parsed after bounded retries or fallback. |
| **Offline Operability** | 100% | Full application operates without an active internet connection using local models or mock engine. |
