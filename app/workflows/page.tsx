"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Workflow, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type WorkflowRow = {
  id: string;
  name: string;
  description: string | null;
  steps: string[] | null;
  status: string;
  created_at: string;
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("workflows").select("*").order("created_at", { ascending: false });
    setWorkflows((data ?? []) as WorkflowRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete workflow "${name}"?`)) return;
    await supabase.from("workflows").delete().eq("id", id);
    setToast("Workflow deleted");
    setTimeout(() => setToast(null), 2500);
    fetch();
  };

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Workflows</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Create Workflow</button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : workflows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Workflow size={32} /></div>
            <h2>No workflows configured</h2>
            <p>Automate data review with approval workflows from submission to verification.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Create Workflow</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {workflows.map((w) => (
            <div key={w.id} className="card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div className="stat-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                  <Workflow size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 15 }}>{w.name}</h2>
                  <span className={`pill ${w.status === "active" ? "green" : "gray"}`} style={{ marginTop: 4 }}>
                    <span className="dot" /> {w.status}
                  </span>
                </div>
                <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--danger)" }} onClick={() => handleDelete(w.id, w.name)}>
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="cell-muted" style={{ fontSize: 13, marginBottom: 12 }}>{w.description ?? "No description"}</p>
              {w.steps && w.steps.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {w.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--primary-soft)", color: "var(--primary)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddWorkflowModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetch(); }} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AddWorkflowModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const steps = stepsText.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("workflows").insert({
      name, description: desc || null, steps, status: "active",
    });
    if (error) { setError(error.message); setSaving(false); return; }
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Workflow</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full"><label>Workflow Name</label><input className="input" placeholder="Submission Review" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-field full"><label>Description</label><input className="input" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="form-field full"><label>Steps (one per line)</label><textarea className="textarea" placeholder={"Submit form\nField worker review\nAdmin approval\nPublished"} value={stepsText} onChange={(e) => setStepsText(e.target.value)} /></div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
