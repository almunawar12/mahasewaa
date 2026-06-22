# Admin Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all admin sub-pages to match the new emerald design language with shared components, responsive tables, and consistent header/empty-state patterns.

**Architecture:** Two new shared components (`AdminPageHeader`, `AdminEmptyState`) are created first, then all 16 existing files are updated to use them. No new routes or data layer changes — visual and structural updates only.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, lucide-react, shadcn/ui

## Global Constraints

- Tailwind only — no inline styles
- `lucide-react` for all icons
- Emerald-600 for primary buttons and active states
- `focus-visible:ring-emerald-500` on all native `<select>` and `<textarea>` elements
- All tables: `Card > div.overflow-x-auto > table.w-full.min-w-[600px]`
- No changes to server actions or Prisma queries

---

## File Map

| File | Action |
|---|---|
| `components/shared/admin-page-header.tsx` | Create |
| `components/shared/admin-empty-state.tsx` | Create |
| `app/admin/services/page.tsx` | Rewrite |
| `app/admin/services/new/page.tsx` | Modify |
| `app/admin/services/[id]/edit/page.tsx` | Modify |
| `app/admin/services/_form.tsx` | Modify |
| `app/admin/orders/page.tsx` | Rewrite |
| `app/admin/users/page.tsx` | Rewrite |
| `app/admin/categories/page.tsx` | Rewrite |
| `app/admin/categories/new/page.tsx` | Modify |
| `app/admin/categories/[id]/page.tsx` | Modify |
| `app/admin/categories/_form.tsx` | Modify |
| `app/admin/partners/page.tsx` | Rewrite |
| `app/admin/partners/new/page.tsx` | Modify |
| `app/admin/partners/[id]/page.tsx` | Modify |
| `app/admin/chat/page.tsx` | Rewrite |
| `app/admin/orders/[id]/page.tsx` | Rewrite |

---

### Task 1: Create shared components

**Files:**
- Create: `components/shared/admin-page-header.tsx`
- Create: `components/shared/admin-empty-state.tsx`

**Interfaces:**
- Produces:
  ```ts
  // admin-page-header.tsx
  interface AdminPageHeaderProps {
    title: string
    description?: string
    backHref?: string
    action?: React.ReactNode
  }
  export function AdminPageHeader(props: AdminPageHeaderProps): JSX.Element

  // admin-empty-state.tsx
  interface AdminEmptyStateProps {
    message: string
    actionHref?: string
    actionLabel?: string
  }
  export function AdminEmptyState(props: AdminEmptyStateProps): JSX.Element
  ```

- [ ] **Step 1: Create `components/shared/admin-page-header.tsx`**

```tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, description, backHref, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft size={14} />
            Kembali
          </Link>
        )}
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/shared/admin-empty-state.tsx`**

```tsx
import Link from "next/link";
import { Inbox } from "lucide-react";

interface AdminEmptyStateProps {
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

export function AdminEmptyState({ message, actionHref, actionLabel }: AdminEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <Inbox size={40} className="mx-auto mb-3 text-slate-300" />
      <p className="text-sm text-slate-500">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/shared/admin-page-header.tsx components/shared/admin-empty-state.tsx
git commit -m "feat: add AdminPageHeader and AdminEmptyState shared components"
```

---

### Task 2: Services list page + form + new/edit wrappers

**Files:**
- Rewrite: `app/admin/services/page.tsx`
- Modify: `app/admin/services/_form.tsx`
- Modify: `app/admin/services/new/page.tsx`
- Modify: `app/admin/services/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminEmptyState` from Task 1

