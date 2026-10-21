<div align="center">

# ⚡ LazyLoop AI

### **Do Less Busywork. Get Proof, Not Promises.**

*An open-source, local-first AI workflow assistant that eliminates repetitive digital chores, learns approved routines, and proves every modification with cryptographic receipts.*

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge&logo=apache)](./LICENSE)
[![Python 3.12+](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ollama Ready](https://img.shields.io/badge/AI-Ollama%20%7C%20Local-FF6F00.svg?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.ai)
[![Neo-Brutalism](https://img.shields.io/badge/UI-Neo--Brutalist-FFE866.svg?style=for-the-badge&logo=css3&logoColor=black)](#-neo-brutalist-design-system)

---

[Key Highlights](#-key-highlights) •
[Architecture](#-system-architecture) •
[Quick Start](#-quick-start) •
[Core Features](#-core-capabilities) •
[Security & Sandbox](#-security--safety-model) •
[Design System](#-neo-brutalist-design-system) •
[Documentation](#-complete-technical-documentation)

---

</div>

## 🌟 The Problem with Modern AI Assistants

Traditional AI coding assistants ask for root access, hallucinate modifications, execute unverified shell commands, and send your proprietary codebase to remote clouds without consent. When they break things, you are left sifting through git diffs with zero audit trail.

**LazyLoop AI changes the paradigm:**
- 🛡️ **AI as Planner, Not Root**: The model strictly produces validated JSON execution plans. It possesses zero raw shell access.
- 🔒 **Physical Workspace Perimeter**: Hard-sandboxed to your chosen directory. Symlinks, absolute escape sequences, and `..` path traversals are hard-blocked at the OS boundary.
- 📜 **Cryptographic Proof Receipts**: Every altered file is hashed (SHA-256) before and after execution, producing immutable audit logs.
- ⏪ **1-Click Pre-Execution Rollbacks**: Every modified or deleted file is snapshot into `.lazyloop/backups/` before any byte is altered.
- 🧬 **Deterministic Routine DNA**: Approved cleanup operations turn into reusable recipes with automated drift and precondition validation.
- 💻 **100% Local Sovereignty**: Operates with local open-weight models via [Ollama](https://ollama.ai) (`llama3.2`, `qwen2.5-coder`) or an instant, offline deterministic fallback engine.

---

## 🏛️ System Architecture

LazyLoop AI operates on a **Deterministic Execution Sandbox (DES)** architecture that separates model planning from file-system execution.

```mermaid
flowchart TD
    User([User Natural Language Prompt]) --> UI[Neo-Brutalist React 19 Frontend]
    UI -->|REST API Request| Backend[FastAPI Boundary Gateway]

    subgraph Planning Engine
        Backend --> Policy{Autonomy Policy}
        Policy -->|Safe Auto / Read Only| Model[Local Ollama / Deterministic Engine]
        Model -->|Structured Output| Schema[Strict Pydantic JSON Plan Schema]
    end

    subgraph Boundary Shield
        Schema --> Sandbox{Workspace Boundary Validator}
        Sandbox -->|Path Traversal Check| Allowed[Allow: Within Workspace]
        Sandbox -->|Traversing / Symlink| Blocked[Hard Reject & Security Alert]
    end

    subgraph Safe Execution & Proof
        Allowed --> BackupEngine[Pre-Execution Snapshot Engine]
        BackupEngine --> Disk[Local Workspace Operations]
        Disk --> Hasher[SHA-256 Pre/Post Verification]
        Hasher --> Receipt[Immutable Cryptographic Receipt]
    end

    Receipt --> UI
    Receipt --> RoutineStore[(Routine DNA Library)]
```

---

## 🚀 Quick Start

Get LazyLoop AI up and running locally in under **2 minutes**.

### Prerequisites
- **Python 3.12+**
- **Node.js 20+** and `npm`
- *(Optional for AI)* [Ollama](https://ollama.ai) installed with `ollama run llama3.2` or `ollama run qwen2.5-coder`

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/arnab825/LazyLoop-Ai.git
cd "LazyLoop Ai/backend"

# Create and activate virtual environment
# Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI engine
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> The backend will be live at `http://127.0.0.1:8000` (API documentation available at `/docs`).

### 2. Frontend Setup

In a new terminal window:

```bash
cd "LazyLoop Ai/frontend"

# Install dependencies
npm install

# Launch Vite development server
npm run dev
```

> Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Core Capabilities

| View / Tool | Description | Safety Guarantee |
| :--- | :--- | :--- |
| **Command Station (Overview)** | High-level workspace telemetry, hygiene score, manual time saved, and quick-trigger audits. | Read-only analysis. |
| **Task Studio** | Natural language instruction compiler with preset triggers (Smart Cleanup, Duplicate Finder, Docs Audit). | Interactive approval checkpoints before any mutation. |
| **Execution Log** | Live, step-by-step progress monitor displaying real-time shell & file operations with color-coded status badges. | Real-time pause & cancel controls. |
| **Proof Receipts** | Cryptographic verification hub showing pre/post SHA-256 hashes, timestamps, and one-click rollback buttons. | Tamper-evident immutable JSON records. |
| **Routine DNA** | Library of approved workflows compiled into reusable automation cards with drift detection. | Precondition validation prior to re-execution. |
| **Procrastination Radar** | Autonomous hygiene scanner detecting stale drafts, redundant assets, and undocumented exports. | Surfaces debt without altering files. |
| **Model Swap Lab** | Hot-swap between local Ollama instances (`llama3.2`, `qwen2.5-coder`, `mistral`) and deterministic mock mode. | Zero external API calls required. |

---

## 🔒 Security & Safety Model

LazyLoop AI is engineered under the assumption that **AI output is inherently untrusted**.

1. **Strict Path Sandboxing**:
   All operations are resolved against the absolute normalized path of the configured workspace. Path traversals (`../../../etc/passwd` or `C:\Windows\System32`) trigger immediate boundary exceptions:
   ```python
   # Enforced in backend/app/sandbox/boundary.py
   target = (workspace_root / path).resolve()
   if not str(target).startswith(str(workspace_root)):
       raise PermissionError("Access outside sandbox perimeter forbidden.")
   ```
2. **Pre-Execution Snapshots**:
   Before a file is edited or deleted, its complete original state is saved to `.lazyloop/backups/<task_id>/`.
3. **Atomic Rollback Protocol**:
   Every proof receipt includes a direct `UNDO` trigger. If an automation produces unexpected output, one click restores every modified file to its exact pre-task SHA-256 hash.
4. **Zero Remote Telemetry**:
   No code, prompts, hashes, or logs leave your local machine.

---

## 🎨 Neo-Brutalist Design System

LazyLoop AI utilizes a **Tactile Neo-Brutalist** design language built on Vanilla CSS variables:

| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `--bg-canvas` | `#FAF8F5` | Warm, glare-free background surface |
| `--brutal-yellow` | `#FFE866` | Primary accents, interactive badges, brand glyph |
| `--brutal-lime` | `#00FF87` | Active state indicators, verified statuses, safe badges |
| `--brutal-cyan` | `#38DBFF` | Automation tags, routine counters, informational links |
| `--brutal-rose` | `#FF4D6D` | Dangerous actions, active menu indicators, radar warnings |
| `--border-thick` | `2px solid #000000` | Standard high-contrast card borders |
| `--shadow-brutal`| `4px 4px 0px #000000` | Hard, geometric drop shadows |

### Typography
- **Headings & Brand**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Weight 800/900)
- **Code, Hashes & Metrics**: [Space Mono](https://fonts.google.com/specimen/Space+Mono) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

---

## 📁 Repository Structure

```
LazyLoop-Ai/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI route handlers (tasks, routines, radar, models)
│   │   ├── core/           # Config, settings, and logging
│   │   ├── models/         # Pydantic data schemas & state models
│   │   ├── planner/        # Ollama connector & deterministic planner fallback
│   │   ├── sandbox/        # Boundary defense, backup manager, & file operations
│   │   └── main.py         # Application entry point
│   ├── requirements.txt    # Python dependencies
│   └── tests/              # Backend safety & boundary test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── views/      # Overview, Studio, Execution, Receipts, Routines, Radar, Models
│   │   │   └── Sidebar.tsx # Responsive Neo-Brutalist pinned navigation & sandbox card
│   │   ├── api.ts          # Strongly typed client API bindings
│   │   ├── App.tsx         # Main application layout & drawer state
│   │   ├── App.css         # Component styling tokens
│   │   └── index.css       # Core design tokens, layout grids, & mobile breakpoints
│   ├── package.json
│   └── vite.config.ts
├── docs/                   # Complete architecture, PRD, TRD, and security specifications
├── LICENSE                 # Apache 2.0 Open-Source License
└── README.md               # Primary project documentation
```

---

## 📚 Complete Technical Documentation

Comprehensive architectural blueprints and engineering specifications are located in [`docs/`](./docs/README.md):

| Document | Focus Area |
| :--- | :--- |
| **[Architecture Specification](./docs/ARCHITECTURE.md)** | Boundary validation loops, deterministic execution engine, and sequence flows. |
| **[Security & Threat Model](./docs/SECURITY.md)** | Sandboxing guarantees, path escape mitigations, and hash integrity protocols. |
| **[UI/UX Design Specification](./docs/UI_UX_SPECIFICATION.md)** | Neo-Brutalism tokens, responsive breakpoint matrix, and accessibility guidelines. |
| **[Product Requirements (PRD)](./docs/PRD.md)** | User personas, core user stories, and feature prioritization rubrics. |
| **[Technical Requirements (TRD)](./docs/TRD.md)** | API contracts, state storage schemas, and local model inference bounds. |
| **[Software Requirements (SRS)](./docs/SRS.md)** | Functional/non-functional requirements and system compliance criteria. |
| **[Database & Storage Design](./docs/DATABASE_DESIGN.md)** | Backup folder structures, routine serialization, and SQLite/JSON storage. |
| **[API Specification](./docs/API_SPECIFICATION.md)** | Complete OpenAPI / Swagger endpoints with request and response payloads. |
| **[Test Report](./docs/TEST_REPORT.md)** | Test coverage, boundary fuzzing results, and rollback verification benchmarks. |

---

## 🤝 Contributing

Contributions to LazyLoop AI are welcome! Whether you are adding a new routine preset, refining the Neo-Brutalist UI, or integrating additional local LLM providers:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/NewHygieneCheck`).
3. Commit your Changes (`git commit -m "feat: add missing test scanner"`).
4. Push to the Branch (`git push origin feature/NewHygieneCheck`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **Apache 2.0 License**. See [`LICENSE`](./LICENSE) for full details.

---

<div align="center">
  <strong>Built with 💛 for developers who value their time, their privacy, and verifiable results.</strong>
</div>
