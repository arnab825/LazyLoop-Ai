import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClear: () => void;
}

export function NotificationBell({
  notifications,
  onMarkAllAsRead,
  onClear,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "42px",
          height: "42px",
          backgroundColor: "#FFFFFF",
          border: "var(--border-thick)",
          boxShadow: "var(--shadow-brutal-xs)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          transition: "transform 0.1s ease",
        }}
        aria-label="Notifications"
      >
        <Bell size={20} color="#000000" strokeWidth={2.4} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              backgroundColor: "var(--brutal-rose)",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: "900",
              fontFamily: "var(--font-mono)",
              padding: "1px 5px",
              borderRadius: "10px",
              border: "1.5px solid #000000",
              boxShadow: "1px 1px 0px #000000",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Drawer Dropdown */}
      {open && (
        <div
          className="notif-dropdown"
          style={{
            position: "absolute",
            top: "50px",
            right: 0,
            width: "360px",
            backgroundColor: "#FFFFFF",
            border: "var(--border-heavy)",
            boxShadow: "var(--shadow-brutal-lg)",
            borderRadius: "6px",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              backgroundColor: "var(--brutal-yellow)",
              borderBottom: "var(--border-thick)",
            }}
          >
            <div style={{ fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>
              NOTIFICATIONS [{notifications.length}]
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {notifications.length > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: "800",
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  MARK ALL READ
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "#000000",
                  color: "#FFFFFF",
                  border: "none",
                  width: "24px",
                  height: "24px",
                  borderRadius: "3px",
                  fontWeight: "900",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "4px",
                }}
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #E5E7EB",
                    backgroundColor: n.read ? "#FFFFFF" : "#FFFDF0",
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <div style={{ marginTop: "2px", flexShrink: 0 }}>
                    {n.type === "success" && <CheckCircle2 size={16} color="#059669" />}
                    {n.type === "warning" && <AlertTriangle size={16} color="#D97706" />}
                    {n.type === "info" && <Info size={16} color="#0284C7" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "800", fontSize: "13px", color: "#000000" }}>{n.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px", lineHeight: "1.4" }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                      {n.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "2px solid #E5E7EB", textAlign: "right", backgroundColor: "#F9FAFB" }}>
              <button
                onClick={onClear}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brutal-rose)",
                  fontWeight: "800",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  cursor: "pointer",
                }}
              >
                CLEAR ALL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
