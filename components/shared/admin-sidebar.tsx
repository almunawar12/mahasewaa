"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Briefcase,
  Handshake,
  ShoppingCart,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/chat", label: "Chat Inbox", icon: MessageSquare },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  mobileOpen,
  collapsed,
  onClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col bg-emerald-900 transition-all duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-60",
          "lg:relative lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-60",
        )}
      >
        {/* Logo row */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-emerald-800 px-4">
          <Link
            href="/admin"
            onClick={onClose}
            className={cn("overflow-hidden", collapsed && "lg:hidden")}
          >
            <span className="text-lg font-bold text-white">
              Maha<span className="text-emerald-300">Sewa</span>
            </span>
            <span className="ml-1 text-xs font-medium text-emerald-400">Admin</span>
          </Link>

          {/* Mobile: close button */}
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>

          {/* Desktop/tablet: collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden text-emerald-300 hover:text-white lg:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-100 hover:bg-emerald-800",
                  collapsed && "lg:justify-center lg:px-2",
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
