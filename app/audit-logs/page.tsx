"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ActivityLog } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs((data ?? []) as ActivityLog[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="page-grid">
      <div className="card">
        <div className="card-header">
          <div><h2>Audit Logs</h2><p>System activity history — last 100 events</p></div>
          <ScrollText size={18} className="cell-muted" />
        </div>
        {loading ? (
          <p className="cell-muted">Loading...</p>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><ScrollText size={32} /></div>
            <h2>No audit logs recorded</h2>
            <p>System activity logs will be tracked here for compliance and security review.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Actor</th><th>Action</th><th>Entity Type</th><th>Timestamp</th></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="cell-strong">{l.actor}</td>
                    <td>{l.action}</td>
                    <td className="cell-muted">{l.entity_type ?? "—"}</td>
                    <td className="cell-muted">{new Date(l.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
