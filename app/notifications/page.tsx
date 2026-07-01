"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/lib/types";

const typeColor: Record<string, string> = {
  info: "blue", success: "green", warning: "amber", error: "red",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetch();
  };

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    fetch();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="page-grid">
      <div className="toolbar">
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Notifications</h2>
          {unreadCount > 0 && <span className="cell-muted" style={{ fontSize: 13 }}>{unreadCount} unread</span>}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Bell size={32} /></div>
            <h2>No notifications</h2>
            <p>System and activity notifications will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="page-grid">
          {notifications.map((n) => (
            <div key={n.id} className="card" style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              opacity: n.is_read ? 0.6 : 1,
              borderLeft: n.is_read ? "3px solid var(--border)" : "3px solid var(--primary)",
            }}>
              <div className="stat-icon" style={{
                background: n.type === "success" ? "#dcfce7" : n.type === "warning" ? "#fef3c7" : n.type === "error" ? "#fee2e2" : "#dbeafe",
                color: n.type === "success" ? "var(--success)" : n.type === "warning" ? "var(--warning)" : n.type === "error" ? "var(--danger)" : "#1d4ed8",
              }}>
                <Bell size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: 14 }}>{n.title}</h2>
                  <span className={`pill ${typeColor[n.type] ?? "gray"}`}><span className="dot" /> {n.type}</span>
                </div>
                <p className="cell-muted" style={{ fontSize: 13, marginTop: 4 }}>{n.body}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{new Date(n.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                  {!n.is_read && (
                    <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>
                      <Check size={13} /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
