"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Filter, Download, Search, ChevronLeft, ChevronRight, MoreHorizontal, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Family, Location } from "@/lib/types";

const statusPill: Record<string, string> = {
  complete: "green", pending: "amber", review: "blue", incomplete: "red",
};
const PAGE_SIZE = 10;

export default function FamiliesPage() {
  const { user } = useAuth();
  const [families, setFamilies] = useState<(Family & { locations: Location | null })[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("families")
      .select("*, locations(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search) {
      query = query.or(`family_code.ilike.%${search}%,head_of_family.ilike.%${search}%`);
    }
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, count } = await query;
    setFamilies((data ?? []) as (Family & { locations: Location | null })[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchFamilies(); }, [fetchFamilies]);

  useEffect(() => {
    supabase.from("locations").select("*").order("name").then(({ data }) => setLocations(data ?? []));
  }, []);

  const handleSearch = (v: string) => { setSearch(v); setPage(0); };
  const handleFilter = (v: string) => { setStatusFilter(v); setPage(0); };

  return (
    <div className="page-grid">
      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box" style={{ width: 240 }}>
              <Search size={16} />
              <input
                placeholder="Search families..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <select className="filter-chip" value={statusFilter} onChange={(e) => handleFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="pending">Pending</option>
              <option value="review">Review</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-ghost btn-sm"><Download size={14} /> Export</button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add Family
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Family ID</th>
                <th>Head of Family</th>
                <th>Location</th>
                <th>Members</th>
                <th>Survey</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--muted)" }}>Loading...</td></tr>
              ) : families.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--muted)" }}>No families found.</td></tr>
              ) : families.map((f) => (
                <tr key={f.id}>
                  <td className="cell-strong">{f.family_code}</td>
                  <td>{f.head_of_family}</td>
                  <td className="cell-muted">{f.locations?.name ?? "—"}</td>
                  <td>{f.member_count}</td>
                  <td className="cell-muted">{f.survey_name ?? "—"}</td>
                  <td>
                    <span className={`pill ${statusPill[f.status] ?? "gray"}`}>
                      <span className="dot" /> {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                    </span>
                  </td>
                  <td className="cell-muted">{f.last_updated ?? "—"}</td>
                  <td>
                    <button className="icon-btn" style={{ width: 30, height: 30 }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="toolbar" style={{ marginTop: 16 }}>
          <span className="cell-muted" style={{ fontSize: 13 }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()} families
          </span>
          <div className="toolbar-right">
            <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span className="filter-chip">{page + 1}</span>
            <button
              className="icon-btn"
              style={{ width: 34, height: 34 }}
              disabled={(page + 1) * PAGE_SIZE >= total}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddFamilyModal
          locations={locations}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); fetchFamilies(); }}
          actor={user?.user_metadata?.full_name ?? "Admin"}
        />
      )}
    </div>
  );
}

function AddFamilyModal({
  locations, onClose, onCreated, actor,
}: {
  locations: Location[];
  onClose: () => void;
  onCreated: () => void;
  actor: string;
}) {
  const [code, setCode] = useState("");
  const [head, setHead] = useState("");
  const [locationId, setLocationId] = useState("");
  const [survey, setSurvey] = useState("");
  const [status, setStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error } = await supabase.from("families").insert({
      family_code: code,
      head_of_family: head,
      location_id: locationId || null,
      survey_name: survey || null,
      status,
      member_count: 0,
    }).select().single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    await logActivity(actor, `added family ${code}`, "family", "+", "#eef2ff");
    onCreated();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Family</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          {error && <div className="auth-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
          <div className="form-field">
            <label>Family Code</label>
            <input className="input" placeholder="FAM-2848" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Head of Family</label>
            <input className="input" placeholder="John Doe" value={head} onChange={(e) => setHead(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Location</label>
            <select className="select" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">Select location</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Survey Name</label>
            <input className="input" placeholder="Health 2025" value={survey} onChange={(e) => setSurvey(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="complete">Complete</option>
              <option value="review">Review</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          <div className="form-field full" style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Add Family"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
