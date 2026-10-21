# DEV Community Hacktoberfest 2026 Submission

## 🏆 Project Name: LazyLoop AI
**Tagline:** *"Do less busywork. Get proof, not promises."*  
**Category:** Slow and Steady Challenge  
**Repository:** [github.com/LazyLoop-AI/lazyloop](https://github.com/LazyLoop-AI/lazyloop)  
**License:** Apache 2.0 (Open Source)

---

## 1. The Problem
Developers, students, and digital creators waste cognitive energy on routine digital hygiene: organizing assets, locating duplicate downloads, checking missing README setup instructions, and clearing temp files.

Most AI coding assistants provide **"promises instead of proof"**—claiming they cleaned a directory without verifiable evidence, risking broken files without backups, or exfiltrating private files to remote cloud models.

---

## 2. Our Solution: Proof, Not Promises
**LazyLoop AI** is a functional, local-first AI workflow assistant that eliminates digital busywork while keeping the user in complete control:

1. **AI as Planner, Not Unrestricted Executor:** The model (via local Ollama or an offline deterministic planner) outputs strictly validated JSON plans. Raw shell commands (`exec`, `bash`, `cmd`) are completely forbidden.
2. **Strict Workspace Sandbox:** Enforces containment within the user's chosen folder via realpath resolution, blocking symlink escapes and path traversal attacks (`..`).
3. **Pre-Execution Snapshots & Single-Click Undo:** Any mutating action captures a pre-change snapshot in `.lazyloop/backups/<task_id>/`. If anything goes wrong, a single click restores your files bit-for-bit.
4. **Deterministic Proof-of-Work Receipts:** Rather than trusting an LLM's assertion, LazyLoop verifies outcomes using SHA-256 before/after hash matching and existence tests, compiling an exportable JSON receipt.
5. **Routine DNA:** Approved workflows can be saved as reusable routines with drift detection—halting for review if the workspace structure has changed.
6. **Procrastination Radar & Lazy Budget:** Discovers neglected repo chores (missing README sections, duplicate assets) and measures exact execution latency and manual minutes avoided.

---

## 3. How to Run Locally

### Backend (FastAPI + SQLite)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows (or source .venv/bin/activate on Linux/macOS)
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (React 19 + TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to experience the app.
