"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, FolderTree, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Program } from "@/lib/types";

const statusPill: Record<string, string> = { active: "green", paused: "amber", completed: "gray" };

export default function ProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("programs").select("*").order("created_at", { ascending: false });
    setPrograms((data ?? []) as Program[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete program "${name}"?`)) return;
    await supabase.from("programs").delete().eq("id", id);
    setToast("Program deleted");
    setTimeout(() => setToast(null), 2500);
    fetch();
  };

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Programs</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Create Program</button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : programs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><FolderTree size={32} /></div>
            <h2>No programs created</h2>
            <p>Create a program to organize welfare, health, or education initiatives.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Create Program</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {programs.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div className="stat-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                  <FolderTree size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 15 }}>{p.name}</h2>
                  <span className={`pill ${statusPill[p.status] ?? "gray"}`} style={{ marginTop: 4 }}>
                    <span className="dot" /> {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
                <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--danger)" }} onClick={() => handleDelete(p.id, p.name)}>
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="cell-muted" style={{ fontSize: 13 }}>{p.description ?? "No description"}</p>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
                <span>Start: {p.start_date ?? "—"}</span>
                <span>End: {p.end_date ?? "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddProgramModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetch(); }} actor={user?.user_metadata?.full_name ?? "Admin"} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AddProgramModal({ onClose, onCreated, actor }: { onClose: () => void; onCreated: () => void; actor: string }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("active");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("programs").insert({
      name, description: desc || null, status,
      start_date: start || null, end_date: end || null,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    await logActivity(actor, `created program ${name}`, "program", "+", "#eef2ff");
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Program</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full"><label>Program Name</label><input className="input" placeholder="Family Welfare Initiative" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-field full"><label>Description</label><textarea className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="form-field"><label>Start Date</label><input className="input" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="form-field"><label>End Date</label><input className="input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <div className="form-field"><label>Status</label><select className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
