# Admin Pages Redesign — Design Spec

**Date:** 2026-06-22  
**Scope:** All admin sub-pages — list pages, form pages, order detail

---

## 1. Goals

- Consistent design language across all admin pages (matching dashboard redesign)
- Fully responsive tables via horizontal scroll
- Shared `AdminPageHeader` and `AdminEmptyState` components
- Emerald accent on buttons, rings, and active states
- Back navigation on form and detail pages

---

## 2. Shared Components

### `components/shared/admin-page-header.tsx` (NEW)

```ts
interface AdminPageHeaderProps {
  title: string
  description?: string
  backHref?: string       // renders "← Back" link above title
  action?: React.ReactNode // right-side slot for add/action button
}
```

- `backHref` present → `← Back` link (`text-sm text-slate-500 hover:text-slate-700`) above title
- `title`: `text-2xl font-bold text-slate-800`
- `description`: `text-sm text-slate-500` below title
- `action`: right-aligned slot

### `components/shared/admin-empty-state.tsx` (NEW)

```ts
interface AdminEmptyStateProps {
  message: string
  actionHref?: string
  actionLabel?: string
}
```

- Container: `rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center`
- Icon: `Inbox` from lucide-react, `size={40}`, `className="text-slate-300 mx-auto mb-3"`
- Message: `text-sm text-slate-500`
- Optional action: `text-emerald-600 hover:underline font-medium`

### AdminTable Pattern (not a component — apply directly)

All tables wrapped as:
```tsx
<Card>
  <div className="overflow-x-auto">
    <table className="w-full min-w-[600px] text-sm">
      <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
      <tbody className="divide-y divide-slate-100">
    </table>
  </div>
</Card>
```

`min-w-[600px]` prevents table collapse on mobile — triggers horizontal scroll instead.

---

## 3. List Pages

### Common pattern for all list pages

- Header: `<AdminPageHeader title="..." action={...} />`
- Primary "add" button: `className="bg-emerald-600 hover:bg-emerald-700 text-white"`
- Table: `Card > overflow-x-auto > table.min-w-[600px]`
- Empty state: `<AdminEmptyState message="..." actionHref="..." actionLabel="..." />`
- `tbody tr`: `hover:bg-slate-50`

### Services (`app/admin/services/page.tsx`)

- Table: wrap in `overflow-x-auto`, add `min-w-[600px]`
- Actions: Edit → `Button variant="outline" size="sm"`, Toggle → `Button variant="ghost" size="sm"`, Hapus → `Button variant="destructive" size="sm"`
- Empty state: `AdminEmptyState message="Belum ada service." actionHref="/admin/services/new" actionLabel="Tambah sekarang"`

### Orders (`app/admin/orders/page.tsx`)

- Filter tabs: active state → `bg-emerald-600 text-white border-emerald-600` (was `bg-slate-900`)
- Inactive tabs: `bg-white text-slate-600 hover:bg-slate-50 border-slate-200`
- Table: wrap in `overflow-x-auto`, add `min-w-[640px]`
- Empty state: `AdminEmptyState message="Tidak ada order."`

### Users (`app/admin/users/page.tsx`)

- Table: wrap in `overflow-x-auto`, add `min-w-[600px]`
- Role badges: ADMIN = `bg-violet-100 text-violet-700`, CLIENT = `bg-slate-100 text-slate-600` (already correct)
- Empty state: `AdminEmptyState message="Belum ada pengguna."`

### Categories (`app/admin/categories/page.tsx`)

- Replace inline header div → `AdminPageHeader`
- Replace inline empty state → `AdminEmptyState`
- Replace raw `<a>` Edit link → `Button variant="ghost" size="sm" asChild><Link>`
- Replace raw `<button>` Hapus → `Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"`
- Table: wrap in `overflow-x-auto`, add `min-w-[600px]`

### Partners (`app/admin/partners/page.tsx`)

- Replace emoji empty state → `AdminEmptyState`
- Replace raw `<button>` actions → `Button variant="ghost" size="sm"` with appropriate color classes
- Table: wrap in `overflow-x-auto`, add `min-w-[640px]`

### Chat Inbox (`app/admin/chat/page.tsx`)

