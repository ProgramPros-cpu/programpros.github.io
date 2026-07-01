"use client";

import { useState } from "react";
import { Save, Globe, Bell, Shield, Database, Palette } from "lucide-react";

export default function SettingsPage() {
  const [toggles, setToggles] = useState({
    emailNotif: true,
    smsNotif: false,
    twoFactor: true,
    autoBackup: true,
    publicPortal: false,
    dataSharing: false,
  });

  const flip = (k: keyof typeof toggles) =>
    setToggles((t) => ({ ...t, [k]: !t[k] }));

  return (
    <div className="page-grid">
      <div className="grid-2">
        {/* Organization settings */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Organization Profile</h2>
              <p>Basic information about your organization</p>
            </div>
            <Globe size={18} className="cell-muted" />
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label>Organization Name</label>
              <input className="input" defaultValue="Family Welfare Dept." />
            </div>
            <div className="form-field">
              <label>Contact Email</label>
              <input className="input" defaultValue="admin@familydata.gov" />
            </div>
            <div className="form-field">
              <label>Phone Number</label>
              <input className="input" defaultValue="+91 12345 67890" />
            </div>
            <div className="form-field">
              <label>Timezone</label>
              <select className="select">
                <option>Asia/Kolkata (IST)</option>
                <option>Asia/Dubai (GST)</option>
                <option>UTC</option>
              </select>
            </div>
            <div className="form-field full">
              <label>Address</label>
              <textarea className="textarea" defaultValue="Civil Lines, Asansol, West Bengal 713301" />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Preferences</h2>
              <p>Notifications and security settings</p>
            </div>
            <Bell size={18} className="cell-muted" />
          </div>

          <div className="toggle-row">
            <div className="toggle-text">
              <strong>Email Notifications</strong>
              <span>Receive email alerts for new submissions</span>
            </div>
            <button className={`switch ${toggles.emailNotif ? "on" : ""}`} onClick={() => flip("emailNotif")} />
          </div>
          <div className="toggle-row">
            <div className="toggle-text">
              <strong>SMS Notifications</strong>
              <span>Get text messages for urgent updates</span>
            </div>
            <button className={`switch ${toggles.smsNotif ? "on" : ""}`} onClick={() => flip("smsNotif")} />
          </div>
          <div className="toggle-row">
            <div className="toggle-text">
              <strong>Two-Factor Authentication</strong>
              <span>Require 2FA for all admin accounts</span>
            </div>
            <button className={`switch ${toggles.twoFactor ? "on" : ""}`} onClick={() => flip("twoFactor")} />
          </div>
          <div className="toggle-row">
            <div className="toggle-text">
              <strong>Automatic Backups</strong>
              <span>Backup database nightly at 2:00 AM</span>
            </div>
            <button className={`switch ${toggles.autoBackup ? "on" : ""}`} onClick={() => flip("autoBackup")} />
          </div>
          <div className="toggle-row">
            <div className="toggle-text">
              <strong>Public Portal</strong>
              <span>Allow public access to summary reports</span>
            </div>
            <button className={`switch ${toggles.publicPortal ? "on" : ""}`} onClick={() => flip("publicPortal")} />
          </div>
          <div className="toggle-row">
            <div className="toggle-text">
              <strong>Data Sharing</strong>
              <span>Share anonymized data with research partners</span>
            </div>
            <button className={`switch ${toggles.dataSharing ? "on" : ""}`} onClick={() => flip("dataSharing")} />
          </div>
        </div>
      </div>

      {/* Data & appearance */}
      <div className="grid-3">
        <div className="card">
          <div className="card-header">
            <div><h2>Data Retention</h2><p>How long records are kept</p></div>
            <Database size={18} className="cell-muted" />
          </div>
          <div className="form-field">
            <label>Retention Period</label>
            <select className="select">
              <option>1 year</option>
              <option>3 years</option>
              <option>5 years</option>
              <option>Indefinite</option>
            </select>
            <span className="hint">Older records are archived automatically.</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><h2>Security</h2><p>Access and audit controls</p></div>
            <Shield size={18} className="cell-muted" />
          </div>
          <div className="form-field">
            <label>Session Timeout</label>
            <select className="select">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
            </select>
            <span className="hint">Auto-logout after inactivity.</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><h2>Appearance</h2><p>Portal theme settings</p></div>
            <Palette size={18} className="cell-muted" />
          </div>
          <div className="form-field">
            <label>Theme</label>
            <select className="select">
              <option>Light (default)</option>
              <option>Dark</option>
              <option>System</option>
            </select>
            <span className="hint">Applies to all users.</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-ghost">Cancel</button>
        <button className="btn btn-primary">
          <Save size={15} /> Save Changes
        </button>
      </div>
    </div>
  );
}
