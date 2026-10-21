import { Workflow, Play } from "lucide-react";
import type { Routine } from "../../types";

interface RoutinesViewProps {
  routines: Routine[];
  onReplay: (routineName: string) => void;
  onGoToStudio?: () => void;
}

export function RoutinesView({ routines, onReplay, onGoToStudio }: RoutinesViewProps) {
  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">
            Routine DNA Manager
          </h1>
          <p className="view-subtitle">
            Approved workflows stored as reusable templates. Before executing, preconditions and folder structures are checked for drift.
          </p>
        </div>
      </div>

      {routines.length === 0 ? (
        <div className="brutal-card view-empty-state">
          <div className="view-empty-icon" style={{ backgroundColor: "var(--brutal-cyan)" }}>
            <Workflow size={34} color="#000000" strokeWidth={2.4} />
          </div>
          <div className="view-empty-title">
            NO ROUTINES REGISTERED YET
          </div>
          <p className="view-empty-desc">
            When a task completes in the Task Studio, click "Save Routine DNA" to capture its step sequence and prevent future repetitive busywork.
          </p>
          {onGoToStudio && (
            <button
              className="brutal-btn-primary"
              style={{ marginTop: "24px" }}
              onClick={onGoToStudio}
            >
              OPEN TASK STUDIO
            </button>
          )}
        </div>
      ) : (
        <div className="routines-grid">
          {routines.map((r) => (
            <div
              key={r.id}
              className="brutal-card routine-card"
            >
              <div>
                <div className="routine-card-header">
                  <h3 className="routine-name">{r.name}</h3>
                  <span
                    className="brutal-tag"
                    style={{ backgroundColor: "var(--brutal-yellow)" }}
                  >
                    V{r.version}
                  </span>
                </div>
                <p className="routine-desc">
                  {r.description}
                </p>
              </div>

              <div className="routine-card-footer">
                <span className="routine-ops-count">
                  {r.steps_count} OPERATIONS
                </span>
                <button
                  className="brutal-btn-primary"
                  style={{ padding: "8px 18px", fontSize: "12px" }}
                  onClick={() => onReplay(r.name)}
                >
                  <Play size={14} /> REPLAY ROUTINE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
