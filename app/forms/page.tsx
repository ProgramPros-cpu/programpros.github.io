import { Plus, FileText, Calendar, Users, MoveHorizontal as MoreHorizontal, Copy, CreditCard as Edit, BarChart3 } from "lucide-react";

const forms = [
  { title: "Health Survey 2025", desc: "Annual family health and wellness data collection", responses: 1842, target: 2847, deadline: "2025-07-30", status: "Active", pill: "green" },
  { title: "Education Census", desc: "Educational background of all family members", responses: 1203, target: 2847, deadline: "2025-08-15", status: "Active", pill: "green" },
  { title: "Housing Survey", desc: "Living conditions and housing infrastructure", responses: 876, target: 2000, deadline: "2025-09-01", status: "Draft", pill: "gray" },
  { title: "Employment Record", desc: "Employment status and income brackets", responses: 542, target: 2847, deadline: "2025-08-30", status: "Active", pill: "green" },
  { title: "Migration Tracking", desc: "Internal and external migration patterns", responses: 0, target: 1500, deadline: "2025-10-15", status: "Paused", pill: "amber" },
  { title: "Social Welfare", desc: "Government scheme enrollment and benefits", responses: 312, target: 1000, deadline: "2025-09-20", status: "Active", pill: "green" },
];

export default function FormsPage() {
  return (
    <div className="page-grid">
      <div className="toolbar">
        <div className="toolbar-left">
          <h2 className="section-title" style={{ margin: 0 }}>Forms & Surveys</h2>
        </div>
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> Create Form
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {forms.map((f) => {
          const pct = Math.round((f.responses / f.target) * 100);
          return (
            <div key={f.title} className="card">
              <div className="card-header" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    className="stat-icon"
                    style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15 }}>{f.title}</h2>
                    <span className={`pill ${f.pill}`} style={{ marginTop: 4 }}>
                      <span className="dot" /> {f.status}
                    </span>
                  </div>
                </div>
                <button className="icon-btn" style={{ width: 30, height: 30 }}>
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <p className="cell-muted" style={{ fontSize: 13, marginBottom: 16 }}>
                {f.desc}
              </p>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span className="cell-muted">Responses</span>
                  <span className="cell-strong">{f.responses} / {f.target}</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={13} /> {f.deadline}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Users size={13} /> {pct}% complete
                </span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  <Edit size={13} /> Edit
                </button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                  <BarChart3 size={13} /> Results
                </button>
                <button className="btn btn-ghost btn-sm">
                  <Copy size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