- [ ] **Step 1: Rewrite `app/admin/services/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { toggleServiceAction, deleteServiceAction } from "./actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Services" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        action={
          <Link href="/admin/services/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">+ Tambah Service</Button>
          </Link>
        }
      />

      {services.length === 0 ? (
        <AdminEmptyState
          message="Belum ada service."
          actionHref="/admin/services/new"
          actionLabel="Tambah sekarang"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-slate-500">/{s.slug}</p>
                    </td>
                    <td className="px-4 py-3">{formatIDR(s.basePrice.toString())}</td>
                    <td className="px-4 py-3">{s.deliveryDays} hari</td>
                    <td className="px-4 py-3">{s._count.orders}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          s.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/services/${s.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await toggleServiceAction(s.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit">
                            {s.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deleteServiceAction(s.id);
                          }}
                        >
                          <Button variant="destructive" size="sm" type="submit">
                            Hapus
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `app/admin/services/_form.tsx`** — change `<select>` and `<textarea>` ring to emerald, submit button to emerald

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ServiceFormDefaults = {
  title?: string;
  slug?: string;
  description?: string;
  basePrice?: string;
  revisionLimit?: number;
  deliveryDays?: number;
  imageUrls?: string[];
  categoryId?: string | null;
};

export type CategoryOption = { id: string; name: string };

export function ServiceForm({
  action,
  defaults = {},
  categories = [],
  submitLabel = "Simpan",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: ServiceFormDefaults;
  categories?: CategoryOption[];
  submitLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={defaults.title} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={defaults.slug} required pattern="[a-z0-9-]+" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={defaults.categoryId ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value="">— Tanpa Kategori —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={defaults.description}
              required
              minLength={20}
              rows={6}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="basePrice">Harga Dasar (Rp)</Label>
              <Input id="basePrice" name="basePrice" type="number" min={0} defaultValue={defaults.basePrice} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="revisionLimit">Limit Revisi</Label>
              <Input
                id="revisionLimit"
                name="revisionLimit"
                type="number"
                min={0}
                defaultValue={defaults.revisionLimit ?? 1}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliveryDays">Lama Pengerjaan (hari)</Label>
              <Input
                id="deliveryDays"
                name="deliveryDays"
                type="number"
                min={1}
                defaultValue={defaults.deliveryDays ?? 7}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrls">Image URLs (satu per baris)</Label>
            <textarea
              id="imageUrls"
              name="imageUrls"
              defaultValue={(defaults.imageUrls ?? []).join("\n")}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              placeholder="https://…"
            />
          </div>

          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{submitLabel}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Update `app/admin/services/new/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../_form";
import { createServiceAction } from "../actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export const metadata = { title: "Admin · Service Baru" };

export default async function NewServicePage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Tambah Service" backHref="/admin/services" />
      <ServiceForm action={createServiceAction} categories={categories} submitLabel="Buat Service" />
    </div>
  );
}
```

- [ ] **Step 4: Update `app/admin/services/[id]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../../_form";
import { updateServiceAction } from "../../actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export const metadata = { title: "Admin · Edit Service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!service) notFound();

  const images = Array.isArray(service.imageUrls) ? (service.imageUrls as string[]) : [];

  async function action(formData: FormData) {
    "use server";
    await updateServiceAction(id, formData);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Service" backHref="/admin/services" />
      <ServiceForm
        action={action}
        categories={categories}
        defaults={{
          title: service.title,
          slug: service.slug,
          description: service.description,
          basePrice: service.basePrice.toString(),
          revisionLimit: service.revisionLimit,
          deliveryDays: service.deliveryDays,
          imageUrls: images,
          categoryId: service.categoryId,
        }}
        submitLabel="Update Service"
      />
    </div>
  );
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/admin/services/page.tsx app/admin/services/_form.tsx app/admin/services/new/page.tsx "app/admin/services/[id]/edit/page.tsx"
git commit -m "feat: redesign services admin pages"
```

---

### Task 3: Orders + Users list pages

**Files:**
- Rewrite: `app/admin/orders/page.tsx`
- Rewrite: `app/admin/users/page.tsx`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminEmptyState` from Task 1

- [ ] **Step 1: Rewrite `app/admin/orders/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Orders" };

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true } },
      client: { select: { fullName: true, email: true } },
    },
  });

  const filters = ["ALL", "PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Orders" />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (f === "ALL" && !status) || f === status;
          return (
            <Link
              key={f}
              href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <AdminEmptyState message="Tidak ada order." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.service.title}</p>
                      <p className="text-xs text-slate-500">#{o.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.client.fullName}</p>
                      <p className="text-xs text-slate-500">{o.client.email}</p>
                    </td>
                    <td className="px-4 py-3">{formatIDR(o.totalAmount.toString())}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${o.id}`} className="text-xs font-semibold text-emerald-600 hover:underline">
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `app/admin/users/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { setUserRoleAction } from "./actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Users" />

      {users.length === 0 ? (
        <AdminEmptyState message="Belum ada pengguna." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Gabung</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === session?.user.id;
                  const nextRole = u.role === "ADMIN" ? "CLIENT" : "ADMIN";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            u.role === "ADMIN"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u._count.orders}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400">(akun Anda)</span>
                        ) : (
                          <form
                            action={async (fd) => {
                              "use server";
                              fd.set("role", nextRole);
                              await setUserRoleAction(u.id, fd);
                            }}
                          >
                            <Button type="submit" variant="outline" size="sm">
                              Jadikan {nextRole}
                            </Button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/admin/orders/page.tsx app/admin/users/page.tsx
git commit -m "feat: redesign orders and users admin pages"
```

