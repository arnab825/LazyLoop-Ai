import { useState, useRef, useEffect } from "react";
import { FolderOpen, Play, RefreshCw, AlertCircle, ChevronDown, ShieldCheck, CheckSquare, Eye } from "lucide-react";

interface TaskStudioViewProps {
  workspacePath: string;
  setWorkspacePath: (p: string) => void;
  autonomyMode: string;
  setAutonomyMode: (m: string) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  loading: boolean;
  onExecute: () => void;
}

const AUTONOMY_OPTIONS = [
  {
    value: "SAFE_AUTO",
    label: "Safe Auto (Approve Writes)",
    description: "Auto-runs read-only steps; prompts approval on writes",
    icon: ShieldCheck,
    color: "var(--brutal-lime)",
  },
  {
    value: "REVIEW_ALL",
    label: "Review All Steps",
    description: "Every step requires manual confirmation",
    icon: CheckSquare,
    color: "var(--brutal-yellow)",
  },
  {
    value: "DRY_RUN",
    label: "Dry Run (No Edits)",
    description: "Simulates execution without modifying any files",
    icon: Eye,
    color: "var(--brutal-cyan)",
  },
];

function AutonomySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = AUTONOMY_OPTIONS.find((o) => o.value === value) || AUTONOMY_OPTIONS[0];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="brutal-input"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontWeight: "800",
          textAlign: "left",
          backgroundColor: "#FFFFFF",
          padding: "10px 14px",
          gap: "8px",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              backgroundColor: selected.color,
              border: "1.5px solid #000000",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SelectedIcon size={13} color="#000000" strokeWidth={2.6} />
          </div>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected.label}
          </span>
        </div>
        <ChevronDown
          size={16}
          color="#000000"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            backgroundColor: "#FFFFFF",
            border: "var(--border-thick)",
            boxShadow: "var(--shadow-brutal)",
            borderRadius: "6px",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {AUTONOMY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  backgroundColor: isSelected ? "#FFFDF0" : "#FFFFFF",
                  borderBottom: "1.5px solid #F3F4F6",
                  cursor: "pointer",
                  transition: "background-color 0.1s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-canvas)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    backgroundColor: opt.color,
                    border: "1.5px solid #000000",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "1px 1px 0px #000000",
                  }}
                >
                  <Icon size={14} color="#000000" strokeWidth={2.6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: "900", color: "#000000" }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600" }}>
                    {opt.description}
                  </div>
                </div>
                {isSelected && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#000000",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TaskStudioView({
  workspacePath,
  setWorkspacePath,
  autonomyMode,
  setAutonomyMode,
  prompt,
  setPrompt,
  loading,
  onExecute,
}: TaskStudioViewProps) {
  return (
    <div>
      <div className="view-header-flush">
        <h1 className="view-title">
          Task Studio
        </h1>
        <p className="view-subtitle">
          Input natural-language instructions. LazyLoop's planning engine compiles the plan, bounds actions to your workspace, and requests approval for modifications.
        </p>
      </div>

      <div className="brutal-card task-studio-card">
        {/* Workspace Path and Autonomy */}
        <div className="task-studio-controls">
          <div>
            <label className="form-label">
              RESTRICTED WORKSPACE ROOT
            </label>
            <div className="input-icon-wrapper">
              <input
                type="text"
                className="brutal-input input-with-icon"
                value={workspacePath}
                onChange={(e) => setWorkspacePath(e.target.value)}
              />
              <FolderOpen size={18} className="input-icon" />
            </div>
          </div>

          <div>
            <label className="form-label">
              AUTONOMY POLICY
            </label>
            <AutonomySelect value={autonomyMode} onChange={setAutonomyMode} />
          </div>
        </div>

        {/* Task Instruction Area */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label-inline">
              TASK INSTRUCTION PROMPT
            </label>
            <span className="form-hint">
              OPEN-WEIGHT MODEL PLANNER
            </span>
          </div>
          <textarea
            rows={5}
            className="brutal-input task-prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want organized, audited, or cleaned up..."
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="presets-container">
          <div className="presets-title">
            ⚡ QUICK INSTRUCTION PRESETS:
          </div>
          <div className="presets-list">
            <button
              className="brutal-btn-secondary preset-chip"
              style={{ backgroundColor: "var(--brutal-yellow)" }}
              onClick={() =>
                setPrompt("Analyze my project folder, identify duplicate files, find documentation gaps, and prepare a cleanup plan.")
              }
            >
              ✨ Smart Project Cleanup
            </button>
            <button
              className="brutal-btn-secondary preset-chip"
              style={{ backgroundColor: "var(--brutal-lime)" }}
              onClick={() => setPrompt("Scan project assets for duplicate image files and compute SHA-256 digests.")}
            >
              🖼️ Find Duplicate Assets
            </button>
            <button
              className="brutal-btn-secondary preset-chip"
              style={{ backgroundColor: "var(--brutal-cyan)" }}
              onClick={() => setPrompt("Check README.md for missing sections, setup instructions, and TODO markers.")}
            >
              📝 Audit README & Docs
            </button>
            <button
              className="brutal-btn-secondary preset-chip"
              onClick={() => setPrompt("Audit repository for temporary test dumps, empty markdown drafts, and dead links.")}
            >
              🧹 Clear Temp Drafts
            </button>
          </div>
        </div>

        {/* Execution Submit Bar */}
        <div className="submit-bar">
          <div className="submit-bar-info">
            <AlertCircle size={20} color="#000000" style={{ flexShrink: 0 }} />
            <span>Files outside the designated workspace cannot be accessed or altered.</span>
          </div>

          <button
            className="brutal-btn-primary submit-execute-btn"
            onClick={onExecute}
            disabled={loading}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
            GENERATE & EXECUTE PLAN
          </button>
        </div>
      </div>
    </div>
  );
}
