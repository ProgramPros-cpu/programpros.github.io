"use client";

import { useEffect, useState } from "react";
import { Database, Plus, FileText } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Form } from "@/lib/types";

export default function DataCollectionPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("forms").select("*").eq("status", "active").order("created_at", { ascending: false });
      setForms((data ?? []) as Form[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="page-grid">
      <div className="toolbar">
        <h2 className="section-title" style={{ margin: 0 }}>Data Collection Campaigns</h2>
        <Link href="/forms" className="btn btn-primary btn-sm"><Plus size={14} /> New Campaign</Link>
      </div>

      {loading ? (
        <div className="card" style={{ color: "var(--muted)" }}>Loading...</div>
      ) : forms.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Database size={32} /></div>
            <h2>No active data collection campaigns</h2>
            <p>Create a form to start gathering family information from field workers.</p>
            <Link href="/forms" className="btn btn-primary"><Plus size={15} /> Create Form</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {forms.map((f) => {
            const pct = f.target_responses > 0 ? Math.round((f.response_count / f.target_responses) * 100) : 0;
            return (
              <div key={f.id} className="card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div className="stat-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 15 }}>{f.title}</h2>
                    <span className="pill green" style={{ marginTop: 4 }}><span className="dot" /> Active</span>
                  </div>
                </div>
                <p className="cell-muted" style={{ fontSize: 13, marginBottom: 12 }}>{f.description ?? "No description"}</p>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span className="cell-muted">Progress</span>
                    <span className="cell-strong">{f.response_count} / {f.target_responses}</span>
                  </div>
                  <div className="progress"><span style={{ width: `${pct}%` }} /></div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Deadline: {f.deadline ?? "—"}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
