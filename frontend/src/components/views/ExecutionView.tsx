import { Terminal, RotateCcw, FileCheck, CheckCircle2, Workflow } from "lucide-react";
import type { Task, ToolStep } from "../../types";

interface ExecutionViewProps {
  currentTask: Task | null;
  loading: boolean;
  undoStatus: any;
  routineName: string;
  setRoutineName: (n: string) => void;
  routineSaved: boolean;
  onUndo: () => void;
  onViewReceipt: () => void;
  onApproveStep: (step: ToolStep, approved: boolean) => void;
  onSaveRoutine: () => void;
  onGoToStudio: () => void;
}

export function ExecutionView({
  currentTask,
  loading,
  undoStatus,
  routineName,
  setRoutineName,
  routineSaved,
  onUndo,
  onViewReceipt,
  onApproveStep,
  onSaveRoutine,
  onGoToStudio,
}: ExecutionViewProps) {
  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">
            Execution Log & Timeline
          </h1>
          <div className="execution-status-bar" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="execution-status-label">CURRENT_STATUS:</span>
            <span
              className="brutal-tag"
              style={{
                backgroundColor:
                  currentTask?.status === "COMPLETED"
                    ? "var(--brutal-lime)"
                    : currentTask?.status === "AWAITING_APPROVAL"
                      ? "var(--brutal-yellow)"
                      : "#FFFFFF",
              }}
            >
              {currentTask?.status || "NO_ACTIVE_TASK"}
            </span>

            {currentTask?.model_used && (
              <span
                className="brutal-tag"
                style={{
                  backgroundColor: currentTask.model_used.includes("mock") ? "var(--brutal-yellow)" : "var(--brutal-lime)",
                  color: "#000000",
                }}
              >
                ● MODEL: {currentTask.model_used} {currentTask.model_used.includes("mock") ? "(MOCK)" : "(LIVE OLLAMA)"}
              </span>
            )}
          </div>
        </div>

        {currentTask && (
          <div
            className="execution-actions-group"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              flexWrap: "nowrap",
              flexShrink: 0,
            }}
          >
            <button
              className="brutal-btn-danger"
              style={{
                height: "36px",
                padding: "6px 12px",
                fontSize: "11px",
                whiteSpace: "nowrap",
                boxShadow: "2px 2px 0px #000000",
                borderRadius: "4px",
              }}
              onClick={onUndo}
              disabled={loading}
            >
              <RotateCcw size={14} /> 1-CLICK BIT-FOR-BIT UNDO
            </button>
            {currentTask.receipt && (
              <button
                className="brutal-btn-primary"
                style={{
                  height: "36px",
                  padding: "6px 12px",
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                  boxShadow: "2px 2px 0px #000000",
                  borderRadius: "4px",
                }}
                onClick={onViewReceipt}
              >
                <FileCheck size={14} /> VIEW PROOF RECEIPT
              </button>
            )}
          </div>
        )}
      </div>

      {undoStatus && (
        <div className="execution-undo-banner">
          <CheckCircle2 size={24} color="#000000" style={{ flexShrink: 0 }} />
          <span>
            REVERSIBLE AUTOMATION SUCCESS: Restored {undoStatus.restored_count} files bit-for-bit to their exact pre-execution state.
          </span>
        </div>
      )}

      {!currentTask ? (
        <div className="brutal-card view-empty-state">
          <div className="view-empty-icon" style={{ backgroundColor: "var(--brutal-yellow)" }}>
            <Terminal size={32} color="#000000" strokeWidth={2.4} />
          </div>
          <div className="view-empty-title">
            NO ACTIVE WORKFLOW SESSION
          </div>
          <p className="view-empty-desc">
            Launch a cleanup or audit task in the Task Studio to view step-by-step verified execution.
          </p>
          <button
            className="brutal-btn-primary"
            style={{ marginTop: "24px" }}
            onClick={onGoToStudio}
          >
            OPEN TASK STUDIO
          </button>
        </div>
      ) : (
        <div className="steps-list">
          {currentTask.steps.map((step, idx) => (
            <div
              key={step.id}
              className={`brutal-card step-card ${
                step.status === "COMPLETED"
                  ? "step-card-success"
                  : step.status === "FAILED" || step.risk_tier === "HIGH_DESTRUCTIVE"
                    ? "step-card-danger"
                    : "step-card-warning"
              }`}
            >
              <div className="step-card-content">
                <div className="step-left-meta">
                  <div className="step-index-badge">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="step-title">
                      {step.description}
                    </div>
                    <div className="step-sub-meta">
                      TOOL: <code className="step-tool-badge">{step.tool_name}</code>
                      <span style={{ margin: "0 8px" }}>|</span>
                      RISK:{" "}
                      <span
                        className={
                          step.risk_tier === "READ_ONLY"
                            ? "step-risk-read"
                            : step.risk_tier === "LOW"
                              ? "step-risk-low"
                              : "step-risk-high"
                        }
                      >
                        {step.risk_tier}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="step-right-actions">
                  <span
                    className="brutal-tag"
                    style={{
                      backgroundColor:
                        step.status === "COMPLETED"
                          ? "var(--brutal-lime)"
                          : step.status === "AWAITING_APPROVAL"
                            ? "var(--brutal-yellow)"
                            : "#F3F4F6",
                    }}
                  >
                    {step.status}
                  </span>

                  {step.approval && step.approval.status === "PENDING" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="brutal-btn-primary"
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                        onClick={() => onApproveStep(step, true)}
                      >
                        APPROVE
                      </button>
                      <button
                        className="brutal-btn-danger"
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                        onClick={() => onApproveStep(step, false)}
                      >
                        REJECT
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Routine DNA Export Form on Completion */}
          {currentTask.status === "COMPLETED" && (
            <div className="brutal-card routine-dna-card">
              <div className="routine-dna-header">
                <Workflow size={24} color="#000000" />
                <h3 className="routine-dna-title">
                  Save Workflow as "Routine DNA"
                </h3>
              </div>
              <p className="routine-dna-desc">
                Store this verified execution plan as a reusable routine template. Precondition drift detection triggers automatically before future replays.
              </p>
              <div className="routine-dna-input-row">
                <input
                  type="text"
                  className="brutal-input"
                  style={{ flex: 1, backgroundColor: "#FFFFFF" }}
                  placeholder="Routine Name (e.g. Weekly Repo Hygiene Routine)"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                />
                <button
                  className="brutal-btn-primary"
                  onClick={onSaveRoutine}
                  disabled={routineSaved || !routineName}
                >
                  {routineSaved ? "ROUTINE SAVED!" : "SAVE ROUTINE DNA"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
