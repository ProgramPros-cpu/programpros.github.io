"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Megaphone, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Announcement } from "@/lib/types";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements((data ?? []) as Announcement[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    setToast("Announcement deleted");
    setTimeout(() => setToast(null), 2500);
    fetch();
  };

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Announcements</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> New Announcement</button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Megaphone size={32} /></div>
            <h2>No announcements posted</h2>
            <p>Post announcements to notify field workers about updates and deadlines.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> New Announcement</button>
          </div>
        </div>
      ) : (
        <div className="page-grid">
          {announcements.map((a) => (
            <div key={a.id} className="card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div className="stat-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                  <Megaphone size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ fontSize: 15 }}>{a.title}</h2>
                    <button className="icon-btn" style={{ width: 28, height: 28, color: "var(--danger)" }} onClick={() => handleDelete(a.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="cell-muted" style={{ fontSize: 13, marginTop: 6 }}>{a.body}</p>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
                    <span className={`pill ${a.status === "active" ? "green" : "gray"}`}><span className="dot" /> {a.status}</span>
                    <span>{new Date(a.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddAnnouncementModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetch(); }} actor={user?.user_metadata?.full_name ?? "Admin"} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AddAnnouncementModal({ onClose, onCreated, actor }: { onClose: () => void; onCreated: () => void; actor: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("announcements").insert({ title, body: body || null, status: "active" });
    if (error) { setError(error.message); setSaving(false); return; }
    await logActivity(actor, `posted announcement ${title}`, "announcement", "+", "#eef2ff");
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>New Announcement</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full"><label>Title</label><input className="input" placeholder="New Survey Launched" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div className="form-field full"><label>Message</label><textarea className="textarea" placeholder="Write your announcement..." value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Posting..." : "Post"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
