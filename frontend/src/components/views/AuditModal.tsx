import { CheckCircle2, AlertTriangle, FileText, X, Play } from "lucide-react";

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditType: "docs" | "cleanup";
  auditData: any;
  loading: boolean;
  onAutomateWithTaskStudio: (prompt: string) => void;
}

export function AuditModal({
  isOpen,
  onClose,
  auditType,
  auditData,
  loading,
  onAutomateWithTaskStudio,
}: AuditModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="brutal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "680px",
          backgroundColor: "#FFFFFF",
          border: "var(--border-heavy)",
          boxShadow: "8px 8px 0px #000000",
          borderRadius: "8px",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: auditType === "docs" ? "var(--brutal-yellow)" : "var(--brutal-lime)",
            borderBottom: "var(--border-thick)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={20} color="#000000" strokeWidth={2.5} />
            <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#000000", textTransform: "uppercase", margin: 0 }}>
              {auditType === "docs" ? "REPOSITORY DOCUMENTATION AUDIT" : "DUPLICATE ASSETS AUDIT"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#FFFFFF",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "4px",
              fontWeight: "900",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", fontFamily: "var(--font-mono)" }}>
                Auditing repository contents with sandbox validator...
              </div>
            </div>
          ) : auditType === "docs" ? (
            <div>
              <div
                style={{
                  padding: "14px",
                  backgroundColor: "var(--bg-canvas)",
                  border: "2px solid #000000",
                  borderRadius: "6px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "900", fontFamily: "var(--font-mono)" }}>
                    TARGET: {auditData?.doc_path || "README.md"}
                  </span>
                  <span
                    className="brutal-tag"
                    style={{
                      backgroundColor: auditData?.exists ? "var(--brutal-lime)" : "var(--brutal-rose)",
                      color: auditData?.exists ? "#000000" : "#FFFFFF",
                    }}
                  >
                    {auditData?.exists ? "FILE PRESENT" : "FILE MISSING"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                  Size: {auditData?.content_length_chars || 0} characters • TODO/FIXME markers: {auditData?.todo_fixme_count || 0}
                </div>
              </div>

              <h4 style={{ fontSize: "14px", fontWeight: "900", textTransform: "uppercase", marginBottom: "12px" }}>
                Identified Missing Sections ({auditData?.missing_sections?.length || 0}):
              </h4>

              {auditData?.missing_sections?.length === 0 ? (
                <div style={{ padding: "16px", backgroundColor: "#E6FFF2", border: "2px solid #000000", borderRadius: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800" }}>
                    <CheckCircle2 size={16} color="#008037" /> All standard documentation sections are present!
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  {auditData?.missing_sections?.map((section: string, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        backgroundColor: "#FFF9E6",
                        border: "1.5px solid #000000",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      <AlertTriangle size={15} color="#D97706" />
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div
                style={{
                  padding: "14px",
                  backgroundColor: "var(--bg-canvas)",
                  border: "2px solid #000000",
                  borderRadius: "6px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "900" }}>
                  Duplicate Groups Found: {auditData?.duplicate_groups_count || 0}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Scanned with deterministic SHA-256 byte hashing.
                </div>
              </div>

              {auditData?.duplicate_groups?.map((group: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px",
                    border: "1.5px solid #000000",
                    borderRadius: "6px",
                    marginBottom: "10px",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "900", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
                    HASH: {group.hash.slice(0, 16)}... ({group.file_count} copies)
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {group.files.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "var(--bg-canvas)",
            borderTop: "var(--border-thick)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button className="brutal-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="brutal-btn-primary"
            onClick={() => {
              onClose();
              if (auditType === "docs") {
                onAutomateWithTaskStudio(
                  "Draft missing README sections (Usage Instructions, License Information, Contributing Guide) and update documentation."
                );
              } else {
                onAutomateWithTaskStudio(
                  "Review duplicate assets in my project folder and prepare safe deduplication plan with backups."
                );
              }
            }}
          >
            <Play size={14} /> Fix in Task Studio with Proof
          </button>
        </div>
      </div>
    </div>
  );
}
