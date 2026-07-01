import { Plus, Filter, Download, Search, ChevronLeft, ChevronRight, MoveHorizontal as MoreHorizontal } from "lucide-react";

const families = [
  { id: "FAM-2847", head: "Rajesh Sharma", location: "Asansol, WB", members: 5, survey: "Health 2025", status: "Complete", pill: "green", updated: "2025-06-28" },
  { id: "FAM-2846", head: "Priya Verma", location: "Durgapur, WB", members: 4, survey: "Education 2025", status: "Pending", pill: "amber", updated: "2025-06-27" },
  { id: "FAM-2845", head: "Amit Singh", location: "Kolkata, WB", members: 6, survey: "Health 2025", status: "Complete", pill: "green", updated: "2025-06-27" },
  { id: "FAM-2844", head: "Sunita Rao", location: "Howrah, WB", members: 3, survey: "Census 2025", status: "Review", pill: "blue", updated: "2025-06-26" },
  { id: "FAM-2843", head: "Mohan Das", location: "Siliguri, WB", members: 7, survey: "Health 2025", status: "Incomplete", pill: "red", updated: "2025-06-25" },
  { id: "FAM-2842", head: "Kavita Nair", location: "Asansol, WB", members: 4, survey: "Education 2025", status: "Complete", pill: "green", updated: "2025-06-24" },
  { id: "FAM-2841", head: "Deepak Jain", location: "Durgapur, WB", members: 5, survey: "Census 2025", status: "Pending", pill: "amber", updated: "2025-06-23" },
  { id: "FAM-2840", head: "Anita Gupta", location: "Kolkata, WB", members: 3, survey: "Health 2025", status: "Complete", pill: "green", updated: "2025-06-22" },
  { id: "FAM-2839", head: "Ramesh Yadav", location: "Howrah, WB", members: 6, survey: "Education 2025", status: "Review", pill: "blue", updated: "2025-06-21" },
  { id: "FAM-2838", head: "Lakshmi Iyer", location: "Siliguri, WB", members: 4, survey: "Census 2025", status: "Complete", pill: "green", updated: "2025-06-20" },
];

export default function FamiliesPage() {
  return (
    <div className="page-grid">
      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box" style={{ width: 240 }}>
              <Search size={16} />
              <input placeholder="Search families..." />
            </div>
            <button className="filter-chip">
              <Filter size={14} /> All Locations
            </button>
            <button className="filter-chip">
              <Filter size={14} /> All Surveys
            </button>
            <button className="filter-chip">
              <Filter size={14} /> All Status
            </button>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-ghost btn-sm">
              <Download size={14} /> Export
            </button>
            <button className="btn btn-primary btn-sm">
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
              {families.map((f) => (
                <tr key={f.id}>
                  <td className="cell-strong">{f.id}</td>
                  <td>{f.head}</td>
                  <td className="cell-muted">{f.location}</td>
                  <td>{f.members}</td>
                  <td className="cell-muted">{f.survey}</td>
                  <td>
                    <span className={`pill ${f.pill}`}>
                      <span className="dot" /> {f.status}
                    </span>
                  </td>
                  <td className="cell-muted">{f.updated}</td>
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
            Showing 1–10 of 2,847 families
          </span>
          <div className="toolbar-right">
            <button className="icon-btn" style={{ width: 34, height: 34 }}>
              <ChevronLeft size={16} />
            </button>
            <button className="filter-chip" style={{ background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }}>
              1
            </button>
            <button className="filter-chip">2</button>
            <button className="filter-chip">3</button>
            <button className="icon-btn" style={{ width: 34, height: 34 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
