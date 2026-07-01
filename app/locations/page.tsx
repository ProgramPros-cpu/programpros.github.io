"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, MapPin, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Location } from "@/lib/types";

export default function LocationsPage() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("locations").select("*").order("name");
    setLocations((data ?? []) as Location[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return;
    await supabase.from("locations").delete().eq("id", id);
    await logActivity(user?.user_metadata?.full_name ?? "Admin", `deleted location ${name}`, "location", "✕", "#fee2e2");
    setToast("Location deleted");
    setTimeout(() => setToast(null), 2500);
    fetch();
  };

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Locations</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Location</button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : locations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><MapPin size={32} /></div>
            <h2>No locations defined</h2>
            <p>Add regions, districts, and areas to organize family data by geography.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Location</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {locations.map((l) => (
            <div key={l.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="stat-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                <MapPin size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="cell-strong">{l.name}</div>
                <div className="cell-muted" style={{ fontSize: 12 }}>{l.region ?? "—"} · {l.code ?? "—"}</div>
              </div>
              <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--danger)" }} onClick={() => handleDelete(l.id, l.name)}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddLocationModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); fetch(); }}
          actor={user?.user_metadata?.full_name ?? "Admin"}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AddLocationModal({ onClose, onCreated, actor }: { onClose: () => void; onCreated: () => void; actor: string }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("locations").insert({ name, region: region || null, code: code || null });
    if (error) { setError(error.message); setSaving(false); return; }
    await logActivity(actor, `added location ${name}`, "location", "+", "#eef2ff");
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Location</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field"><label>Name</label><input className="input" placeholder="Asansol" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-field"><label>Code</label><input className="input" placeholder="ASR" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div className="form-field full"><label>Region</label><input className="input" placeholder="West Bengal" value={region} onChange={(e) => setRegion(e.target.value)} /></div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
