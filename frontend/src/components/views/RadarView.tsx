import { RefreshCw, Play } from "lucide-react";
import type { RadarReport } from "../../types";

interface RadarViewProps {
  radarReport: RadarReport | null;
  radarScanning: boolean;
  onRefresh: () => void;
  onAutomate: (prompt: string) => void;
}

export function RadarView({ radarReport, radarScanning, onRefresh, onAutomate }: RadarViewProps) {
  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">
            Procrastination Radar
          </h1>
          <p className="view-subtitle">
            Automated maintenance scanner that discovers postponed repository tasks ranked by impact and urgency.
          </p>
        </div>

        <button className="brutal-btn-primary" onClick={onRefresh} disabled={radarScanning}>
          <RefreshCw size={16} className={radarScanning ? "animate-spin" : ""} /> RESCAN WORKSPACE
        </button>
      </div>

      {radarScanning && (
        <div className="brutal-card view-empty-state" style={{ marginBottom: "28px" }}>
          <div className="view-empty-icon" style={{ backgroundColor: "var(--brutal-yellow)" }}>
            <RefreshCw size={32} className="animate-spin" color="#000000" strokeWidth={2.4} />
          </div>
          <h3 className="view-empty-title">
            Scanning Workspace Diagnostics...
          </h3>
          <p className="view-empty-desc">
            Checking duplicate files, documentation markers, and code hygiene across all directories.
          </p>
        </div>
      )}

      {!radarScanning && !radarReport && (
        <div className="brutal-card view-empty-state" style={{ marginBottom: "28px" }}>
          <div className="view-empty-icon" style={{ backgroundColor: "var(--brutal-rose)" }}>
            <RefreshCw size={32} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <h3 className="view-empty-title">
            No Scan Report Available Yet
          </h3>
          <p className="view-empty-desc" style={{ marginBottom: "20px" }}>
            Click the button below to initiate an automated diagnostic scan of your workspace.
          </p>
          <button className="brutal-btn-primary" onClick={onRefresh}>
            <RefreshCw size={16} /> SCAN WORKSPACE NOW
          </button>
        </div>
      )}

      {!radarScanning && radarReport && (
        <div>
          {/* Health Score Banner */}
          <div className="brutal-card radar-health-banner">
            <div className="radar-score-badge">
              {radarReport.health_score}%
            </div>
            <div>
              <h3 className="radar-banner-title">
                Repository Hygiene Score
              </h3>
              <p className="radar-banner-subtitle">
                {radarReport.total_findings === 0
                  ? "Workspace is completely clean and up to standards!"
                  : `Discovered ${radarReport.total_findings} maintenance tasks ready for automated resolution.`}
              </p>
            </div>
          </div>

          {/* Actionable Findings List */}
          {radarReport.findings.length === 0 ? (
            <div className="brutal-card" style={{ padding: "32px", textAlign: "center", backgroundColor: "#FFFFFF" }}>
              <p style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
                No procrastination debts found. All documentation and routines look clean!
              </p>
            </div>
          ) : (
            <div className="radar-findings-list">
              {radarReport.findings.map((f) => (
                <div key={f.id} className="brutal-card radar-finding-card">
                  <div className="radar-finding-row">
                    <div style={{ flex: 1 }}>
                      <div className="radar-finding-title-row">
                        <span className="radar-finding-title">{f.title}</span>
                        <span
                          className="brutal-tag"
                          style={{
                            backgroundColor: f.urgency === "HIGH" ? "var(--brutal-rose)" : "var(--brutal-yellow)",
                            color: f.urgency === "HIGH" ? "#FFFFFF" : "#000000",
                          }}
                        >
                          {f.urgency} URGENCY
                        </span>
                      </div>
                      <p className="radar-finding-reason">
                        {f.reason}
                      </p>
                    </div>

                    <button
                      className="brutal-btn-primary"
                      style={{ padding: "10px 20px", fontSize: "12px", whiteSpace: "nowrap" }}
                      onClick={() => onAutomate(f.suggested_prompt)}
                    >
                      <Play size={14} /> AUTOMATE WITH PROOF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
