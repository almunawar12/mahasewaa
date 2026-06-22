"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { handleSignOut } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

interface AdminShellProps {
  session: { user: { name?: string | null; email?: string | null } };
  children: React.ReactNode;
}

function getInitials(name?: string | null): string {
  if (!name) return "A";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function AdminShell({ session, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Default collapsed on tablet (768–1023px)
  useEffect(() => {
    if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-500 hover:text-slate-700 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop: spacer */}
          <div className="hidden lg:block" />

          {/* Right: user info + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {getInitials(session.user.name)}
              </div>
              <span className="hidden text-sm text-slate-600 sm:block">
                {session.user.name}
              </span>
            </div>
            <form action={handleSignOut}>
              <Button type="submit" variant="outline" size="sm">
                Keluar
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
