"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu, CircleHelp as HelpCircle } from "lucide-react";
import { allNavItems } from "./nav";
import { useState } from "react";

export default function Topbar() {
  const pathname = usePathname() ?? "/";
  const current = allNavItems.find(
    (i) => i.href === "/" ? pathname === "/" : pathname.startsWith(i.href)
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // dispatch a custom event the Sidebar listens for
  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    window.dispatchEvent(new Event("toggle-sidebar"));
  };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{current?.label ?? "Dashboard"}</h1>
        <p>Family Data Collection Portal</p>
      </div>
      <div className="topbar-actions">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search families, members, forms..." />
        </div>
        <button className="icon-btn" aria-label="Help">
          <HelpCircle size={19} />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={19} />
          <span className="badge" />
        </button>
        <button
          className="icon-btn menu-toggle"
          aria-label="Menu"
          onClick={toggleMenu}
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
