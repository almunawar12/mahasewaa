# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin sidebar and dashboard page to be fully responsive (mobile/tablet/desktop) with a modern emerald-accent visual, revenue chart, pending orders alert, and status progress bars.

**Architecture:** The current `AdminLayout` (server component) delegates rendering to a new `AdminShell` client component that manages sidebar open/collapse state. `AdminSidebar` receives state as props. The dashboard page is extended with JS-side monthly revenue grouping and a `RevenueChart` client component wrapping recharts.

**Tech Stack:** Next.js 14 App Router, Prisma, Tailwind CSS, lucide-react (existing), recharts (new install), shadcn/ui

## Global Constraints

- Tailwind only — no inline styles except where Tailwind cannot express the value
- `lucide-react` for all icons — already installed via shadcn
- Emerald-900 sidebar background, emerald-700 active state
- All server actions must have `"use server"` directive at the top of the file or function
- Prisma client imported from `@/lib/prisma`
- Currency formatted with existing `formatIDR` from `@/lib/utils`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/features/order-row.tsx` | Modify | Fix link bug: `/dashboard/` → `/admin/` |
| `lib/auth-actions.ts` | Create | Server action for `signOut` (used by client shell) |
| `components/shared/admin-sidebar.tsx` | Rewrite | Icons, 3-state responsive, emerald-900 theme |
| `components/shared/admin-shell.tsx` | Create | Client wrapper managing sidebar open/collapse state |
| `app/admin/layout.tsx` | Modify | Delegate to `AdminShell`, pass session |
| `components/features/revenue-chart.tsx` | Create | Client-only recharts bar chart |
| `app/admin/page.tsx` | Rewrite | Pending alert, stat cards, revenue chart, status bars |

---

### Task 1: Fix OrderRow link bug + install recharts

**Files:**
- Modify: `components/features/order-row.tsx`

**Interfaces:**
- Produces: `OrderRow` component links to `/admin/orders/${order.id}` (was `/dashboard/orders/${order.id}`)

- [ ] **Step 1: Install recharts**

```bash
npm install recharts
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Fix the link in OrderRow**

Open `components/features/order-row.tsx`. Change line 21:

```tsx
// Before
href={`/dashboard/orders/${order.id}`}

// After
href={`/admin/orders/${order.id}`}
```

Full file after change:

```tsx
import Link from "next/link";
import type { Order, Service } from "@/app/generated/prisma/client";
import { formatIDR } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export function OrderRow({
  order,
}: {
  order: Pick<Order, "id" | "status" | "totalAmount" | "createdAt"> & {
    service: Pick<Service, "title" | "slug">;
  };
}) {
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="flex items-center justify-between border-b border-slate-200 px-4 py-3 last:border-0 hover:bg-slate-50"
    >
      <div>
        <p className="font-medium">{order.service.title}</p>
        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? ""}`}>
          {order.status}
        </span>
        <span className="text-sm font-semibold">{formatIDR(order.totalAmount.toString())}</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/features/order-row.tsx package.json package-lock.json
git commit -m "fix: order-row links to admin path, install recharts"
```

---

### Task 2: Create auth server action

**Files:**
- Create: `lib/auth-actions.ts`

**Interfaces:**
- Produces: `handleSignOut(): Promise<void>` — server action, imported by `AdminShell`

- [ ] **Step 1: Create `lib/auth-actions.ts`**

```ts
"use server";

