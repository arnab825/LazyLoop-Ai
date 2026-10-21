import { useState, useRef } from "react";
import {
  ShieldCheck,
  Lock,
  FolderOpen,
  FolderSearch,
  LayoutDashboard,
  Sparkles,
  Terminal,
  FileCheck2,
  Dna,
  Radar,
  Cpu,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  workspacePath: string;
  setWorkspacePath?: (path: string) => void;
  health: any;
  modelsData?: any;
  routinesCount: number;
  radarCount: number;
  currentTaskStatus?: string;
  hasReceipt?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  workspacePath,
  setWorkspacePath,
  health,
  modelsData,
  routinesCount,
  radarCount,
  currentTaskStatus,
  hasReceipt,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const [editingPath, setEditingPath] = useState(false);
  const [tempPath, setTempPath] = useState(workspacePath);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  // Native folder selection via File System Access API with input fallback
  async function handleOpenFolderPicker() {
    try {
      if ("showDirectoryPicker" in window) {
        const handle = await (window as any).showDirectoryPicker();
        if (handle && handle.name) {
          // If the user selected a folder, update workspace
          const chosen = `d:/hacktoberfest/${handle.name}`;
          if (setWorkspacePath) {
            setWorkspacePath(chosen);
          }
          return;
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Folder picker API fallback:", err);
      } else {
        return;
      }
    }

    // Fallback trigger hidden webkitdirectory input
    if (directoryInputRef.current) {
      directoryInputRef.current.click();
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      const relative = (firstFile as any).webkitRelativePath;
      const folderName = relative ? relative.split("/")[0] : firstFile.name;
      const chosen = `d:/hacktoberfest/${folderName}`;
      if (setWorkspacePath) {
        setWorkspacePath(chosen);
      }
    }
  }

  return (
    <aside
      className={`desktop-sidebar ${mobileOpen ? "mobile-open" : ""}`}
    >
      {/* Hidden file input for webkitdirectory fallback */}
      <input
        type="file"
        ref={directoryInputRef}
        onChange={handleFileInputChange}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        style={{ display: "none" }}
      />

      {/* Brand Header — Clean Light Neo-Brutalist Logo */}
      <div
        className="sidebar-brand-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          padding: "8px 10px",
          backgroundColor: "#FFFFFF",
          border: "var(--border-thick)",
          boxShadow: "var(--shadow-brutal-xs)",
          borderRadius: "6px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              backgroundColor: "var(--brutal-yellow)",
              border: "2px solid #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000000",
              borderRadius: "6px",
              flexShrink: 0,
              boxShadow: "2px 2px 0px #000000",
            }}
          >
            <ShieldCheck size={20} strokeWidth={2.6} color="#000000" />
          </div>
          <div>
            <div style={{ fontWeight: "900", fontSize: "15px", letterSpacing: "-0.5px", color: "#000000", textTransform: "uppercase", lineHeight: 1.15 }}>
              LAZYLOOP<span style={{ color: "#000000" }}>.AI</span>
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: "800", letterSpacing: "0.5px", lineHeight: 1.15 }}>
              PROOF_NOT_PROMISES
            </div>
          </div>
        </div>

        {mobileOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            style={{
              padding: "4px 8px",
              border: "1.5px solid #000000",
              backgroundColor: "var(--brutal-rose)",
              color: "#FFFFFF",
              fontWeight: "900",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div
        className="sidebar-nav-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          flexShrink: 0,
          paddingRight: "0px",
        }}
      >
        <div style={{ fontSize: "10px", fontWeight: "900", color: "#000000", textTransform: "uppercase", letterSpacing: "0.8px", padding: "4px 6px 2px" }}>
          Workspace
        </div>

        <BrutalNavItem
          icon={<LayoutDashboard size={17} strokeWidth={2.2} />}
          label="Overview"
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <BrutalNavItem
          icon={<Sparkles size={17} strokeWidth={2.2} />}
          label="Task Studio"
          active={activeTab === "new_task"}
          onClick={() => setActiveTab("new_task")}
        />
        <BrutalNavItem
          icon={<Terminal size={17} strokeWidth={2.2} />}
          label="Execution Log"
          active={activeTab === "execution"}
          badge={currentTaskStatus}
          badgeBg="var(--brutal-yellow)"
          onClick={() => setActiveTab("execution")}
        />
        <BrutalNavItem
          icon={<FileCheck2 size={17} strokeWidth={2.2} />}
          label="Proof Receipts"
          active={activeTab === "receipts"}
          badge={hasReceipt ? "READY" : undefined}
          badgeBg="var(--brutal-lime)"
          onClick={() => setActiveTab("receipts")}
        />

        <div style={{ fontSize: "10px", fontWeight: "900", color: "#000000", textTransform: "uppercase", letterSpacing: "0.8px", padding: "8px 6px 2px" }}>
          Automation
        </div>

        <BrutalNavItem
          icon={<Dna size={17} strokeWidth={2.2} />}
          label="Routine DNA"
          active={activeTab === "routines"}
          badge={routinesCount > 0 ? `${routinesCount}` : undefined}
          badgeBg="var(--brutal-cyan)"
          onClick={() => setActiveTab("routines")}
        />
        <BrutalNavItem
          icon={<Radar size={17} strokeWidth={2.2} />}
          label="Procrastination Radar"
          active={activeTab === "radar"}
          badge={radarCount > 0 ? `${radarCount}` : undefined}
          badgeBg="var(--brutal-rose)"
          onClick={() => setActiveTab("radar")}
        />
        <BrutalNavItem
          icon={<Cpu size={17} strokeWidth={2.2} />}
          label="Model Swap Lab"
          active={activeTab === "models"}
          badge={health?.ollama_connected || modelsData?.ollama_available ? "OLLAMA" : "MOCK"}
          badgeBg={health?.ollama_connected || modelsData?.ollama_available ? "var(--brutal-lime)" : "#F3F4F6"}
          onClick={() => setActiveTab("models")}
        />
      </div>

      {/* Interactive Workspace Boundary Card with Windows File Picker */}
      <div
        className="sidebar-sandbox-card"
        style={{
          marginTop: "auto",
          padding: "10px 10px",
          backgroundColor: "#FFFFFF",
          border: "var(--border-thick)",
          boxShadow: "var(--shadow-brutal-xs)",
          borderRadius: "6px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Lock size={13} color="#000000" strokeWidth={2.4} />
            <span style={{ fontSize: "10.5px", fontWeight: "900", color: "#000000", textTransform: "uppercase", fontFamily: "var(--font-mono)", letterSpacing: "0.3px" }}>
              SANDBOX PERIMETER
            </span>
          </div>
          <span
            style={{
              fontSize: "8.5px",
              padding: "2px 6px",
              backgroundColor: "var(--brutal-lime)",
              color: "#000000",
              fontWeight: "900",
              fontFamily: "var(--font-mono)",
              border: "1.5px solid #000000",
              borderRadius: "4px",
              boxShadow: "1px 1px 0px #000000",
            }}
          >
            RESTRICTED
          </span>
        </div>

        {/* Workspace directory display with Windows folder picker */}
        {!editingPath ? (
          <div
            style={{
              padding: "7px 9px",
              backgroundColor: "var(--bg-canvas)",
              border: "1.5px solid #000000",
              borderRadius: "5px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
              <FolderOpen size={14} color="#000000" style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  fontFamily: "var(--font-mono)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#000000",
                }}
              >
                {workspacePath.split("/").pop() || "ROOT"}
              </span>
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                marginTop: "3px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {workspacePath}
            </div>

            {/* Quick Actions: Select Folder (Windows dialog) or Edit Path */}
            <div style={{ display: "flex", gap: "6px", marginTop: "7px" }}>
              <button
                onClick={handleOpenFolderPicker}
                style={{
                  flex: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  padding: "5px 8px",
                  backgroundColor: "var(--brutal-yellow)",
                  color: "#000000",
                  border: "1.5px solid #000000",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "900",
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                  boxShadow: "1px 1px 0px #000000",
                }}
                title="Open Windows folder location picker"
              >
                <FolderSearch size={12} /> BROWSE...
              </button>
              <button
                onClick={() => setEditingPath(true)}
                style={{
                  padding: "5px 8px",
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  border: "1.5px solid #000000",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "900",
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                  boxShadow: "1px 1px 0px #000000",
                }}
                title="Enter custom path manually"
              >
                EDIT ✏️
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <input
              type="text"
              value={tempPath}
              onChange={(e) => setTempPath(e.target.value)}
              placeholder="e.g. d:/my-project"
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                border: "1.5px solid #000000",
                borderRadius: "4px",
                outline: "none",
                backgroundColor: "#FFFDF0",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "5px" }}>
              <button
                onClick={() => {
                  if (setWorkspacePath && tempPath.trim()) {
                    setWorkspacePath(tempPath.trim());
                  }
                  setEditingPath(false);
                }}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  backgroundColor: "var(--brutal-lime)",
                  border: "1.5px solid #000000",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                APPLY
              </button>
              <button
                onClick={() => {
                  setTempPath(workspacePath);
                  setEditingPath(false);
                }}
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#E5E7EB",
                  border: "1.5px solid #000000",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "900",
                  cursor: "pointer",
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Security & Isolation Status Indicator */}
        <div style={{ marginTop: "7px", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1.5px dashed #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: health?.ollama_connected ? "var(--brutal-lime)" : "var(--brutal-yellow)",
                border: "1.5px solid #000000",
              }}
            />
            <span style={{ fontSize: "9.5px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#000000" }}>
              {health?.ollama_connected ? "OLLAMA_ONLINE" : "DETERMINISTIC_FALLBACK"}
            </span>
          </div>
          <span style={{ fontSize: "9px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: "700" }}>
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}

function BrutalNavItem({
  icon,
  label,
  active,
  badge,
  badgeBg = "#FFFFFF",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  badgeBg?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "7.5px 11px",
        backgroundColor: active ? "var(--brutal-lime)" : "transparent",
        color: "#000000",
        border: active ? "var(--border-thick)" : "2px solid transparent",
        boxShadow: active ? "var(--shadow-brutal-xs)" : "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: active ? "900" : "800",
        fontSize: "12.5px",
        textTransform: "uppercase",
        letterSpacing: "0.2px",
        lineHeight: 1.3,
        transition: "all 0.1s ease",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ display: "flex", alignItems: "center", color: "#000000" }}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span
          style={{
            fontSize: "9.5px",
            padding: "1.5px 5px",
            backgroundColor: badgeBg,
            color: "#000000",
            fontWeight: "900",
            fontFamily: "var(--font-mono)",
            border: "1.5px solid #000000",
            borderRadius: "3px",
            boxShadow: "1px 1px 0px #000000",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
