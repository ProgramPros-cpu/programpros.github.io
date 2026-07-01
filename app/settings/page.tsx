"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Globe, Bell, Shield, Database, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase";

const SETTING_KEYS = [
  "org_name", "org_email", "org_phone", "org_timezone", "org_address",
  "notif_email", "notif_sms", "security_2fa", "auto_backup", "public_portal", "data_sharing",
  "retention_period", "session_timeout", "theme",
];

const DEFAULTS: Record<string, string> = {
  org_name: "Family Welfare Dept.",
  org_email: "admin@familydata.gov",
  org_phone: "+91 12345 67890",
  org_timezone: "Asia/Kolkata (IST)",
  org_address: "Civil Lines, Asansol, West Bengal 713301",
  notif_email: "true", notif_sms: "false", security_2fa: "true",
  auto_backup: "true", public_portal: "false", data_sharing: "false",
  retention_period: "5 years", session_timeout: "30 minutes", theme: "Light (default)",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("key, value");
      const map: Record<string, string> = { ...DEFAULTS };
      (data ?? []).forEach((r: any) => { map[r.key] = r.value ?? DEFAULTS[r.key] ?? ""; });
      setSettings(map);
      setLoading(false);
    })();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const toggleSetting = (key: string) => {
    setSettings((s) => ({ ...s, [key]: s[key] === "true" ? "false" : "true" }));
  };

  const handleSave = async () => {
    setSaving(true);
    const upserts = SETTING_KEYS.map((key) => ({
      key,
      value: settings[key] ?? "",
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("settings").upsert(upserts, { onConflict: "key" });
    setSaving(false);
    if (error) {
      setToast("Error saving settings");
    } else {
      setToast("Settings saved successfully");
    }
    setTimeout(() => setToast(null), 2500);
  };

  if (loading) return <div className="card" style={{ color: "var(--muted)" }}>Loading settings...</div>;

  return (
    <div className="page-grid">
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div><h2>Organization Profile</h2><p>Basic information about your organization</p></div>
            <Globe size={18} className="cell-muted" />
          </div>
          <div className="form-grid">
            <div className="form-field"><label>Organization Name</label><input className="input" value={settings.org_name} onChange={(e) => updateSetting("org_name", e.target.value)} /></div>
            <div className="form-field"><label>Contact Email</label><input className="input" value={settings.org_email} onChange={(e) => updateSetting("org_email", e.target.value)} /></div>
            <div className="form-field"><label>Phone Number</label><input className="input" value={settings.org_phone} onChange={(e) => updateSetting("org_phone", e.target.value)} /></div>
            <div className="form-field"><label>Timezone</label>
              <select className="select" value={settings.org_timezone} onChange={(e) => updateSetting("org_timezone", e.target.value)}>
                <option>Asia/Kolkata (IST)</option><option>Asia/Dubai (GST)</option><option>UTC</option>
              </select>
            </div>
            <div className="form-field full"><label>Address</label><textarea className="textarea" value={settings.org_address} onChange={(e) => updateSetting("org_address", e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><h2>Preferences</h2><p>Notifications and security settings</p></div>
            <Bell size={18} className="cell-muted" />
          </div>
          {[
            { key: "notif_email", title: "Email Notifications", desc: "Receive email alerts for new submissions" },
            { key: "notif_sms", title: "SMS Notifications", desc: "Get text messages for urgent updates" },
            { key: "security_2fa", title: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts" },
            { key: "auto_backup", title: "Automatic Backups", desc: "Backup database nightly at 2:00 AM" },
            { key: "public_portal", title: "Public Portal", desc: "Allow public access to summary reports" },
            { key: "data_sharing", title: "Data Sharing", desc: "Share anonymized data with research partners" },
          ].map((t) => (
            <div className="toggle-row" key={t.key}>
              <div className="toggle-text"><strong>{t.title}</strong><span>{t.desc}</span></div>
              <button className={`switch ${settings[t.key] === "true" ? "on" : ""}`} onClick={() => toggleSetting(t.key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-header"><div><h2>Data Retention</h2><p>How long records are kept</p></div><Database size={18} className="cell-muted" /></div>
          <div className="form-field">
            <label>Retention Period</label>
            <select className="select" value={settings.retention_period} onChange={(e) => updateSetting("retention_period", e.target.value)}>
              <option>1 year</option><option>3 years</option><option>5 years</option><option>Indefinite</option>
            </select>
            <span className="hint">Older records are archived automatically.</span>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><h2>Security</h2><p>Access and audit controls</p></div><Shield size={18} className="cell-muted" /></div>
          <div className="form-field">
            <label>Session Timeout</label>
            <select className="select" value={settings.session_timeout} onChange={(e) => updateSetting("session_timeout", e.target.value)}>
              <option>15 minutes</option><option>30 minutes</option><option>1 hour</option>
            </select>
            <span className="hint">Auto-logout after inactivity.</span>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div><h2>Appearance</h2><p>Portal theme settings</p></div><Palette size={18} className="cell-muted" /></div>
          <div className="form-field">
            <label>Theme</label>
            <select className="select" value={settings.theme} onChange={(e) => updateSetting("theme", e.target.value)}>
              <option>Light (default)</option><option>Dark</option><option>System</option>
            </select>
            <span className="hint">Applies to all users.</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-ghost">Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
