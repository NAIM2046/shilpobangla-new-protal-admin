// config/dashboard-nav.ts
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Layers,
  Radio,
  Video,
  Users,
  Settings,
  Lock,
  Newspaper,
  CheckCircle,
} from "lucide-react";
import { UserRole } from "../lib/auth-utils"; 

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const dashboardNav: Record<UserRole, NavItem[]> = {
  
  /* ================= REPORTER ================= */
  REPORTER: [
    { title: "Dashboard", href: "/reporter/dashboard", icon: LayoutDashboard },
    { title: "Add News", href: "/reporter/dashboard/add-news", icon: PenSquare },
    { title: "My News", href: "/reporter/dashboard/my-news", icon: FileText },
    { title: "Change Password", href: "/change-password", icon: Lock },
  ],

  /* ================= EDITOR ================= */
  EDITOR: [
    { title: "Dashboard", href: "/editor/dashboard", icon: LayoutDashboard },
    { title: "Pending News", href: "/editor/dashboard/pending-news", icon: CheckCircle },
    { title: "Add News", href: "/editor/dashboard/add-news", icon: PenSquare },
    { title: "Categories", href: "/editor/dashboard/categories", icon: Layers },
    { title: "Live Updates", href: "/editor/dashboard/live-updates", icon: Radio },
    { title: "Video Gallery", href: "/editor/dashboard/videos", icon: Video },
    { title: "Change Password", href: "/change-password", icon: Lock },
  ],

  /* ================= ADMIN ================= */
  ADMIN: [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "User Management", href: "/admin/dashboard/users", icon: Users },
    { title: "All News", href: "/admin/dashboard/all-news", icon: Newspaper },
    { title: "Categories", href: "/admin/dashboard/categories", icon: Layers },
    { title: "Live Updates", href: "/admin/dashboard/live-updates", icon: Radio },
    { title: "Video Gallery", href: "/admin/dashboard/videos", icon: Video },
    { title: "System Settings", href: "/admin/dashboard/settings", icon: Settings },
    { title: "Change Password", href: "/change-password", icon: Lock },
  ],
  USER:[],
};