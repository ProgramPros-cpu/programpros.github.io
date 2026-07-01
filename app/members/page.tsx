"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Download, Search, MoreHorizontal, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Member, Family } from "@/lib/types";

const statusPill: Record<string, string> = {
  verified: "green", pending: "amber", review: "blue", incomplete: "red",
};
const avatarColors = ["#6366f1", "#0891b2", "#d97706", "#16a34a", "#dc2626", "#7c3aed"];
const PAGE_SIZE = 10;

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<(Member & { families: { family_code: string } | null })[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [families, setFamilies] = useState<Pick<Family, "id" | "family_code" | "head_of_family">[]>([]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("members")
      .select("*, families(family_code)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search) query = query.ilike("full_name", `%${search}%`);

    const { data, count } = await query;
    setMembers((data ?? []) as (Member & { families: { family_code: string } | null })[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    supabase.from("families").select("id, family_code, head_of_family").order("family_code").then(({ data }) => setFamilies(data ?? []));
  }, []);

  return (
    <div className="page-grid">
      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box" style={{ width: 240 }}>
              <Search size={16} />
              <input placeholder="Search members..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
            </div>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-ghost btn-sm"><Download size={14} /> Export</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Member</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Family</th><th>Role</th><th>Age</th><th>Gender</th><th>Contact</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--muted)" }}>Loading...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--muted)" }}>No members found.</td></tr>
              ) : members.map((m, i) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: avatarColors[i % avatarColors.length],
                        color: "#fff", display: "grid", placeItems: "center",
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {m.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                      <span className="cell-strong">{m.full_name}</span>
                    </div>
                  </td>
                  <td className="cell-muted">{m.families?.family_code ?? "—"}</td>
                  <td>{m.role ?? "—"}</td>
                  <td>{m.age ?? "—"}</td>
                  <td className="cell-muted">{m.gender ?? "—"}</td>
                  <td className="cell-muted">{m.contact ?? "—"}</td>
                  <td>
                    <span className={`pill ${statusPill[m.status] ?? "gray"}`}>
                      <span className="dot" /> {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </td>
                  <td><button className="icon-btn" style={{ width: 30, height: 30 }}><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="toolbar" style={{ marginTop: 16 }}>
          <span className="cell-muted" style={{ fontSize: 13 }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()} members
          </span>
          <div className="toolbar-right">
            <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
            <span className="filter-chip">{page + 1}</span>
            <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>›</button>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddMemberModal
          families={families}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); fetchMembers(); }}
          actor={user?.user_metadata?.full_name ?? "Admin"}
        />
      )}
    </div>
  );
}

function AddMemberModal({
  families, onClose, onCreated, actor,
}: {
  families: Pick<Family, "id" | "family_code" | "head_of_family">[];
  onClose: () => void;
  onCreated: () => void;
  actor: string;
}) {
  const [familyId, setFamilyId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("head");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from("members").insert({
      family_id: familyId,
      full_name: name,
      role,
      age: age ? parseInt(age) : null,
      gender,
      contact: contact || null,
      status: "pending",
    });

    if (error) { setError(error.message); setSaving(false); return; }

    await supabase.rpc("increment_family_count", { fam_id: familyId }).then(() => {});
    await logActivity(actor, `added member ${name}`, "member", "+", "#eef2ff");
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Member</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field full">
            <label>Family</label>
            <select className="select" value={familyId} onChange={(e) => setFamilyId(e.target.value)} required>
              <option value="">Select family</option>
              {families.map((f) => <option key={f.id} value={f.id}>{f.family_code} — {f.head_of_family}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Full Name</label>
            <input className="input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Role</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="head">Head</option>
              <option value="spouse">Spouse</option>
              <option value="son">Son</option>
              <option value="daughter">Daughter</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-field">
            <label>Age</label>
            <input className="input" type="number" placeholder="35" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Gender</label>
            <select className="select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-field full">
            <label>Contact</label>
            <input className="input" placeholder="+91 98300 12345" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Add Member"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
