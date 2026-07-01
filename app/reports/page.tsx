"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, TrendingUp, Users, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalMembers: 0,
    totalForms: 0,
    totalSubmissions: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });
  const [byLocation, setByLocation] = useState<{ name: string; count: number }[]>([]);
  const [byStatus, setByStatus] = useState<{ status: string; count: number }[]>([]);
  const [byForm, setByForm] = useState<{ title: string; responses: number; target: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [fam, mem, forms, subs, verified, pending, rejected] = await Promise.all([
        supabase.from("families").select("*", { count: "exact", head: true }),
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("forms").select("*", { count: "exact", head: true }),
        supabase.from("submissions").select("*", { count: "exact", head: true }),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "verified"),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "rejected"),
      ]);

      setStats({
        totalFamilies: fam.count ?? 0,
        totalMembers: mem.count ?? 0,
        totalForms: forms.count ?? 0,
        totalSubmissions: subs.count ?? 0,
        verified: verified.count ?? 0,
        pending: pending.count ?? 0,
        rejected: rejected.count ?? 0,
      });

      const { data: locData } = await supabase
        .from("families")
        .select("locations(name)")
        .not("location_id", "is", null);

      const locMap = new Map<string, number>();
      (locData ?? []).forEach((r: any) => {
        const name = r.locations?.name ?? "Unknown";
        locMap.set(name, (locMap.get(name) ?? 0) + 1);
      });
      setByLocation(Array.from(locMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));

      const { data: statusData } = await supabase.from("families").select("status");
      const statusMap = new Map<string, number>();
      (statusData ?? []).forEach((r: any) => {
        statusMap.set(r.status, (statusMap.get(r.status) ?? 0) + 1);
      });
      setByStatus(Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })));

      const { data: formData } = await supabase.from("forms").select("title, response_count, target_responses");
      setByForm((formData ?? []).map((f: any) => ({ title: f.title, responses: f.response_count, target: f.target_responses })));

      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="card" style={{ color: "var(--muted)" }}>Generating reports...</div>;

  const maxLoc = Math.max(...byLocation.map((l) => l.count), 1);
  const reportCards = [
    { label: "Total Families", value: stats.totalFamilies, icon: Users, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Total Members", value: stats.totalMembers, icon: Users, color: "#0891b2", bg: "#ecfeff" },
    { label: "Total Forms", value: stats.totalForms, icon: FileText, color: "#d97706", bg: "#fffbeb" },
    { label: "Verified Submissions", value: stats.verified, icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
  ];

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Reports & Analytics</h2>
        <button className="btn btn-ghost btn-sm"><Download size={14} /> Export Report</button>
      </div>

      <div className="stat-grid">
        {reportCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                  <Icon size={20} />
                </div>
                <TrendingUp size={16} style={{ color: "var(--success)" }} />
              </div>
              <div>
                <div className="stat-value">{s.value.toLocaleString()}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div><h2>Families by Location</h2><p>Distribution across regions</p></div>
            <BarChart3 size={18} className="cell-muted" />
          </div>
          {byLocation.length === 0 ? (
            <p className="cell-muted">No location data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {byLocation.map((l) => (
                <div key={l.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span className="cell-strong">{l.name}</span>
                    <span className="cell-muted">{l.count} families</span>
                  </div>
                  <div className="progress"><span style={{ width: `${(l.count / maxLoc) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div><h2>Family Status Breakdown</h2><p>Collection completion status</p></div>
            <BarChart3 size={18} className="cell-muted" />
          </div>
          {byStatus.length === 0 ? (
            <p className="cell-muted">No status data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {byStatus.map((s) => {
                const pct = stats.totalFamilies > 0 ? Math.round((s.count / stats.totalFamilies) * 100) : 0;
                return (
                  <div key={s.status}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span className="cell-strong" style={{ textTransform: "capitalize" }}>{s.status}</span>
                      <span className="cell-muted">{s.count} ({pct}%)</span>
                    </div>
                    <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div><h2>Form Response Summary</h2><p>Response rates across all active forms</p></div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Form Title</th><th>Responses</th><th>Target</th><th>Completion</th></tr>
            </thead>
            <tbody>
              {byForm.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)" }}>No form data available.</td></tr>
              ) : byForm.map((f) => {
                const pct = f.target > 0 ? Math.round((f.responses / f.target) * 100) : 0;
                return (
                  <tr key={f.title}>
                    <td className="cell-strong">{f.title}</td>
                    <td>{f.responses}</td>
                    <td className="cell-muted">{f.target}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="progress" style={{ flex: 1 }}><span style={{ width: `${pct}%` }} /></div>
                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 36 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
