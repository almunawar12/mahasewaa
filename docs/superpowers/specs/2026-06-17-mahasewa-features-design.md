# MahaSewa — Feature Completion & Supabase Migration Design

**Date:** 2026-06-17  
**Scope:** All missing features except real-time chat. Chat persistence/realtime deferred to next cycle.

---

## 1. Supabase Setup

### Database
- Prisma stays as ORM — no changes to schema or queries.
- Only `DATABASE_URL` changes to Supabase connection string (Transaction Pooler, port 6543).
- Add `DIRECT_URL` for DDL operations (migrate/push). Pooler does not support DDL.
- Update `prisma/schema.prisma` datasource block:
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```
- Run `prisma db push` to apply existing schema to Supabase.

### Environment Variables (`.env`)
```
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

### Storage
- Install `@supabase/supabase-js`.
- Create `lib/supabase.ts` — browser Supabase client (anon key, public).
- Create bucket `uploads` in Supabase dashboard.
  - Policy: authenticated users can INSERT, public can SELECT (read).
- Path convention: `briefs/{userId}/{timestamp}-{filename}`, `deliverables/{orderId}/{filename}`.

---

## 2. File Upload

### Component: `components/features/file-upload.tsx`
- Client component.
- Props: `bucket: string`, `path: string`, `onUpload: (url: string) => void`, `accept?: string`.
- State: `uploading: boolean`, `error: string | null`, `uploadedUrl: string | null`.
- Upload directly from browser to Supabase Storage (bypasses Next.js size limits).
- On success: call `onUpload(publicUrl)`.
- On error: show inline error message (not toast — must stay visible).
- Shows disabled state + "Mengupload…" text during upload.

### Checkout (`/checkout/[slug]`)
- Add `FileUpload` for brief attachment.
- Path: `briefs/{userId}/{Date.now()}-{file.name}`.
- URL stored in hidden input `briefFileUrl`.
- Server action `createOrder` already has `briefFileUrl` field — just wire it up.

### Admin Order Detail (`/admin/orders/[id]`)
- Add `FileUpload` for deliverable.
- Path: `deliverables/{orderId}/{file.name}`.
- URL passed to existing `setDeliverableAction`.
- Status auto-changes to `REVIEW` (already handled in existing action).

---

## 3. Review Submission

### Trigger Condition
Show review form in `/dashboard/orders/[id]` only when:
- `order.status === "COMPLETED"`
- `order.review === null`

If review exists, show read-only display instead.

### Validation (`lib/validations/order.ts`)
Add:
```ts
export const reviewSchema = z.object({
  orderId: z.string().uuid(),
  serviceId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})
```

### Server Action: `submitReviewAction`
Inline server action inside `app/dashboard/orders/[id]/page.tsx`, consistent with existing pattern (`createOrder` in checkout).
- Validate session — order must belong to current user.
- Validate order status is `COMPLETED`.
- Validate no existing review for this order (`order.review === null`).
- `prisma.review.create({ orderId, clientId, serviceId, rating, comment })`.
- `revalidatePath('/dashboard/orders/[id]')`.

### Component: `ReviewForm` (`components/features/review-form.tsx`)
- Client component — needs interactive star rating state.
- Props: `orderId: string`, `serviceId: string`.
- State: `rating: number` (1–5), `comment: string`, `submitting: boolean`.
- 5 star buttons with fill/outline icon toggle.
- On success: `toast.success('Review berhasil dikirim!')` via sonner.
- On error: `toast.error(message)`.

---

## 4. Chat Room Creation

### New Route: `/app/chat/new/page.tsx`
Server component — pure redirect logic, no visible UI.

Flow:
1. Read `serviceId` from `searchParams`.
2. If no session → `redirect('/login?callbackUrl=/chat/new?serviceId=...')`.
3. If no `serviceId` → `redirect('/services')`.
4. Find first admin: `prisma.user.findFirst({ where: { role: 'ADMIN' } })`.
5. If no admin found → `redirect('/services?error=no_admin')`.
6. `prisma.chatRoom.upsert` with `where: { clientId_adminId_serviceId: {...} }`.
7. `redirect('/chat/[newRoom.id]')`.

### `/services/[slug]` page
"Diskusi via Chat" link already points to `/chat/new?serviceId={service.id}` — no change needed.

### `/chat` list page
- Update query to include `service.slug` in select.
- Show service name per room with link back to service detail.

---

## 5. Search

### URL Pattern
`/services?q=keyword`

