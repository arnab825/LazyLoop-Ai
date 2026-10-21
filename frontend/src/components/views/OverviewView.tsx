import {
  Sparkles,
  Play,
  Code2,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Clock,
  Dna,
  ShieldCheck,
  Terminal,
  GraduationCap,
  Briefcase,
  Zap,
  ArrowRight,
  Lock,
  RotateCcw,
  FileCheck2,
} from "lucide-react";
import type { Routine, RadarReport } from "../../types";
import heroBannerImg from "../../assets/images/hero_banner.jpg";
import { NotificationBell } from "../ui/NotificationBell";

interface OverviewViewProps {
  routines: Routine[];
  radarReport: RadarReport | null;
  radarScanning: boolean;
  notifications: any[];
  onMarkAllNotificationsRead: () => void;
  onClearNotifications: () => void;
  onRunSmartCleanup: () => void;
  onAuditDocs: () => void;
  onOpenTaskStudio: () => void;
  onOpenRadar: () => void;
  onRefreshRadar: () => void;
  onSelectPrompt: (p: string) => void;
}

export function OverviewView({
  routines,
  radarReport,
  radarScanning,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotifications,
  onRunSmartCleanup,
  onAuditDocs,
  onOpenTaskStudio,
  onOpenRadar,
  onRefreshRadar,
  onSelectPrompt,
}: OverviewViewProps) {
  return (
    <div>
      {/* Header Banner */}
      <div
        className="overview-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "28px",
          borderBottom: "var(--border-heavy)",
          paddingBottom: "22px",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px",
              backgroundColor: "var(--brutal-yellow)",
              border: "var(--border-thick)",
              color: "#000000",
              fontSize: "11px",
              fontWeight: "900",
              fontFamily: "var(--font-mono)",
              marginBottom: "12px",
              borderRadius: "4px",
              boxShadow: "var(--shadow-brutal-xs)",
            }}
          >
            ⚡ VERIFIED LOCAL AI WORKFLOWS
          </div>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "900",
              letterSpacing: "-1.5px",
              color: "#000000",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            OVERVIEW
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "6px", fontWeight: "600" }}>
            Do less busywork. Get proof, not promises. Local-first AI agent that eliminates repetitive digital chores.
          </p>
        </div>

        <div className="overview-header-actions" style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <NotificationBell
            notifications={notifications}
            onMarkAllAsRead={onMarkAllNotificationsRead}
            onClear={onClearNotifications}
          />
          <button className="brutal-btn-primary" onClick={onOpenTaskStudio}>
            <Sparkles size={16} /> Launch Task Studio
          </button>
        </div>
      </div>

      {/* Hero Illustration Card */}
      <div className="brutal-card hero-grid hero-card">
        <div className="hero-text-pane">
          <div className="hero-badge">
            100% LOCAL & SAFE
          </div>
          <h2 className="hero-heading">
            ELIMINATE DIGITAL BUSYWORK WITH PROOF
          </h2>
          <p className="hero-description">
            The AI acts solely as a planner. It outputs strictly validated JSON plans, captures pre-execution backups, executes inside your designated workspace, and gives you cryptographic verification.
          </p>
          <div className="hero-actions">
            <button className="brutal-btn-primary" onClick={onRunSmartCleanup}>
              <Play size={16} /> Run Smart Project Cleanup
            </button>
            <button className="brutal-btn-secondary" onClick={onAuditDocs}>
              <Code2 size={16} /> Audit Repo Documentation
            </button>
          </div>
        </div>
        <div className="hero-image-pane">
          <img
            src={heroBannerImg}
            alt="LazyLoop AI Workspace Illustration"
            className="hero-image"
          />
        </div>
      </div>

      {/* Brutalist KPI Grid with Icons */}
      <div className="kpi-grid">
        <KpiCard
          icon={<CheckCircle2 size={16} color="#000000" />}
          label="VERIFICATION_RATE"
          value="100%"
          badge="SHA-256 MATCH"
          bg="#FFFFFF"
          badgeBg="var(--brutal-lime)"
        />
        <KpiCard
          icon={<Clock size={16} color="#000000" />}
          label="MANUAL_HOURS_AVOIDED"
          value="~45m"
          badge="BASELINE MEASURED"
          bg="#FFFFFF"
          badgeBg="var(--brutal-cyan)"
        />
        <KpiCard
          icon={<Dna size={16} color="#000000" />}
          label="ROUTINE_DNA_STORED"
          value={`${routines.length}`}
          badge="PRECONDITION SAFE"
          bg="#FFFFFF"
          badgeBg="var(--brutal-yellow)"
        />
        <KpiCard
          icon={<ShieldCheck size={16} color="#000000" />}
          label="HYGIENE_SCORE"
          value={radarReport ? `${radarReport.health_score}%` : "100%"}
          badge={radarReport ? `${radarReport.total_findings} CHORES FOUND` : "PRISTINE"}
          bg="#FFFFFF"
          badgeBg={radarReport && radarReport.total_findings > 0 ? "var(--brutal-rose)" : "var(--brutal-lime)"}
        />
      </div>

      {/* Target Use Cases Grid (Students, Developers, Freelancers) */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={20} color="#000000" strokeWidth={2.5} />
            <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#000000", textTransform: "uppercase", margin: 0 }}>
              TAILORED USE CASES
            </h3>
          </div>
          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--text-muted)" }}>
            CLICK ANY USE CASE TO PRE-FILL TASK
          </span>
        </div>

        <div className="use-cases-grid">
          <UseCaseCard
            icon={<Terminal size={18} color="#000000" strokeWidth={2.4} />}
            role="FOR DEVELOPERS"
            title="Repository Hygiene & Docs"
            desc="Locate duplicate media assets, identify missing README sections & setup guides, and organize changelogs."
            tag="DEV CHORE MODE"
            tagBg="var(--brutal-lime)"
            onClick={() => onSelectPrompt("Analyze my repository, find missing README setup instructions, detect duplicate assets, and prepare a cleanup plan.")}
          />
          <UseCaseCard
            icon={<GraduationCap size={18} color="#000000" strokeWidth={2.4} />}
            role="FOR STUDENTS"
            title="Assignment & Folder Organizer"
            desc="Organize assignment directories, remove duplicate downloads, clean build caches, and prepare checklists."
            tag="ACADEMIC CLEANUP"
            tagBg="var(--brutal-yellow)"
            onClick={() => onSelectPrompt("Organize my assignment folder, find duplicate PDFs and assets, and clean temporary notes.")}
          />
          <UseCaseCard
            icon={<Briefcase size={18} color="#000000" strokeWidth={2.4} />}
            role="FOR FREELANCERS"
            title="Client Assets & Deliverables"
            desc="Sort client deliverables, group matching high-res images, audit project gaps, and produce proof receipts."
            tag="CLIENT HANDOFF"
            tagBg="var(--brutal-cyan)"
            onClick={() => onSelectPrompt("Review client asset directory, group duplicate image files, and prepare a summary report with hashes.")}
          />
        </div>
      </div>

      {/* Core Benefits & Architectural Guarantees */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <ShieldCheck size={20} color="#000000" strokeWidth={2.5} />
          <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#000000", textTransform: "uppercase", margin: 0 }}>
            CORE BENEFITS & GUARANTEES
          </h3>
        </div>

        <div className="benefits-grid">
          <div className="brutal-card" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "var(--brutal-lime)", border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                <Lock size={18} color="#000000" />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "900", margin: 0, textTransform: "uppercase" }}>100% Local Sovereignty</h4>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>ZERO CLOUD LEAKS</div>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0, fontWeight: "600" }}>
              Runs fully offline via local Ollama or deterministic planning. Your proprietary code and files never leave your computer.
            </p>
          </div>

          <div className="brutal-card" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "var(--brutal-cyan)", border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                <FileCheck2 size={18} color="#000000" />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "900", margin: 0, textTransform: "uppercase" }}>Proof, Not Promises</h4>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>SHA-256 VERIFIED</div>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0, fontWeight: "600" }}>
              Every planned operation produces an evidence-backed receipt with before/after cryptographic byte hashes and assertions.
            </p>
          </div>

          <div className="brutal-card" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "var(--brutal-yellow)", border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                <RotateCcw size={18} color="#000000" />
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "900", margin: 0, textTransform: "uppercase" }}>One-Click Rollback</h4>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>AUTOMATIC BACKUPS</div>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0, fontWeight: "600" }}>
              Automatic pre-execution file snapshots in `.lazyloop/backups/`. Revert any action bit-for-bit with complete peace of mind.
            </p>
          </div>
        </div>
      </div>

      {/* Radar Section Quick Access */}
      <div className="brutal-card" style={{ padding: "24px", backgroundColor: "#FFFFFF" }}>
        <div className="radar-quick-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>🎯</span>
            <h3 style={{ fontSize: "18px", fontWeight: "900", textTransform: "uppercase", margin: 0 }}>
              Procrastination Radar Quick Status
            </h3>
          </div>
          <button
            onClick={onRefreshRadar}
            disabled={radarScanning}
            style={{
              background: radarScanning ? "var(--brutal-yellow)" : "#FFFFFF",
              border: "var(--border-thick)",
              boxShadow: radarScanning ? "none" : "var(--shadow-brutal-xs)",
              padding: "6px 14px",
              cursor: radarScanning ? "wait" : "pointer",
              fontWeight: "800",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <RefreshCw size={13} className={radarScanning ? "animate-spin" : ""} />
            {radarScanning ? "SCANNING..." : "RESCAN"}
          </button>
        </div>

        {radarReport && radarReport.findings.length > 0 ? (
          <div className="radar-quick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            {radarReport.findings.slice(0, 3).map((f) => (
              <div
                key={f.id}
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-canvas)",
                  border: "var(--border-thick)",
                  boxShadow: "var(--shadow-brutal-xs)",
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "800", fontSize: "14px", color: "#000000" }}>{f.title}</span>
                    <span
                      className="brutal-tag"
                      style={{
                        backgroundColor: f.urgency === "HIGH" ? "var(--brutal-rose)" : "var(--brutal-yellow)",
                        color: f.urgency === "HIGH" ? "#FFFFFF" : "#000000",
                        fontSize: "9px",
                      }}
                    >
                      {f.urgency}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
                    {f.reason}
                  </p>
                </div>
                <button
                  className="brutal-btn-primary"
                  style={{ marginTop: "14px", padding: "6px 12px", fontSize: "11px", width: "100%" }}
                  onClick={() => onSelectPrompt(f.suggested_prompt)}
                >
                  AUTOMATE TASK
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-secondary)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
            ✨ All repository maintenance tasks are up-to-date! No neglected items found.
          </div>
        )}

        <div style={{ marginTop: "18px", borderTop: "2px solid #E5E7EB", paddingTop: "14px", textAlign: "right" }}>
          <button
            onClick={onOpenRadar}
            style={{
              background: "none",
              border: "none",
              fontWeight: "900",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "#000000",
              textTransform: "uppercase",
            }}
          >
            VIEW FULL PROCRASTINATION RADAR <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, badge, bg, badgeBg }: any) {
  return (
    <div
      className="brutal-card"
      style={{
        padding: "20px",
        backgroundColor: bg,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "11px", fontWeight: "900", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "1px" }}>
          {label}
        </div>
        {icon && <div style={{ display: "flex", alignItems: "center" }}>{icon}</div>}
      </div>
      <div style={{ fontSize: "32px", fontWeight: "900", color: "#000000", marginTop: "4px", letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ marginTop: "8px" }}>
        <span
          className="brutal-tag"
          style={{
            backgroundColor: badgeBg,
            fontSize: "10px",
          }}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}

function UseCaseCard({ icon, role, title, desc, tag, tagBg, onClick }: any) {
  return (
    <div
      className="brutal-card"
      onClick={onClick}
      style={{
        padding: "22px",
        backgroundColor: "#FFFFFF",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {icon && (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: tagBg,
                  border: "1.5px solid #000000",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "1.5px 1.5px 0px #000000",
                }}
              >
                {icon}
              </div>
            )}
            <span style={{ fontSize: "11px", fontWeight: "900", color: "#000000", fontFamily: "var(--font-mono)" }}>
              {role}
            </span>
          </div>
          <span className="brutal-tag" style={{ backgroundColor: tagBg, fontSize: "9px" }}>
            {tag}
          </span>
        </div>
        <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#000000", margin: "0 0 8px 0" }}>{title}</h4>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>{desc}</p>
      </div>

      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "900", fontSize: "12px", color: "#000000" }}>
        <span>USE THIS ROUTINE</span>
        <ArrowRight size={14} strokeWidth={2.5} />
      </div>
    </div>
  );
}