---

### Task 4: Categories list page + form + new/edit wrappers

**Files:**
- Rewrite: `app/admin/categories/page.tsx`
- Modify: `app/admin/categories/_form.tsx`
- Modify: `app/admin/categories/new/page.tsx`
- Modify: `app/admin/categories/[id]/page.tsx`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminEmptyState` from Task 1

- [ ] **Step 1: Rewrite `app/admin/categories/page.tsx`**

```tsx
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Kategori" };

export default async function CategoriesPage() {
  await requireAdmin();

  async function deleteCategory(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { services: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kategori"
        action={
          <Link href="/admin/categories/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">+ Tambah Kategori</Button>
          </Link>
        }
      />

      {categories.length === 0 ? (
        <AdminEmptyState
          message="Belum ada kategori."
          actionHref="/admin/categories/new"
          actionLabel="Tambah sekarang"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ikon</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Jasa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="material-symbols-outlined text-[20px] text-slate-500">
                        {cat.icon}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{cat.slug}</td>
                    <td className="px-4 py-3 text-slate-500">{cat._count.services}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          cat.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cat.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/categories/${cat.id}`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={cat.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Hapus
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `app/admin/categories/_form.tsx`** — emerald ring on select, emerald submit button

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ICON_OPTIONS = [
  { value: "design_services", label: "Desain Grafis" },
  { value: "code", label: "Programming" },
  { value: "edit_document", label: "Penulisan" },
  { value: "campaign", label: "Marketing" },
  { value: "photo_camera", label: "Fotografi" },
  { value: "movie", label: "Video" },
  { value: "music_note", label: "Musik / Audio" },
  { value: "translate", label: "Terjemahan" },
  { value: "manage_accounts", label: "Bisnis" },
  { value: "category", label: "Lainnya" },
];

export type CategoryFormDefaults = {
  name?: string;
  slug?: string;
  icon?: string;
  isActive?: boolean;
};

export function CategoryForm({
  action,
  defaults = {},
  submitLabel = "Simpan",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: CategoryFormDefaults;
  submitLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaults.name}
                placeholder="Desain Grafis"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={defaults.slug}
                placeholder="desain-grafis"
                pattern="[a-z0-9-]+"
                required
              />
              <p className="text-xs text-slate-400">Huruf kecil, angka, dan tanda - saja</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="icon">Ikon (Material Symbols)</Label>
            <select
              id="icon"
              name="icon"
              defaultValue={defaults.icon ?? "category"}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked={defaults.isActive !== false}
              className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
            />
            <Label htmlFor="isActive">Aktif (tampil di halaman publik)</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Update `app/admin/categories/new/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../_form";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export const metadata = { title: "Admin · Tambah Kategori" };

export default async function NewCategoryPage() {
  await requireAdmin();

  async function createCategory(formData: FormData) {
    "use server";
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const icon = formData.get("icon") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.category.create({
      data: { name, slug, icon, isActive },
    });

    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Tambah Kategori" backHref="/admin/categories" />
      <div className="max-w-xl">
        <CategoryForm action={createCategory} submitLabel="Buat Kategori" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update `app/admin/categories/[id]/page.tsx`**

```tsx
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../_form";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin · Edit Kategori" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  async function updateCategory(formData: FormData) {
    "use server";
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const icon = formData.get("icon") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.category.update({
      where: { id },
      data: { name, slug, icon, isActive },
    });

    redirect("/admin/categories");
  }

  async function deleteCategory() {
    "use server";
    await requireAdmin();
    await prisma.category.delete({ where: { id } });
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Edit: ${category.name}`} backHref="/admin/categories" />

      <div className="max-w-xl space-y-6">
        <CategoryForm
          action={updateCategory}
          defaults={{
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            isActive: category.isActive,
          }}
          submitLabel="Simpan Perubahan"
        />

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-sm font-medium text-red-700">Zona Berbahaya</p>
          <p className="text-xs text-red-600">
            Semua jasa di kategori ini akan kehilangan kategorinya.
          </p>
          <form action={deleteCategory}>
            <Button type="submit" variant="destructive" size="sm">
              Hapus Kategori
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/admin/categories/page.tsx app/admin/categories/_form.tsx app/admin/categories/new/page.tsx "app/admin/categories/[id]/page.tsx"
git commit -m "feat: redesign categories admin pages"
```

---

### Task 5: Partners list page + new/edit wrappers

**Files:**
- Rewrite: `app/admin/partners/page.tsx`
- Modify: `app/admin/partners/new/page.tsx`
- Modify: `app/admin/partners/[id]/page.tsx`

Note: `partners/_form.tsx` already has `bg-emerald-600 hover:bg-emerald-700` on submit — no changes needed.

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminEmptyState` from Task 1

- [ ] **Step 1: Rewrite `app/admin/partners/page.tsx`**

```tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deletePartnerAction, togglePartnerAction } from "./actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export default async function PartnersPage() {
  await requireAdmin();

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Partners"
        description={`${partners.length} partner terdaftar`}
        action={
          <Link href="/admin/partners/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">+ Tambah Partner</Button>
          </Link>
        }
      />

      {partners.length === 0 ? (
        <AdminEmptyState
          message="Belum ada partner."
          actionHref="/admin/partners/new"
          actionLabel="Tambah sekarang"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                        <span className="font-medium text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.categories.length > 0
                        ? p.categories.map((c) => c.name).join(", ")
                        : <span className="italic text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                        {p.skills.length > 3 && (
                          <span className="text-xs text-slate-400">+{p.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/partners/${p.id}`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await togglePartnerAction(p.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit" className="text-amber-600 hover:text-amber-700">
                            {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deletePartnerAction(p.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            Hapus
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `app/admin/partners/new/page.tsx`**

```tsx
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { PartnerForm } from "../_form";
import { createPartnerAction } from "../actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export default async function NewPartnerPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <AdminPageHeader title="Tambah Partner" backHref="/admin/partners" />
      <PartnerForm
        action={createPartnerAction}
        submitLabel="Tambah Partner"
        categories={categories}
      />
    </div>
  );
}
```

- [ ] **Step 3: Update `app/admin/partners/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { PartnerForm } from "../_form";
import { updatePartnerAction, deletePartnerAction } from "../actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPartnerPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { categories: { select: { id: true } } },
  });
  if (!partner) notFound();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const updateAction = updatePartnerAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <AdminPageHeader title="Edit Partner" backHref="/admin/partners" />

      <PartnerForm
        action={updateAction}
        defaults={{
          name: partner.name,
          photoUrl: partner.photoUrl,
          skills: partner.skills,
          categoryIds: partner.categories.map((c) => c.id),
          isActive: partner.isActive,
        }}
        submitLabel="Simpan Perubahan"
        categories={categories}
      />

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
        <p className="text-sm font-medium text-red-700">Zona Berbahaya</p>
        <p className="text-xs text-red-600">
          Hapus partner ini secara permanen. Foto juga akan dihapus dari storage.
        </p>
        <form
          action={async () => {
            "use server";
            await deletePartnerAction(id);
          }}
        >
          <Button type="submit" variant="destructive" size="sm">
            Hapus Partner
          </Button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/admin/partners/page.tsx app/admin/partners/new/page.tsx "app/admin/partners/[id]/page.tsx"
git commit -m "feat: redesign partners admin pages"
```

---

### Task 6: Chat Inbox page

**Files:**
- Rewrite: `app/admin/chat/page.tsx`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminEmptyState` from Task 1

- [ ] **Step 1: Rewrite `app/admin/chat/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Chat Inbox" };

export default async function AdminChatInboxPage() {
  const rooms = await prisma.chatRoom.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true } },
      client: { select: { fullName: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chat Inbox"
        description={`${rooms.length} percakapan`}
      />

      {rooms.length === 0 ? (
        <AdminEmptyState message="Belum ada percakapan." />
      ) : (
        <Card>
          {rooms.map((r) => {
            const lastMsg = r.messages[0];
            const isRecent = lastMsg && new Date(lastMsg.createdAt) > oneDayAgo;
            return (
              <Link
                key={r.id}
                href={`/chat/${r.id}`}
                className="relative flex items-center justify-between border-b border-slate-200 px-6 py-4 last:border-0 hover:bg-slate-50"
              >
                {isRecent && (
                  <span className="absolute right-6 top-4 h-2 w-2 rounded-full bg-emerald-500" />
                )}
                <div className="min-w-0 pr-8">
                  <p className="font-medium">{r.client.fullName}</p>
                  <p className="text-xs text-slate-500">{r.service.title}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                    {lastMsg?.content ?? "Belum ada pesan"}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  <p>{r._count.messages} pesan</p>
                  <p>{new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/chat/page.tsx
git commit -m "feat: redesign chat inbox admin page"
```

---

### Task 7: Order Detail page

**Files:**
- Rewrite: `app/admin/orders/[id]/page.tsx`

**Interfaces:**
- Consumes: `AdminPageHeader` from Task 1

- [ ] **Step 1: Rewrite `app/admin/orders/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { updateOrderStatusAction, setDeliverableAction } from "../actions";
import { DeliverableForm } from "./_deliverable-form";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { ExternalLink, Download } from "lucide-react";

export const metadata = { title: "Admin · Detail Order" };

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      client: { select: { fullName: true, email: true } },
      review: true,
    },
  });
  if (!order) notFound();

  async function statusAction(formData: FormData) {
    "use server";
    await updateOrderStatusAction(id, formData);
  }
  async function deliverableAction(formData: FormData) {
    "use server";
    await setDeliverableAction(id, formData);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={order.service.title}
        description={`Order #${order.id.slice(0, 8)}`}
        backHref="/admin/orders"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Detail card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detail Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 text-sm">
            <DetailRow label="Client" value={`${order.client.fullName} (${order.client.email})`} />
            <DetailRow label="Total" value={formatIDR(order.totalAmount.toString())} />
            <DetailRow
              label="Status"
              value={
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? ""}`}>
                  {order.status}
                </span>
              }
            />
            <DetailRow
              label="Due Date"
              value={order.dueDate ? new Date(order.dueDate).toLocaleString("id-ID") : "—"}
            />

            {order.briefNotes && (
              <div className="border-b border-slate-100 py-3">
                <p className="mb-2 text-slate-500">Brief</p>
                <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  {order.briefNotes}
                </p>
              </div>
            )}

            {order.briefFileUrl && (
              <div className="border-b border-slate-100 py-3">
                <p className="mb-2 text-slate-500">File Brief</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={order.briefFileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} className="mr-1" />
                    Lihat Lampiran
                  </a>
                </Button>
              </div>
            )}

            {order.deliveryFileUrl && (
              <div className="border-b border-slate-100 py-3">
                <p className="mb-2 text-slate-500">Deliverable</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={order.deliveryFileUrl} target="_blank" rel="noopener noreferrer">
                    <Download size={14} className="mr-1" />
                    Download
                  </a>
                </Button>
              </div>
            )}

            {order.review && (
              <div className="pt-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-1 text-xs font-medium text-amber-700">Review Client</p>
                  <p className="text-amber-800">
                    {"★".repeat(order.review.rating)}{"☆".repeat(5 - order.review.rating)}
                    <span className="ml-2 text-sm">{order.review.comment}</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ubah Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? ""}`}>
                Saat ini: {order.status}
              </span>
              <form action={statusAction} className="flex gap-2">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Update
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upload Deliverable</CardTitle>
            </CardHeader>
            <CardContent>
              <DeliverableForm
                orderId={order.id}
                currentUrl={order.deliveryFileUrl}
                action={deliverableAction}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/admin/orders/[id]/page.tsx"
git commit -m "feat: redesign order detail admin page"
```

---

## Self-Review

**Spec coverage:**
- ✅ `AdminPageHeader` with `backHref`, `title`, `description`, `action` — Task 1
- ✅ `AdminEmptyState` with icon, message, optional action link — Task 1
- ✅ All tables: `Card > overflow-x-auto > table.min-w-[600px]` — Tasks 2–6
- ✅ Services: responsive table, correct button variants — Task 2
- ✅ Orders: emerald filter tabs, responsive table — Task 3
- ✅ Users: responsive table — Task 3
- ✅ Categories: `AdminPageHeader`, `AdminEmptyState`, Button components, danger zone — Task 4
- ✅ Partners: `AdminEmptyState`, responsive table, Button components — Task 5
- ✅ Chat: `AdminPageHeader`, `AdminEmptyState`, recent dot indicator — Task 6
- ✅ Order detail: `AdminPageHeader` with back, status badge, styled brief, review stars, emerald buttons — Task 7
- ✅ Form ring: emerald on `<select>`/`<textarea>` in services and categories forms — Tasks 2, 4
- ✅ Partners `_form.tsx` already has emerald button — no change needed (noted in Task 5)
- ✅ Back navigation on all new/edit pages — Tasks 2, 4, 5

**Placeholder scan:** None.

**Type consistency:**
- `AdminPageHeader` props used identically across Tasks 2–7 ✅
- `AdminEmptyState` props used identically ✅
- `STATUS_COLOR` defined locally in `orders/page.tsx` (Task 3) and `orders/[id]/page.tsx` (Task 7) — both independent files, both identical ✅
