import { Users, UserCog, FileText, TrendingUp, TrendingDown, MoveHorizontal as MoreHorizontal, Plus, Download } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Total Families", value: "2,847", trend: "+12.5%", up: true, icon: Users, color: "#4f46e5", bg: "#eef2ff" },
  { label: "Total Members", value: "11,392", trend: "+8.2%", up: true, icon: UserCog, color: "#0891b2", bg: "#ecfeff" },
  { label: "Active Forms", value: "24", trend: "+4", up: true, icon: FileText, color: "#d97706", bg: "#fffbeb" },
  { label: "Pending Reviews", value: "156", trend: "-3.1%", up: false, icon: TrendingDown, color: "#dc2626", bg: "#fef2f2" },
];

const barData = [
  { label: "Jan", value: 45 },
  { label: "Feb", value: 62 },
  { label: "Mar", value: 58 },
  { label: "Apr", value: 71 },
  { label: "May", value: 84 },
  { label: "Jun", value: 78 },
  { label: "Jul", value: 92 },
  { label: "Aug", value: 88 },
  { label: "Sep", value: 96 },
];

const recentFamilies = [
  { id: "FAM-2847", head: "Rajesh Sharma", location: "Asansol, WB", members: 5, status: "Complete", pill: "green" },
  { id: "FAM-2846", head: "Priya Verma", location: "Durgapur, WB", members: 4, status: "Pending", pill: "amber" },
  { id: "FAM-2845", head: "Amit Singh", location: "Kolkata, WB", members: 6, status: "Complete", pill: "green" },
  { id: "FAM-2844", head: "Sunita Rao", location: "Howrah, WB", members: 3, status: "Review", pill: "blue" },
  { id: "FAM-2843", head: "Mohan Das", location: "Siliguri, WB", members: 7, status: "Incomplete", pill: "red" },
];

const activities = [
  { who: "Field Worker J. Roy", what: "submitted form for FAM-2847", time: "2 min ago", color: "#dcfce7", icon: "✓" },
  { who: "Admin Kumar", what: "approved 12 family records", time: "18 min ago", color: "#dbeafe", icon: "✓" },
  { who: "System", what: "auto-flagged 3 incomplete entries", time: "1 hr ago", color: "#fef3c7", icon: "!" },
  { who: "Field Worker S. Ghosh", what: "added 4 new members", time: "3 hrs ago", color: "#eef2ff", icon: "+" },
  { who: "Admin Kumar", what: "updated survey form 'Health 2025'", time: "5 hrs ago", color: "#f1f5f9", icon: "✎" },
];

const pillClass = (p: string) => `pill ${p}`;

export default function DashboardPage() {
  return (
    <div className="page-grid">
      {/* Stat cards */}
      <div className="stat-grid">
        {stats.map((s) => {
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
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Collection Overview</h2>
              <p>Monthly family data submissions</p>
            </div>
            <button className="btn btn-ghost btn-sm">
              <Download size={14} /> Export
            </button>
          </div>
          <div className="bar-chart">
            {barData.map((b) => (
              <div key={b.label} className="bar-col">
                <div className="bar" style={{ height: `${b.value}%` }} />
                <div className="bar-label">{b.label}</div>
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

      {/* Recent families + activity */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Recently Added Families</h2>
              <p>Latest records from field workers</p>
            </div>
            <Link href="/families" className="btn btn-ghost btn-sm">
              View all
            </Link>
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
                {recentFamilies.map((f) => (
                  <tr key={f.id}>
                    <td className="cell-strong">{f.id}</td>
                    <td>{f.head}</td>
                    <td className="cell-muted">{f.location}</td>
                    <td>{f.members}</td>
                    <td>
                      <span className={pillClass(f.pill)}>
                        <span className="dot" /> {f.status}
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
            {activities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="act-dot" style={{ background: a.color }}>
                  {a.icon}
                </div>
                <div className="act-body">
                  <strong>{a.who}</strong> {a.what}
                  <div className="act-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
