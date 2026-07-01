"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, SlidersHorizontal, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CustomField } from "@/lib/types";

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("custom_fields").select("*").order("created_at", { ascending: false });
    setFields((data ?? []) as CustomField[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete custom field "${name}"?`)) return;
    await supabase.from("custom_fields").delete().eq("id", id);
    setToast("Custom field deleted");
    setTimeout(() => setToast(null), 2500);
    fetch();
  };

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Custom Fields</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Custom Field</button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : fields.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><SlidersHorizontal size={32} /></div>
            <h2>No custom fields</h2>
            <p>Create custom fields to capture additional family data beyond the standard form.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Custom Field</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Field Name</th><th>Type</th><th>Applies To</th><th></th></tr></thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.id}>
                    <td className="cell-strong">{f.name}</td>
                    <td><span className="pill gray"><span className="dot" /> {f.field_type}</span></td>
                    <td className="cell-muted">{f.entity_type}</td>
                    <td><button className="icon-btn" style={{ width: 30, height: 30, color: "var(--danger)" }} onClick={() => handleDelete(f.id, f.name)}><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddFieldModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetch(); }} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AddFieldModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [entityType, setEntityType] = useState("family");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("custom_fields").insert({ name, field_type: fieldType, entity_type: entityType });
    if (error) { setError(error.message); setSaving(false); return; }
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Custom Field</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full"><label>Field Name</label><input className="input" placeholder="Annual Income" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-field"><label>Field Type</label>
            <select className="select" value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
              <option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="dropdown">Dropdown</option>
            </select>
          </div>
          <div className="form-field"><label>Applies To</label>
            <select className="select" value={entityType} onChange={(e) => setEntityType(e.target.value)}>
              <option value="family">Family</option><option value="member">Member</option>
            </select>
          </div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
