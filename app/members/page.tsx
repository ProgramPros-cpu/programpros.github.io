import { Plus, Filter, Download, Search, MoveHorizontal as MoreHorizontal } from "lucide-react";

const members = [
  { name: "Rajesh Sharma", family: "FAM-2847", role: "Head", age: 45, gender: "Male", contact: "+91 98300 12345", status: "Verified", pill: "green" },
  { name: "Sunita Sharma", family: "FAM-2847", role: "Spouse", age: 42, gender: "Female", contact: "+91 98300 12346", status: "Verified", pill: "green" },
  { name: "Aarav Sharma", family: "FAM-2847", role: "Son", age: 18, gender: "Male", contact: "—", status: "Pending", pill: "amber" },
  { name: "Priya Verma", family: "FAM-2846", role: "Head", age: 38, gender: "Female", contact: "+91 98311 22334", status: "Verified", pill: "green" },
  { name: "Amit Singh", family: "FAM-2845", role: "Head", age: 51, gender: "Male", contact: "+91 98322 33445", status: "Verified", pill: "green" },
  { name: "Sunita Rao", family: "FAM-2844", role: "Head", age: 34, gender: "Female", contact: "+91 98333 44556", status: "Review", pill: "blue" },
  { name: "Mohan Das", family: "FAM-2843", role: "Head", age: 47, gender: "Male", contact: "+91 98344 55667", status: "Incomplete", pill: "red" },
  { name: "Kavita Nair", family: "FAM-2842", role: "Head", age: 29, gender: "Female", contact: "+91 98355 66778", status: "Verified", pill: "green" },
];

const avatarColors = ["#6366f1", "#0891b2", "#d97706", "#16a34a", "#dc2626", "#7c3aed"];

export default function MembersPage() {
  return (
    <div className="page-grid">
      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-box" style={{ width: 240 }}>
              <Search size={16} />
              <input placeholder="Search members..." />
            </div>
            <button className="filter-chip"><Filter size={14} /> All Roles</button>
            <button className="filter-chip"><Filter size={14} /> All Status</button>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-ghost btn-sm"><Download size={14} /> Export</button>
            <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Member</button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Family</th>
                <th>Role</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: avatarColors[i % avatarColors.length],
                          color: "#fff", display: "grid", placeItems: "center",
                          fontSize: 12, fontWeight: 600,
                        }}
                      >
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <span className="cell-strong">{m.name}</span>
                    </div>
                  </td>
                  <td className="cell-muted">{m.family}</td>
                  <td>{m.role}</td>
                  <td>{m.age}</td>
                  <td className="cell-muted">{m.gender}</td>
                  <td className="cell-muted">{m.contact}</td>
                  <td>
                    <span className={`pill ${m.pill}`}>
                      <span className="dot" /> {m.status}
                    </span>
                  </td>
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
      </div>
    </div>
  );
}