- Add `AdminPageHeader title="Chat Inbox" description="{rooms.length} percakapan"`
- Each room item: add `relative` — if last message < 24h ago, show green dot `w-2 h-2 bg-emerald-500 rounded-full` in top-right corner
- Room card: keep existing list layout inside `Card`

---

## 4. Form Pages

### Form input focus ring

All `<select>` and `<textarea>` native elements: replace `focus-visible:ring-slate-900` → `focus-visible:ring-emerald-500`

### Submit button

All form submit buttons: `className="bg-emerald-600 hover:bg-emerald-700 text-white"`

### Back navigation

All new/edit page wrappers: add `AdminPageHeader` with `backHref` pointing to parent list.

| File | title | backHref |
|---|---|---|
| `services/new/page.tsx` | "Tambah Service" | `/admin/services` |
| `services/[id]/edit/page.tsx` | "Edit Service" | `/admin/services` |
| `categories/new/page.tsx` | "Tambah Kategori" | `/admin/categories` |
| `categories/[id]/page.tsx` | "Edit Kategori" | `/admin/categories` |
| `partners/new/page.tsx` | "Tambah Partner" | `/admin/partners` |
| `partners/[id]/page.tsx` | "Edit Partner" | `/admin/partners` |

### Form components (`_form.tsx` files)

- `services/_form.tsx`: emerald ring on `<select>` and `<textarea>`, emerald submit button
- `categories/_form.tsx`: emerald ring on `<select>`, emerald submit button
- `partners/_form.tsx`: emerald ring on any `<select>`/`<textarea>`, emerald submit button

---

## 5. Order Detail Page (`app/admin/orders/[id]/page.tsx`)

### Header

```tsx
<AdminPageHeader
  title={order.service.title}
  description={`Order #${order.id.slice(0, 8)}`}
  backHref="/admin/orders"
/>
```

### Detail Card (lg:col-span-2)

- Replace `Row` component with labeled grid rows: `flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0`
- Status: render as colored badge (use `STATUS_COLOR` map) instead of plain text
- Brief notes: `rounded-lg bg-slate-50 p-4 text-sm whitespace-pre-wrap border border-slate-200`
- File brief link: `Button variant="outline" size="sm" asChild` + `ExternalLink` icon
- Deliverable link: `Button variant="outline" size="sm" asChild` + `Download` icon
- Review block: `bg-amber-50 border border-amber-200 rounded-lg p-4` — render stars as `★` chars colored amber

### Status Card (right sidebar)

- Show current status as badge above dropdown
- `<select>` ring: `focus-visible:ring-emerald-500`
- Submit button: `bg-emerald-600 hover:bg-emerald-700`

### Upload Deliverable Card

- Submit button: `bg-emerald-600 hover:bg-emerald-700`

---

## 6. Files Summary

| File | Action |
|---|---|
| `components/shared/admin-page-header.tsx` | Create |
| `components/shared/admin-empty-state.tsx` | Create |
| `app/admin/services/page.tsx` | Modify |
| `app/admin/orders/page.tsx` | Modify |
| `app/admin/users/page.tsx` | Modify |
| `app/admin/categories/page.tsx` | Modify |
| `app/admin/partners/page.tsx` | Modify |
| `app/admin/chat/page.tsx` | Modify |
| `app/admin/services/_form.tsx` | Modify |
| `app/admin/services/new/page.tsx` | Modify |
| `app/admin/services/[id]/edit/page.tsx` | Modify |
| `app/admin/categories/_form.tsx` | Modify |
| `app/admin/categories/new/page.tsx` | Modify |
| `app/admin/categories/[id]/page.tsx` | Modify |
| `app/admin/partners/_form.tsx` | Modify |
| `app/admin/partners/new/page.tsx` | Modify |
| `app/admin/partners/[id]/page.tsx` | Modify |
| `app/admin/orders/[id]/page.tsx` | Modify |

---

## 7. Out of Scope

- `app/admin/orders/[id]/_deliverable-form.tsx` — no visual changes needed
- `app/admin/orders/actions.ts`, `users/actions.ts`, etc. — server actions unchanged
- Chat real-time functionality — no changes
