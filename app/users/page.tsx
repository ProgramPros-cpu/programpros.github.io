"use client";

import { useEffect, useState, useCallback } from "react";
import { UserCog, Plus, X, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
};

const rolePill: Record<string, string> = {
  admin: "blue", field_worker: "green", reviewer: "amber", viewer: "gray",
};
const avatarColors = ["#6366f1", "#0891b2", "#d97706", "#16a34a", "#dc2626", "#7c3aed"];

export default function UsersPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false });
    setProfiles((data ?? []) as UserProfile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove user "${name}"?`)) return;
    await supabase.from("user_profiles").delete().eq("id", id);
    setToast("User removed");
    setTimeout(() => setToast(null), 2500);
    fetch();
  };

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Users & Roles</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add User</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>Loading...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 48 }}>
                  <div className="empty-state" style={{ padding: 0 }}>
                    <div className="empty-icon"><UserCog size={32} /></div>
                    <h2>No users configured</h2>
                    <p>Add administrators, field workers, and reviewers to manage data collection.</p>
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add User</button>
                  </div>
                </td></tr>
              ) : profiles.map((p, i) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: avatarColors[i % avatarColors.length],
                        color: "#fff", display: "grid", placeItems: "center",
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {p.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      <span className="cell-strong">{p.full_name}</span>
                    </div>
                  </td>
                  <td className="cell-muted">{p.email ?? "—"}</td>
                  <td><span className={`pill ${rolePill[p.role] ?? "gray"}`}><span className="dot" /> {p.role.replace("_", " ")}</span></td>
                  <td><span className={`pill ${p.status === "active" ? "green" : "red"}`}><span className="dot" /> {p.status}</span></td>
                  <td className="cell-muted">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                  <td>
                    <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--danger)" }} onClick={() => handleDelete(p.id, p.full_name)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddUserModal
          currentUser={user}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); fetch(); }}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AddUserModal({ currentUser, onClose, onCreated }: { currentUser: User | null; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("user_profiles").insert({
      full_name: name,
      email: email || null,
      role,
      status: "active",
      user_id: currentUser?.id ?? null,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>Add User</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full"><label>Full Name</label><input className="input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="form-field"><label>Email</label><input className="input" type="email" placeholder="john@familydata.gov" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="form-field"><label>Role</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="field_worker">Field Worker</option>
              <option value="reviewer">Reviewer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Adding..." : "Add User"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
