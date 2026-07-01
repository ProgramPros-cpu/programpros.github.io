"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, X, Inbox } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import { useAuth } from "@/components/AuthProvider";
import type { Submission } from "@/lib/types";

const statusPill: Record<string, string> = {
  pending: "amber", verified: "green", review: "blue", rejected: "red",
};
const PAGE_SIZE = 10;

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const actor = user?.user_metadata?.full_name ?? "Admin";

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("submissions")
      .select("*, forms(title), families(family_code,head_of_family)", { count: "exact" })
      .order("submitted_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data, count } = await query;
    setSubmissions((data ?? []) as Submission[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const updateStatus = async (id: string, status: string, label: string) => {
    const { error } = await supabase.from("submissions").update({ status }).eq("id", id);
    if (!error) {
      await logActivity(actor, `${label} a submission`, "submission", status === "verified" ? "✓" : "✕", status === "verified" ? "#dcfce7" : "#fee2e2");
      setToast(`Submission ${label}`);
      setTimeout(() => setToast(null), 2500);
      fetchSubmissions();
    }
  };

  return (
    <div className="page-grid">
      <div className="card">
        <div className="toolbar">
          <h2 className="section-title" style={{ margin: 0 }}>Submissions</h2>
          <select className="filter-chip" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="review">Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Form</th><th>Family</th><th>Submitted By</th><th>Status</th><th>Submitted At</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>Loading...</td></tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48 }}>
                    <div className="empty-state" style={{ padding: 0 }}>
                      <div className="empty-icon"><Inbox size={32} /></div>
                      <h2>No submissions yet</h2>
                      <p>Form submissions from field workers will appear here for review.</p>
                    </div>
                  </td>
                </tr>
              ) : submissions.map((s) => (
                <tr key={s.id}>
                  <td className="cell-strong">{s.forms?.title ?? "—"}</td>
                  <td>{s.families ? `${s.families.family_code} — ${s.families.head_of_family}` : "—"}</td>
                  <td className="cell-muted">{s.submitted_by ?? "—"}</td>
                  <td>
                    <span className={`pill ${statusPill[s.status] ?? "gray"}`}>
                      <span className="dot" /> {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                  <td className="cell-muted">
                    {new Date(s.submitted_at).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    {s.status === "pending" || s.status === "review" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--success)" }} onClick={() => updateStatus(s.id, "verified", "approved")}>
                          <Check size={16} />
                        </button>
                        <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--danger)" }} onClick={() => updateStatus(s.id, "rejected", "rejected")}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="cell-muted" style={{ fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="toolbar" style={{ marginTop: 16 }}>
          <span className="cell-muted" style={{ fontSize: 13 }}>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} submissions
          </span>
          <div className="toolbar-right">
            <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button>
            <span className="filter-chip">{page + 1}</span>
            <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>›</button>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
