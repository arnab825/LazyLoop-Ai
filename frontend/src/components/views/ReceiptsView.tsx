import { Download, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Task } from "../../types";

interface ReceiptsViewProps {
  currentTask: Task | null;
  onGoToStudio?: () => void;
}

export function ReceiptsView({ currentTask, onGoToStudio }: ReceiptsViewProps) {
  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">
            Proof-of-Work Receipts
          </h1>
          <p className="view-subtitle">
            Every completed workflow produces an immutable Proof-of-Work receipt with before/after SHA-256 hashes and file presence assertions.
          </p>
        </div>
      </div>

      {currentTask?.receipt ? (
        <div className="brutal-card receipt-card">
          <div className="receipt-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span
                  className="brutal-tag"
                  style={{
                    backgroundColor: "var(--brutal-lime)",
                    color: "#000000",
                  }}
                >
                  EVIDENCE_BACKED_RECEIPT
                </span>
                {currentTask.receipt.model_used && (
                  <span
                    className="brutal-tag"
                    style={{
                      backgroundColor: currentTask.receipt.model_used.includes("mock") ? "var(--brutal-yellow)" : "var(--brutal-cyan)",
                      color: "#000000",
                    }}
                  >
                    ● AI ENGINE: {currentTask.receipt.model_used}
                  </span>
                )}
              </div>
              <h2 className="receipt-title">
                {currentTask.receipt.prompt}
              </h2>
              <div className="receipt-id">
                RECEIPT_ID: {currentTask.receipt.receipt_id}
              </div>
            </div>

            <button
              className="brutal-btn-primary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(currentTask.receipt, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `lazyloop_receipt_${currentTask.receipt?.receipt_id}.json`;
                a.click();
              }}
            >
              <Download size={16} /> EXPORT RECEIPT JSON
            </button>
          </div>

          {/* Key Metric Blocks */}
          <div className="receipt-stats-grid">
            <ReceiptStatBlock label="PLANNED_OPS" value={`${currentTask.receipt.planned_steps_count}`} bg="#F3F4F6" />
            <ReceiptStatBlock label="VERIFIED_RATIO" value={`${currentTask.receipt.verified_steps_count} / ${currentTask.receipt.executed_steps_count}`} bg="var(--brutal-lime)" />
            <ReceiptStatBlock label="EXECUTION_LATENCY" value={`${Math.round(currentTask.receipt.wall_clock_ms)} ms`} bg="var(--brutal-cyan)" />
            <ReceiptStatBlock label="MANUAL_AVOIDED" value={`~${currentTask.receipt.manual_time_avoided_minutes} min`} bg="var(--brutal-yellow)" />
          </div>

          {/* Evidence Assertions Table */}
          <h3 className="evidence-table-heading">
            CRYPTOGRAPHIC EVIDENCE TABLE
          </h3>
          <div className="evidence-table-container">
            <table className="evidence-table">
              <thead className="evidence-thead">
                <tr>
                  <th>TARGET_PATH</th>
                  <th>ASSERTION_METHOD</th>
                  <th>OBSERVED_VALUE</th>
                  <th>OUTCOME</th>
                </tr>
              </thead>
              <tbody className="evidence-tbody">
                {currentTask.receipt.verification_results.map((v, i) => (
                  <tr key={i} className="evidence-row">
                    <td style={{ fontWeight: 800, color: "#000000" }}>{v.target_path}</td>
                    <td style={{ color: "#0284C7", fontWeight: 800 }}>{v.method}</td>
                    <td style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                      {v.actual.length > 24 ? `${v.actual.slice(0, 20)}...` : v.actual}
                    </td>
                    <td>
                      <span
                        className="brutal-tag"
                        style={{
                          backgroundColor: v.passed ? "var(--brutal-lime)" : "var(--brutal-rose)",
                          color: v.passed ? "#000000" : "#FFFFFF",
                        }}
                      >
                        <CheckCircle2 size={13} /> VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="brutal-card view-empty-state">
          <div className="view-empty-icon" style={{ backgroundColor: "var(--brutal-lime)" }}>
            <ShieldCheck size={34} color="#000000" strokeWidth={2.4} />
          </div>
          <div className="view-empty-title">
            NO RECEIPT GENERATED YET
          </div>
          <p className="view-empty-desc">
            Execute a workflow in the Task Studio to view the resulting proof-of-work receipt with before/after cryptographic verification.
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
      )}
    </div>
  );
}

function ReceiptStatBlock({ label, value, bg }: any) {
  return (
    <div
      className="receipt-stat-card"
      style={{ backgroundColor: bg }}
    >
      <div className="receipt-stat-label">
        {label}
      </div>
      <div className="receipt-stat-value">
        {value}
      </div>
    </div>
  );
}
