# Admin Dashboard Redesign — Design Spec

**Date:** 2026-06-22  
**Scope:** Admin layout, sidebar, and dashboard page (`/admin`)

---

## 1. Goals

- Full responsiveness: desktop, tablet, mobile
- More informative dashboard: revenue chart + pending orders alert
- Modern emerald-accent visual consistent with MahaSewa brand
- Fix existing bug: OrderRow links to `/dashboard/orders/` instead of `/admin/orders/`

---

## 2. Layout & Sidebar

### Sidebar — 3 Responsive States

| Breakpoint | Behavior |
|---|---|
| Desktop ≥1024px | Expanded `w-60`, always visible, icon + label |
| Tablet 768–1023px | Collapsed `w-16`, icon-only, hover tooltip for label, toggle button to expand |
| Mobile <768px | Hidden, opens as overlay drawer on hamburger click, backdrop overlay behind |

### Sidebar Visual

- Background: `bg-emerald-900`
- Active nav item: `bg-emerald-700 text-white`
- Inactive nav item: `text-emerald-100 hover:bg-emerald-800`
- Logo: "MahaSewa" white + small "Admin" badge (`text-emerald-300`)
- Icons: `lucide-react` (already installed via shadcn)

### Nav Items + Icons

| Label | Icon (lucide-react) |
|---|---|
| Dashboard | `LayoutDashboard` |
| Categories | `Tag` |
| Services | `Briefcase` |
| Partners | `Handshake` |
| Orders | `ShoppingCart` |
| Users | `Users` |
| Chat Inbox | `MessageSquare` |

### Header Bar

- `bg-white` with bottom border (`border-slate-200`)
- Mobile: hamburger button (`Menu` icon) on left to toggle sidebar drawer
- Right side: user avatar (initials circle, emerald bg) + user name + Keluar button
- Sticky at top on all breakpoints

### Files to Change

- `components/shared/admin-sidebar.tsx` — full rewrite (add icons, 3-state behavior, mobile drawer)
- `app/admin/layout.tsx` — add mobile hamburger, pass sidebar state

---

## 3. Dashboard Page (`/admin`)

### 3.1 Pending Orders Alert Banner

- Rendered **only** if `pendingCount > 0`
- Style: amber background (`bg-amber-50 border border-amber-200`)
- Content: `AlertCircle` icon + "{n} pesanan menunggu konfirmasi" + link to `/admin/orders?status=PENDING`
- Position: above stat cards, full width

### 3.2 Stat Cards

Grid: `grid-cols-2` on mobile → `grid-cols-4` on desktop.

Each card contains:
- Large icon (right-aligned, muted accent color)
- Uppercase label (small, slate-500)
- Bold large number
- Sub-text for context

| Card | Icon | Accent Color |
|---|---|---|
| Total Orders | `ShoppingCart` | blue-500 |
| Revenue (Completed) | `TrendingUp` | emerald-600 |
| Active Services | `Briefcase` | purple-500 |
| Clients | `Users` | amber-500 |

### 3.3 Revenue Chart

- Library: `recharts` (new install: `npm install recharts`)
- Chart type: `BarChart`
- Data: revenue per month for last 6 months, from COMPLETED orders
- X-axis: month name (Indonesian locale)
- Y-axis: IDR formatted (abbreviated: "1.5jt")
- Bar color: `#059669` (emerald-600)
- Responsive via `ResponsiveContainer`

**New Prisma query needed:**
```ts
prisma.order.groupBy({
  by: ["createdAt"],  // will need raw query or JS-side grouping by month
  where: { status: "COMPLETED" },
  _sum: { totalAmount: true },
})
```
> Note: Prisma `groupBy` doesn't support date truncation natively. Use raw query or fetch last 6 months of COMPLETED orders then group by month in JS.

Preferred: fetch COMPLETED orders from last 6 months, group by `month/year` in JS.

### 3.4 Status Breakdown

Replace plain list with progress bars:

- Each status row: label + count + progress bar + percentage
- Bar colors match existing `STATUS_COLOR` map in `order-row.tsx`
- Percentage = `(count / totalOrders) * 100`

### 3.5 Recent Orders

- Keep existing list (last 8 orders)
- **Fix bug:** change link from `/dashboard/orders/${id}` to `/admin/orders/${id}`
- Extend query to include `client: { select: { full_name: true } }` for display

### Dashboard Layout Grid

```
[Alert Banner — full width, conditional]
[Stat ×4 — 2-col mobile, 4-col desktop]
[Revenue Chart ×2] [Status Breakdown ×1]   ← lg:grid-cols-3
[Recent Orders — full width]
```

---

## 4. Files Summary

| File | Action |
|---|---|
| `components/shared/admin-sidebar.tsx` | Full rewrite — icons, 3-state responsive, mobile drawer |
| `app/admin/layout.tsx` | Add hamburger state, pass to sidebar |
| `app/admin/page.tsx` | Add chart query, pending alert, redesign cards, fix OrderRow link |
| `components/features/order-row.tsx` | Fix link to `/admin/orders/` |
| `package.json` | Add `recharts` dependency |

---

## 5. Out of Scope

- Other admin sub-pages (orders list, services, etc.) — not redesigned in this spec
- Authentication changes
- Dark mode
