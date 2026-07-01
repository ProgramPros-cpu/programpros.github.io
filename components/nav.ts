import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  Database,
  Inbox,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  SlidersHorizontal,
  Workflow,
  ScrollText,
  MapPin,
  FolderTree,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type NavEntry = { label: string; href: string; icon: LucideIcon };

export const navGroups: { label: string; items: NavEntry[] }[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Families", href: "/families", icon: Users },
      { label: "Members", href: "/members", icon: UserCog },
    ],
  },
  {
    label: "Data Collection",
    items: [
      { label: "Forms & Surveys", href: "/forms", icon: FileText },
      { label: "Data Collection", href: "/data-collection", icon: Database },
      { label: "Submissions", href: "/submissions", icon: Inbox },
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users & Roles", href: "/users", icon: UserCog },
      { label: "Locations", href: "/locations", icon: MapPin },
      { label: "Programs", href: "/programs", icon: FolderTree },
      { label: "Categories", href: "/categories", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Announcements", href: "/announcements", icon: Megaphone },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Custom Fields", href: "/custom-fields", icon: SlidersHorizontal },
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const allNavItems: NavEntry[] = navGroups.flatMap((g) => g.items);
