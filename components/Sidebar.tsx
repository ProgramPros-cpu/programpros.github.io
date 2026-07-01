"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { navGroups } from "./nav";
import { Heart } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="logo-mark">
            <Heart size={18} />
          </span>
          FamilyData
        </div>
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${active ? "active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">AK</div>
          <div className="meta">
            <strong>Admin Kumar</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>
    </>
  );
}