### `/services/page.tsx`
- Accept `searchParams: { q?: string }` prop.
- If `q` present, add Prisma `OR` filter:
  ```ts
  OR: [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } },
  ]
  ```
- Show `"keyword" — X hasil ditemukan` header above grid when `q` is set.
- Show "Tidak ada jasa yang cocok" if 0 results.
- Remove `revalidate = 60` when search param is active (dynamic rendering needed).

### Navbar Search Bar
- Extract search input from `Navbar` into `SearchBar` client component (`components/features/search-bar.tsx`).
- `useRouter` + `router.push('/services?q=' + encodeURIComponent(value))` on Enter keypress or search icon click.
- Pre-fill value from current URL using `useSearchParams()` hook (only active when on `/services` — otherwise empty).
- Needs `usePathname` + `useSearchParams` from `next/navigation` (already client component).
- `Navbar` stays server component — passes no props to `SearchBar`.

---

## 6. Mobile Menu

### Architecture
Split `Navbar` into two components:
- `Navbar` (`components/shared/navbar.tsx`) — server component. Fetches session, renders `<NavbarClient session={session} />`.
- `NavbarClient` (`components/shared/navbar-client.tsx`) — client component. Receives `session` prop, manages `menuOpen` state.

### Mobile Menu UI
```tsx
// Toggle button (already exists, just needs onClick)
<button onClick={() => setMenuOpen(o => !o)}>
  <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
</button>

// Drawer — below header, full width
<div className={`${menuOpen ? 'flex' : 'hidden'} md:hidden flex-col border-t ...`}>
  {/* same links as desktop nav */}
</div>
```
Close on navigation (add `onClick={() => setMenuOpen(false)}` to each link).

---

## 7. Toast Notifications (Sonner)

### Setup
- Install `sonner`.
- Add `<Toaster richColors position="top-right" />` to `app/layout.tsx`.

### Usage per feature
| Location | Trigger | Message |
|---|---|---|
| `ReviewForm` | submit success | `toast.success('Review berhasil dikirim!')` |
| `ReviewForm` | submit error | `toast.error(errorMessage)` |
| `FileUpload` | upload error | inline error (not toast) |
| Checkout | order created | redirect handles feedback (no toast needed) |
| Admin actions | status update success | `toast.success('Status diperbarui')` |

---

## 8. Next.js Image Optimization

### `next.config.ts`
Add Supabase Storage domain:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }
  ]
}
```

### Component changes
| File | Change |
|---|---|
| `components/features/service-card.tsx` | `<img>` → `<Image width={400} height={300} />` |
| `components/features/service-gallery.tsx` | `<img>` → `<Image fill className="object-cover" />` |
| `app/services/[slug]/page.tsx` | Any remaining `<img>` → `<Image>` |

---

## Implementation Order

1. Supabase env + schema update + `db push`
2. `lib/supabase.ts` + install deps (`@supabase/supabase-js`, `sonner`)
3. `next.config.ts` image domains
4. `<Toaster>` in layout
5. `FileUpload` component
6. Checkout file upload integration
7. Admin deliverable upload integration
8. Review validation schema
9. `ReviewForm` component + `submitReviewAction`
10. `/dashboard/orders/[id]` — wire review UI
11. `/chat/new/page.tsx`
12. Search — `ServicesPage` + `SearchBar` component
13. Navbar split → `NavbarClient` with mobile menu
14. Image optimization (`<Image>` replacements)

---

## Files Created / Modified

### New files
- `lib/supabase.ts`
- `components/features/file-upload.tsx`
- `components/features/review-form.tsx`
- `components/features/search-bar.tsx`
- `components/shared/navbar-client.tsx`
- `app/chat/new/page.tsx`

### Modified files
- `prisma/schema.prisma` — add `directUrl`
- `.env` — add Supabase vars
- `next.config.ts` — image remotePatterns
- `app/layout.tsx` — add `<Toaster>`
- `app/checkout/[slug]/page.tsx` — file upload
- `app/dashboard/orders/[id]/page.tsx` — review UI
- `app/admin/orders/[id]/page.tsx` — deliverable upload
- `app/services/page.tsx` — search filter
- `app/chat/page.tsx` — include service.slug
- `components/shared/navbar.tsx` — extract to NavbarClient
- `components/features/service-card.tsx` — Image
- `components/features/service-gallery.tsx` — Image
- `lib/validations/order.ts` — reviewSchema
- `package.json` — new deps
