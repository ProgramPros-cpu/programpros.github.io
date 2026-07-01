"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, FileText, Calendar, Users, MoreHorizontal, Copy, Edit, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Form } from "@/lib/types";

const statusPill: Record<string, string> = {
  active: "green", draft: "gray", paused: "amber",
};

export default function FormsPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("forms").select("*").order("created_at", { ascending: false });
    setForms((data ?? []) as Form[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Forms & Surveys</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Create Form
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading forms...</div>
      ) : forms.length === 0 ? (
        <div className="card" style={{ color: "var(--muted)" }}>No forms found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {forms.map((f) => {
            const pct = f.target_responses > 0 ? Math.round((f.response_count / f.target_responses) * 100) : 0;
            return (
              <div key={f.id} className="card">
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div className="stat-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 15 }}>{f.title}</h2>
                      <span className={`pill ${statusPill[f.status] ?? "gray"}`} style={{ marginTop: 4 }}>
                        <span className="dot" /> {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button className="icon-btn" style={{ width: 30, height: 30 }}><MoreHorizontal size={16} /></button>
                </div>

                <p className="cell-muted" style={{ fontSize: 13, marginBottom: 16 }}>{f.description ?? "No description"}</p>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span className="cell-muted">Responses</span>
                    <span className="cell-strong">{f.response_count} / {f.target_responses}</span>
                  </div>
                  <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                </div>

                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={13} /> {f.deadline ?? "No deadline"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={13} /> {pct}% complete
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}><Edit size={13} /> Edit</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}><FileText size={13} /> Results</button>
                  <button className="btn btn-ghost btn-sm"><Copy size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateFormModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchForms(); }}
          actor={user?.user_metadata?.full_name ?? "Admin"}
        />
      )}
    </div>
  );
}

function CreateFormModal({
  onClose, onCreated, actor,
}: {
  onClose: () => void;
  onCreated: () => void;
  actor: string;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("forms").insert({
      title,
      description: desc || null,
      target_responses: target ? parseInt(target) : 0,
      response_count: 0,
      deadline: deadline || null,
      status,
    });

    if (error) { setError(error.message); setSaving(false); return; }

    await logActivity(actor, `created form ${title}`, "form", "+", "#eef2ff");
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Form</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full">
            <label>Form Title</label>
            <input className="input" placeholder="Health Survey 2025" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-field full">
            <label>Description</label>
            <textarea className="textarea" placeholder="Describe the purpose of this form..." value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Target Responses</label>
            <input className="input" type="number" placeholder="1000" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Deadline</label>
            <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Form"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