import { signOut } from "@/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
```

- [ ] **Step 2: Verify the file is correct**

Check that `@/auth` resolves — it should since the current `app/admin/layout.tsx` already imports from `@/auth`. If your project uses a different auth path (e.g. `next-auth`), match it.

- [ ] **Step 3: Commit**

```bash
git add lib/auth-actions.ts
git commit -m "feat: add handleSignOut server action"
```

---

### Task 3: Rewrite AdminSidebar

**Files:**
- Rewrite: `components/shared/admin-sidebar.tsx`

**Interfaces:**
- Consumes: nothing external
- Produces:
  ```ts
  interface AdminSidebarProps {
    mobileOpen: boolean;       // drawer visible on mobile
    collapsed: boolean;        // icon-only on tablet/desktop
    onClose: () => void;       // close mobile drawer
    onToggleCollapse: () => void; // toggle tablet/desktop collapse
  }
  export function AdminSidebar(props: AdminSidebarProps): JSX.Element
  ```

- [ ] **Step 1: Rewrite `components/shared/admin-sidebar.tsx`**

```tsx
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
          // Mobile: slide in/out as drawer
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-60",
          // Desktop/tablet: always visible, width depends on collapsed
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
```

- [ ] **Step 2: Commit**

```bash
git add components/shared/admin-sidebar.tsx
git commit -m "feat: redesign admin sidebar with icons and 3-state responsive"
```

---

### Task 4: Create AdminShell + update AdminLayout

**Files:**
- Create: `components/shared/admin-shell.tsx`
- Modify: `app/admin/layout.tsx`

**Interfaces:**
- Consumes:
  - `AdminSidebar` from `@/components/shared/admin-sidebar` (from Task 3)
  - `handleSignOut` from `@/lib/auth-actions` (from Task 2)
  - Session type: `{ user: { name?: string | null; email?: string | null } }`
- Produces:
  ```ts
  interface AdminShellProps {
    session: { user: { name?: string | null; email?: string | null } };
    children: React.ReactNode;
  }
  export function AdminShell(props: AdminShellProps): JSX.Element
  ```

- [ ] **Step 1: Create `components/shared/admin-shell.tsx`**

```tsx
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
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
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

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `app/admin/layout.tsx`**

```tsx
import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/components/shared/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return <AdminShell session={session}>{children}</AdminShell>;
}
```

- [ ] **Step 3: Verify dev server starts with no errors**

```bash
npm run dev
```

Navigate to `/admin`. Sidebar should render with emerald background and icons. Header should show user name and Keluar button. On mobile (<768px) sidebar should be hidden; hamburger button visible.

- [ ] **Step 4: Commit**

```bash
git add components/shared/admin-shell.tsx app/admin/layout.tsx
git commit -m "feat: add AdminShell client wrapper with responsive sidebar state"
```

---

### Task 5: Create RevenueChart component

**Files:**
- Create: `components/features/revenue-chart.tsx`

**Interfaces:**
- Consumes: recharts (installed in Task 1)
- Produces:
  ```ts
  interface RevenueChartProps {
    data: { month: string; revenue: number }[];
  }
  export function RevenueChart(props: RevenueChartProps): JSX.Element
  ```

- [ ] **Step 1: Create `components/features/revenue-chart.tsx`**

```tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

function formatShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}

function formatIDRTooltip(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatShort}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          formatter={(value: number) => [formatIDRTooltip(value), "Revenue"]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/revenue-chart.tsx
git commit -m "feat: add RevenueChart client component using recharts"
```

---

### Task 6: Rewrite Admin Dashboard page

**Files:**
- Rewrite: `app/admin/page.tsx`

**Interfaces:**
- Consumes:
  - `RevenueChart` from `@/components/features/revenue-chart` (Task 5)
  - `OrderRow` from `@/components/features/order-row` (Task 1 — link fixed)
  - `prisma` from `@/lib/prisma`
  - `formatIDR` from `@/lib/utils`
  - Icons from `lucide-react`: `ShoppingCart`, `TrendingUp`, `Briefcase`, `Users`, `AlertCircle`
  - `Card`, `CardContent`, `CardHeader`, `CardTitle` from `@/components/ui/card`
  - `Link` from `next/link`

