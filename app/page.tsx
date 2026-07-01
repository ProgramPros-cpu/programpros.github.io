"use client";

import { useEffect, useState } from "react";
import {
  Users, UserCog, FileText, TrendingUp, TrendingDown,
  MoreHorizontal, Download, Inbox,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/queries";
import type { Family, ActivityLog, Location } from "@/lib/types";

const statusPill: Record<string, string> = {
  complete: "green", verified: "green",
  pending: "amber",
  review: "blue",
  incomplete: "red", rejected: "red",
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalFamilies: 0, totalMembers: 0, activeForms: 0, pendingReviews: 0 });
  const [families, setFamilies] = useState<(Family & { locations: Location | null })[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [fam, mem, forms, pend] = await Promise.all([
        supabase.from("families").select("*", { count: "exact", head: true }),
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("forms").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        totalFamilies: fam.count ?? 0,
        totalMembers: mem.count ?? 0,
        activeForms: forms.count ?? 0,
        pendingReviews: pend.count ?? 0,
      });

      const { data: recentFams } = await supabase
        .from("families")
        .select("*, locations(*)")
        .order("created_at", { ascending: false })
        .limit(5);
      setFamilies((recentFams ?? []) as (Family & { locations: Location | null })[]);

      const { data: acts } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setActivity((acts ?? []) as ActivityLog[]);

      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: "Total Families", value: stats.totalFamilies, trend: "+12.5%", up: true, icon: Users, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Total Members", value: stats.totalMembers, trend: "+8.2%", up: true, icon: UserCog, color: "#0891b2", bg: "#ecfeff" },
    { label: "Active Forms", value: stats.activeForms, trend: "+4", up: true, icon: FileText, color: "#d97706", bg: "#fffbeb" },
    { label: "Pending Reviews", value: stats.pendingReviews, trend: "-3.1%", up: false, icon: Inbox, color: "#dc2626", bg: "#fef2f2" },
  ];

  const barData = [45, 62, 58, 71, 84, 78, 92, 88, 96];
  const barLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  if (loading) return <div style={{ color: "var(--muted)" }}>Loading dashboard...</div>;

  return (
    <div className="page-grid">
      <div className="stat-grid">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                  <Icon size={20} />
                </div>
                <span className={`stat-trend ${s.up ? "up" : "down"}`}>
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {s.trend}
                </span>
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
            <div>
              <h2>Collection Overview</h2>
              <p>Monthly family data submissions</p>
            </div>
            <button className="btn btn-ghost btn-sm"><Download size={14} /> Export</button>
          </div>
          <div className="bar-chart">
            {barData.map((v, i) => (
              <div key={i} className="bar-col">
                <div className="bar" style={{ height: `${v}%` }} />
                <div className="bar-label">{barLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Completion Rate</h2>
              <p>Form submission status</p>
            </div>
            <button className="icon-btn"><MoreHorizontal size={18} /></button>
          </div>
          <div className="donut-row">
            <div className="donut" />
            <ul className="donut-legend">
              <li><span className="swatch" style={{ background: "#4f46e5" }} /> Complete · 55%</li>
              <li><span className="swatch" style={{ background: "#22c55e" }} /> Verified · 23%</li>
              <li><span className="swatch" style={{ background: "#f59e0b" }} /> Pending · 22%</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Recently Added Families</h2>
              <p>Latest records from field workers</p>
            </div>
            <Link href="/families" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Family ID</th>
                  <th>Head of Family</th>
                  <th>Location</th>
                  <th>Members</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {families.map((f) => (
                  <tr key={f.id}>
                    <td className="cell-strong">{f.family_code}</td>
                    <td>{f.head_of_family}</td>
                    <td className="cell-muted">{f.locations?.name ?? "—"}</td>
                    <td>{f.member_count}</td>
                    <td>
                      <span className={`pill ${statusPill[f.status] ?? "gray"}`}>
                        <span className="dot" /> {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>System-wide updates</p>
            </div>
          </div>
          <div className="activity-list">
            {activity.map((a) => (
              <div key={a.id} className="activity-item">
                <div className="act-dot" style={{ background: a.color ?? "#eef2ff" }}>
                  {a.icon ?? "✓"}
                </div>
                <div className="act-body">
                  <strong>{a.actor}</strong> {a.action}
                  <div className="act-time">
                    {new Date(a.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
