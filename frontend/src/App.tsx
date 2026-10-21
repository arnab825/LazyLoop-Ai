import { useState, useEffect } from "react";
import {
  checkHealth,
  createTask,
  getTask,
  submitApprovals,
  undoTask,
  listRoutines,
  createRoutine,
  scanRadar,
  getModels,
  auditDocs,
  getDuplicateFiles,
} from "./api";
import type { Task, ToolStep, Routine, RadarReport } from "./types";
import { Sidebar } from "./components/Sidebar";
import { OverviewView } from "./components/views/OverviewView";
import { TaskStudioView } from "./components/views/TaskStudioView";
import { ExecutionView } from "./components/views/ExecutionView";
import { ReceiptsView } from "./components/views/ReceiptsView";
import { RoutinesView } from "./components/views/RoutinesView";
import { RadarView } from "./components/views/RadarView";
import { ModelsView } from "./components/views/ModelsView";
import { AuditModal } from "./components/views/AuditModal";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "new_task" | "execution" | "receipts" | "routines" | "radar" | "models"
  >("overview");

  // System & Workspace State
  const [health, setHealth] = useState<any>(null);
  const [workspacePath, setWorkspacePath] = useState<string>("d:/hacktoberfest/LazyLoop Ai");

  // New Task State
  const [prompt, setPrompt] = useState<string>(
    "Analyze my project folder, identify duplicate files, find documentation gaps, and prepare a cleanup plan."
  );
  const [autonomyMode, setAutonomyMode] = useState<string>("SAFE_AUTO");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [undoStatus, setUndoStatus] = useState<any>(null);

  // Routines & Radar
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineName, setRoutineName] = useState<string>("");
  const [routineSaved, setRoutineSaved] = useState<boolean>(false);
  const [radarReport, setRadarReport] = useState<RadarReport | null>(null);
  const [radarScanning, setRadarScanning] = useState<boolean>(false);

  // Model Lab
  const [modelsData, setModelsData] = useState<any>(null);

  // Live Notifications
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "notif-1",
      type: "success",
      title: "Workspace Verified",
      message: "Restricted sandbox successfully initialized and validated.",
      timestamp: "Just now",
      read: false,
    },
    {
      id: "notif-2",
      type: "info",
      title: "Engine Ready",
      message: "Deterministic mock provider active with zero dependencies.",
      timestamp: "2m ago",
      read: false,
    },
  ]);

  useEffect(() => {
    loadHealthAndModels();
    loadRoutines();
    handleScanRadar();
  }, []);

  // Mobile Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Lock background scrolling when mobile navigation drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  async function loadHealthAndModels() {
    try {
      const h = await checkHealth();
      setHealth(h);
      const m = await getModels();
      setModelsData(m);
    } catch (e) {
      console.warn("Backend not ready yet:", e);
    }
  }

  async function loadRoutines() {
    try {
      const list = await listRoutines();
      setRoutines(list);
    } catch (e) {
      console.warn("Failed to load routines:", e);
    }
  }

  async function handleCreateTask() {
    if (!workspacePath) return;
    setLoading(true);
    setUndoStatus(null);
    setRoutineSaved(false);
    try {
      const task = await createTask(prompt, workspacePath, autonomyMode);
      setCurrentTask(task);
      setActiveTab("execution");
    } catch (e: any) {
      alert("Error creating task: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveStep(step: ToolStep, approved: boolean) {
    if (!currentTask || !step.approval) return;
    setLoading(true);
    try {
      const updated = await submitApprovals(currentTask.id, [
        {
          step_id: step.id,
          token: step.approval.id,
          approved,
        },
      ]);
      setCurrentTask(updated);
    } catch (e: any) {
      alert("Approval error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUndo() {
    if (!currentTask) return;
    setLoading(true);
    try {
      const res = await undoTask(currentTask.id, workspacePath);
      setUndoStatus(res);
      const updated = await getTask(currentTask.id);
      setCurrentTask(updated);
    } catch (e: any) {
      alert("Undo error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveRoutine() {
    if (!currentTask || !routineName) return;
    try {
      await createRoutine(routineName, `Workflow created from task "${currentTask.prompt}"`, currentTask.id, workspacePath);
      setRoutineSaved(true);
      loadRoutines();
    } catch (e: any) {
      alert("Routine error: " + e.message);
    }
  }

  async function handleScanRadar() {
    if (!workspacePath) return;
    setRadarScanning(true);
    const startTime = Date.now();
    try {
      const report = await scanRadar(workspacePath);
      // Ensure at least 400ms passes so the spin animation is clearly visible
      const elapsed = Date.now() - startTime;
      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }
      setRadarReport(report);
    } catch (e: any) {
      console.warn("Radar scan error:", e);
    } finally {
      setRadarScanning(false);
    }
  }

  // Direct Audit Diagnostics Modal State
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);
  const [auditType, setAuditType] = useState<"docs" | "cleanup">("docs");
  const [auditData, setAuditData] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  async function handleOpenDirectAudit(type: "docs" | "cleanup") {
    setAuditType(type);
    setAuditModalOpen(true);
    setAuditLoading(true);
    try {
      if (type === "docs") {
        const res = await auditDocs(workspacePath, "README.md");
        setAuditData(res);
      } else {
        const res = await getDuplicateFiles(workspacePath);
        setAuditData(res);
      }
    } catch (e: any) {
      alert(`Audit failed: ${e.message}`);
      setAuditModalOpen(false);
    } finally {
      setAuditLoading(false);
    }
  }

  return (
    <div className="app-container">
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`hamburger-btn ${mobileMenuOpen ? "is-active" : ""}`}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar bar-top" />
            <span className="hamburger-bar bar-middle" />
            <span className="hamburger-bar bar-bottom" />
          </button>
          <div style={{ fontWeight: "900", fontSize: "16px", textTransform: "uppercase" }}>
            LAZYLOOP<span style={{ color: "#000000" }}>.AI</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "9px",
              padding: "2px 6px",
              backgroundColor: "var(--brutal-lime)",
              fontWeight: "900",
              border: "1.5px solid #000000",
              borderRadius: "3px",
            }}
          >
            LOCAL
          </span>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? "is-active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Neo-Brutalist Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(t) => {
          setActiveTab(t);
          setMobileMenuOpen(false);
        }}
        workspacePath={workspacePath}
        setWorkspacePath={setWorkspacePath}
        health={health}
        routinesCount={routines.length}
        radarCount={radarReport?.total_findings || 0}
        currentTaskStatus={currentTask?.status}
        hasReceipt={!!currentTask?.receipt}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === "overview" && (
          <OverviewView
            routines={routines}
            radarReport={radarReport}
            radarScanning={radarScanning}
            notifications={notifications}
            onMarkAllNotificationsRead={() =>
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            }
            onClearNotifications={() => setNotifications([])}
            onRunSmartCleanup={() => handleOpenDirectAudit("cleanup")}
            onAuditDocs={() => handleOpenDirectAudit("docs")}
            onOpenTaskStudio={() => setActiveTab("new_task")}
            onOpenRadar={() => setActiveTab("radar")}
            onRefreshRadar={handleScanRadar}
            onSelectPrompt={(selectedPrompt) => {
              setPrompt(selectedPrompt);
              setActiveTab("new_task");
            }}
          />
        )}

        {activeTab === "new_task" && (
          <TaskStudioView
            workspacePath={workspacePath}
            setWorkspacePath={setWorkspacePath}
            autonomyMode={autonomyMode}
            setAutonomyMode={setAutonomyMode}
            prompt={prompt}
            setPrompt={setPrompt}
            loading={loading}
            onExecute={handleCreateTask}
          />
        )}

        {activeTab === "execution" && (
          <ExecutionView
            currentTask={currentTask}
            loading={loading}
            undoStatus={undoStatus}
            routineName={routineName}
            setRoutineName={setRoutineName}
            routineSaved={routineSaved}
            onUndo={handleUndo}
            onViewReceipt={() => setActiveTab("receipts")}
            onApproveStep={handleApproveStep}
            onSaveRoutine={handleSaveRoutine}
            onGoToStudio={() => setActiveTab("new_task")}
          />
        )}

        {activeTab === "receipts" && (
          <ReceiptsView
            currentTask={currentTask}
            onGoToStudio={() => setActiveTab("new_task")}
          />
        )}

        {activeTab === "routines" && (
          <RoutinesView
            routines={routines}
            onReplay={(rName) => {
              setPrompt(`Replay routine "${rName}" on my workspace`);
              setActiveTab("new_task");
            }}
            onGoToStudio={() => setActiveTab("new_task")}
          />
        )}

        {activeTab === "radar" && (
          <RadarView
            radarReport={radarReport}
            radarScanning={radarScanning}
            onRefresh={handleScanRadar}
            onAutomate={(p) => {
              setPrompt(p);
              setActiveTab("new_task");
            }}
          />
        )}

        {activeTab === "models" && <ModelsView modelsData={modelsData} />}
      </main>

      {/* Direct Audit Modal Diagnostics */}
      <AuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        auditType={auditType}
        auditData={auditData}
        loading={auditLoading}
        onAutomateWithTaskStudio={(newPrompt) => {
          setPrompt(newPrompt);
          setActiveTab("new_task");
        }}
      />
    </div>
  );
}
