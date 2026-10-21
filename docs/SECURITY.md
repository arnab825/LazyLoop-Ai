# Security Specification & Policy — LazyLoop AI

## 1. Security Philosophy & Principles

LazyLoop AI is designed with an uncompromising security architecture:
1. **Never Trust Agentic Code Unconditionally:** AI outputs are treated as untrusted user inputs.
2. **Strict Workspace Isolation:** Filesystem writes and reads cannot escape the user-selected workspace under any circumstance.
3. **No Shell Execution:** Arbitrary terminal commands (`exec`, `system`, `popen`) are never exposed or called.
4. **Action-Bound Approvals:** High-risk actions require explicit human authorization bound to the exact step hash.
5. **Pre-Modification Backups:** Destructive or mutating operations always capture a bit-for-bit snapshot first.

---

## 2. Threat Modeling & Mitigations

| Threat | Attack Vector | LazyLoop Mitigation Strategy | Test Verification |
|---|---|---|---|
| **Path Traversal** | Prompt injects `../../../../etc/passwd` or `..\..\Windows\System32` into tool path argument. | `WorkspaceValidator` canonicalizes paths with `os.path.realpath`, checks `commonpath`, and throws `SecurityBoundaryException` if path escapes workspace root. | Automated Pytest path traversal vectors. |
| **Symlink Escape** | Attacker creates symlink inside workspace pointing to sensitive parent directory. | `os.path.realpath` resolves symlinks prior to checking containment inside the workspace root. | Symlink escape test suite. |
| **Approval Bypass / Tampering** | Malicious front-end request approves Step B using token granted for Step A. | Approval tokens are cryptographically generated UUIDs stored in SQLite, mapped to `step_id` and SHA-256 hash of parameters. Approval is rejected if hashes mismatch. | Token tampering test. |
| **Silent Data Loss** | Model plans file deletion without user realizing or with invalid justification. | `delete_file` is classified as `HIGH_DESTRUCTIVE`. Requires explicit user toggle, creates a pre-execution snapshot in `.lazyloop/backups/`, and allows 1-click Undo. | File deletion and restore test. |
| **Prompt Injection via Files** | Repo README contains prompt injection instructing LLM to delete all files. | Model cannot delete files autonomously; tool calls pass through schema validation, risk classification, and require human approval with visual diffs. | Prompt injection fixture test. |
| **Network & Remote Exposure** | Attacker scans local network for open FastAPI endpoints. | Default binding is strictly `127.0.0.1` (loopback only). CORS strictly locked to frontend origin. | Host bind validation test. |

---

## 3. Vulnerability Reporting

If you discover a security vulnerability within LazyLoop AI, please report it via GitHub Private Vulnerability Reporting or email the maintainers directly. Please do not open public issues for zero-day vulnerabilities.
