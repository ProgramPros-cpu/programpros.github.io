"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, SlidersHorizontal, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await supabase.from("categories").delete().eq("id", id);
    setToast("Category deleted");
    setTimeout(() => setToast(null), 2500);
    fetch();
  };

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Categories</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Category</button>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : categories.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><SlidersHorizontal size={32} /></div>
            <h2>No categories defined</h2>
            <p>Categories help classify family records into groups for easier filtering.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Category</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {categories.map((c) => (
            <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: c.color ?? "#4f46e5" }} />
              <div>
                <div className="cell-strong">{c.name}</div>
                <div className="cell-muted" style={{ fontSize: 12 }}>{c.description ?? "—"}</div>
              </div>
              <button className="icon-btn" style={{ width: 28, height: 28, color: "var(--danger)" }} onClick={() => handleDelete(c.id, c.name)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddCategoryModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); fetch(); }} actor={user?.user_metadata?.full_name ?? "Admin"} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AddCategoryModal({ onClose, onCreated, actor }: { onClose: () => void; onCreated: () => void; actor: string }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("categories").insert({ name, description: desc || null, color });
    if (error) { setError(error.message); setSaving(false); return; }
    await logActivity(actor, `added category ${name}`, "category", "+", "#eef2ff");
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Category</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full"><label>Category Name</label><input className="input" placeholder="Health" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-field full"><label>Description</label><input className="input" placeholder="Health and wellness data" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="form-field full"><label>Color</label><input className="input" type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 42 }} /></div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