- [ ] **Step 1: Rewrite `app/admin/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { OrderRow } from "@/components/features/order-row";
import { RevenueChart } from "@/components/features/revenue-chart";
import {
  ShoppingCart,
  TrendingUp,
  Briefcase,
  Users,
  AlertCircle,
} from "lucide-react";

export const metadata = { title: "Admin · Dashboard" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_BAR_COLOR: Record<string, string> = {
  PENDING: "bg-amber-400",
  IN_PROGRESS: "bg-blue-500",
  REVIEW: "bg-purple-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-slate-400",
};

function buildRevenueData(
  orders: { totalAmount: { toString(): string }; createdAt: Date }[],
): { month: string; revenue: number }[] {
  const map: Record<string, number> = {};

  for (const order of orders) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] = (map[key] ?? 0) + Number(order.totalAmount);
  }

  const result: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    result.push({
      month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      revenue: map[key] ?? 0,
    });
  }
  return result;
}

export default async function AdminDashboardPage() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalOrders,
    totalServices,
    totalUsers,
    pendingCount,
    revenueAgg,
    recentOrders,
    statusGroup,
    completedOrdersForChart,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.service.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { service: { select: { title: true, slug: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      where: { status: "COMPLETED", createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
    }),
  ]);

  const revenue = revenueAgg._sum.totalAmount?.toString() ?? "0";
  const revenueData = buildRevenueData(completedOrdersForChart);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString("id-ID"),
      sub: "semua status",
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Revenue",
      value: formatIDR(revenue),
      sub: "dari pesanan selesai",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Services",
      value: totalServices.toLocaleString("id-ID"),
      sub: "layanan tersedia",
      icon: Briefcase,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Clients",
      value: totalUsers.toLocaleString("id-ID"),
      sub: "pengguna terdaftar",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <Link
          href="/admin/orders"
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
        >
          <AlertCircle size={18} className="shrink-0 text-amber-500" />
          <span>
            <strong>{pendingCount}</strong> pesanan menunggu konfirmasi
          </span>
          <span className="ml-auto text-xs text-amber-600 underline">Lihat semua →</span>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {s.label}
                    </p>
                    <p className="text-xl font-bold text-slate-800 sm:text-2xl">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.sub}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${s.bg}`}>
                    <Icon size={20} className={s.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart + Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusGroup.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada data.</p>
            ) : (
              statusGroup.map((g) => {
                const pct = totalOrders > 0 ? Math.round((g._count._all / totalOrders) * 100) : 0;
                return (
                  <div key={g.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        {STATUS_LABEL[g.status] ?? g.status}
                      </span>
                      <span className="text-slate-500">
                        {g._count._all} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full transition-all ${STATUS_BAR_COLOR[g.status] ?? "bg-slate-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
            <Link href="/admin/orders" className="text-xs text-emerald-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">Belum ada pesanan.</p>
          ) : (
            recentOrders.map((o) => <OrderRow key={o.id} order={o} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Check at `http://localhost:3000/admin`:
- Pending alert shows (amber) if there are pending orders, hidden otherwise
- 4 stat cards in 2×2 grid on mobile, 1×4 on desktop
- Revenue bar chart renders with last 6 months
- Status breakdown shows progress bars per status
- Recent orders list links to `/admin/orders/[id]`
- On mobile: sidebar hidden, hamburger visible in header
- On tablet: sidebar icon-only (collapsed)
- On desktop: sidebar full width with labels

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: redesign admin dashboard with chart, pending alert, and stat cards"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Responsive sidebar 3-state — Task 3
- ✅ Emerald-900 visual theme — Task 3
- ✅ Icons on nav items — Task 3
- ✅ Hamburger + mobile drawer — Task 4 (AdminShell)
- ✅ Header with user avatar + logout — Task 4
- ✅ Pending orders alert banner — Task 6
- ✅ Stat cards with icons + accent colors — Task 6
- ✅ Revenue chart (recharts, 6 months) — Tasks 5 + 6
- ✅ Status breakdown with progress bars — Task 6
- ✅ Fix OrderRow link bug — Task 1
- ✅ recharts install — Task 1

**Placeholder scan:** None found. All steps contain complete code.

**Type consistency:**
- `AdminSidebarProps` defined in Task 3, consumed identically in Task 4 ✅
- `AdminShellProps` defined and exported in Task 4 ✅
- `RevenueChartProps` defined in Task 5, consumed identically in Task 6 ✅
- `buildRevenueData` defined and used in Task 6 only ✅
