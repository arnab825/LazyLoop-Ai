# LazyLoop AI

<p align="center">
  <strong>"Do less busywork. Get proof, not promises."</strong>
</p>

<p align="center">
  <em>An open-source, local-first AI workflow assistant that eliminates repetitive digital work, learns approved routines, and proves every result.</em>
</p>

---

## 🌟 Why LazyLoop AI?

Traditional AI assistants often make empty promises: *"I cleaned your project!"*—while hallucinating changes, breaking code without backups, or sending your private files to remote clouds.

**LazyLoop AI changes the paradigm:**
- 🛡️ **AI as Planner, Not Root:** The AI model is strictly a planner. It outputs structured JSON plans and cannot execute arbitrary shell commands.
- 🔒 **Sandboxed & Boundary-Checked:** Paths are strictly confined to your chosen workspace root; symlinks and traversal (`..`) are hard-blocked.
- 📜 **Proof-of-Work Receipts:** Every file change is deterministically verified with SHA-256 before/after hash checks and presented in an immutable receipt.
- 🔄 **Reversible Automation:** Pre-modification snapshots are automatically created in `.lazyloop/backups/`. Undo any change with a single click.
- 🧬 **Routine DNA:** Turn approved cleanup workflows into reusable routines with automatic precondition verification and drift detection.
- 📊 **Procrastination Radar & Lazy Budget:** Surface overdue repo maintenance (missing README sections, duplicate assets) and measure real time saved.
- 💻 **100% Local Sovereignty:** Runs with local [Ollama](https://ollama.ai) models or an offline deterministic engine. No mandatory cloud accounts.

---

## 🚀 Quick Start (Local Edition)

### Prerequisites
- Python 3.12+
- Node.js v20+ / npm
- *(Optional for AI)* [Ollama](https://ollama.ai) with `llama3.2` or `qwen2.5:coder`

### 1. Clone & Set Up Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Set Up Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🎨 UI & Design System

LazyLoop AI features a **Light-Themed Neo-Brutalist** aesthetic engineered for clarity, tactile interaction, and high visual contrast:
- **Warm Cream Canvas (`#FAF8F5`):** Clean, glare-free background with zero distracting patterns or background dots.
- **Bold 2px–3px Pure Black Borders & Hard Shadows:** Geometric `4px` drop shadows with crisp boundaries.
- **Vibrant Highlighter Accents:** Electric Lime (`#00FF87`), Sun Yellow (`#FFE866`), Cyan (`#38DBFF`), and Rose (`#FF4D6D`) for instant visual feedback.
- **Flawless Mobile & Tablet Responsiveness:** Collapsible overlay sidebar drawer, adaptive command station actions, and responsive dropdowns.
- **Native Windows Directory Picker:** Interactive `BROWSE...` folder selection via File System Access API with manual override.

---

## 📚 Complete Documentation

All detailed technical specifications, architecture diagrams, and security policies are maintained in [`docs/`](./docs/README.md):

- [UI/UX Specification & Design Tokens](./docs/UI_UX_SPECIFICATION.md)
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Technical Requirements Document (TRD)](./docs/TRD.md)
- [Software Requirements Specification (SRS)](./docs/SRS.md)
- [System Architecture Specification](./docs/ARCHITECTURE.md)
- [Security & Threat Model](./docs/SECURITY.md)
- [Database Design](./docs/DATABASE_DESIGN.md)
- [API Specification](./docs/API_SPECIFICATION.md)

---

## 📄 License

LazyLoop AI is open-source software licensed under the [Apache 2.0 License](./LICENSE).
