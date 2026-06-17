# MahaSewa Feature Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all missing MahaSewa features — Supabase DB migration, file uploads, review submission, chat room creation, search, mobile menu, toast notifications, and Next.js Image optimization.

**Architecture:** Prisma stays as ORM with only `DATABASE_URL` changing to Supabase. Storage uploads go browser→Supabase directly (no Next.js proxy). New client interactivity is extracted into focused client components that receive server actions as props. All server actions validate session server-side before touching the DB, consistent with existing patterns.

**Tech Stack:** Next.js 16 App Router, Prisma 7 + `@prisma/adapter-pg`, Supabase (PostgreSQL + Storage), `@supabase/supabase-js`, `sonner`, TypeScript 5, Tailwind CSS 4

## Global Constraints

- All server actions call `auth()` and verify session before any DB write
- Client components receive server actions as props from server component parents — never call `auth()` from client
- Supabase Storage uploads: browser → Supabase directly (bypasses Next.js 4MB body limit)
- Storage path convention: `briefs/{userId}/{timestamp}-{filename}`, `deliverables/{orderId}/{filename}`
- Toast: `sonner` only — `toast.success` / `toast.error`
- Image component: `next/image` `<Image>` — no raw `<img>` for user-uploaded content
- TypeScript strict — no `any` casts
- Server actions pattern: inline in page files, consistent with existing `createOrder` / `statusAction` / `deliverableAction` patterns
- No `export const revalidate` on pages that read `searchParams` (Next.js requires dynamic rendering)

---

### Task 1: Supabase Database Migration + Dependencies

**Files:**
- Modify: `prisma/schema.prisma` — add `directUrl`
- Modify: `.env` — add Supabase connection strings + public keys
- Modify: `package.json` — add `@supabase/supabase-js`, `sonner`

**Interfaces:**
- Produces: Working Prisma → Supabase connection. All subsequent tasks depend on this.

- [ ] **Step 1: Install dependencies**

```bash
npm install @supabase/supabase-js sonner
```

Expected: both packages in `node_modules`, `package.json` updated.

- [ ] **Step 2: Add Supabase env vars to `.env`**

Get values from Supabase Dashboard:
- Transaction Pooler string: Project → Settings → Database → Connection string → Transaction Pooler (port 6543)
- Session Mode string: same page, Session Mode (port 5432) — this is `DIRECT_URL`
- URL + Anon Key: Project → Settings → API

```env
# Replace your existing DATABASE_URL with:
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Add new:
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-from-api-settings]
```

- [ ] **Step 3: Update `prisma/schema.prisma` datasource block**

Current:
```prisma
datasource db {
  provider = "postgresql"
}
```

Replace with:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

(`directUrl` uses the direct connection for DDL operations since the pooler at port 6543 doesn't support them.)

- [ ] **Step 4: Push schema to Supabase**

```bash
npm run db:push
```

Expected: `Your database is now in sync with your Prisma schema.`

If error `prepared statement ... does not exist`: the `?pgbouncer=true` param is missing from `DATABASE_URL`. Check Step 2.

- [ ] **Step 5: Create `uploads` bucket in Supabase**

In Supabase Dashboard → Storage → New bucket:
- Name: `uploads`
- Public bucket: **ON** (files get public URLs)

Then go to Storage → Policies → New policy → **For full customization**:

```sql
-- Run in SQL Editor (Dashboard → SQL Editor)
CREATE POLICY "allow_anon_insert" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'uploads');
```

This allows our app (using anon key) to upload files. Public read is already covered by the public bucket setting.

- [ ] **Step 6: Verify connection**

```bash
npm run db:studio
```

Expected: Prisma Studio opens, shows 6 tables with data (or empty tables if fresh DB).

- [ ] **Step 7: Commit (DO NOT commit `.env`)**

```bash
git add prisma/schema.prisma package.json package-lock.json
git commit -m "feat: add supabase deps and migrate schema to supabase postgresql"
```

---

### Task 2: Infrastructure — Supabase Client, Image Config, Toaster

**Files:**
- Create: `lib/supabase.ts`
- Modify: `next.config.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces:
  - `supabase` client from `lib/supabase.ts` — consumed by `FileUpload` (Task 3)
  - `<Toaster>` mounted in layout — enables `toast.success` / `toast.error` anywhere
  - `next.config.ts` remotePatterns — required for `<Image>` in Task 10

- [ ] **Step 1: Create `lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- [ ] **Step 2: Update `next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

(Unsplash is the current fallback in `service-gallery.tsx` — must remain allowed until replaced.)

- [ ] **Step 3: Update `app/layout.tsx` — add `<Toaster>`**

Current body:
```tsx
<body className="flex min-h-full flex-col bg-white font-sans text-slate-900">
  <Providers>{children}</Providers>
</body>
```

New:
```tsx
import { Toaster } from "sonner";

<body className="flex min-h-full flex-col bg-white font-sans text-slate-900">
  <Providers>{children}</Providers>
  <Toaster richColors position="top-right" />
</body>
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase.ts next.config.ts app/layout.tsx
git commit -m "feat: add supabase client, image remote patterns, and sonner toaster"
```

---

### Task 3: FileUpload Component

**Files:**
- Create: `components/features/file-upload.tsx`

**Interfaces:**
- Consumes: `supabase` from `lib/supabase.ts`
- Produces:
  ```typescript
  export function FileUpload(props: {
    bucket: string          // "uploads"
    path: string            // prefix path e.g. "briefs/userId"
    onUpload: (url: string) => void
    accept?: string         // MIME types e.g. "image/*,application/pdf"
    label?: string          // button label, default "Pilih File"
  }): JSX.Element
  ```
  Used by Tasks 4 and 5.

- [ ] **Step 1: Create `components/features/file-upload.tsx`**

```typescript
"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface FileUploadProps {
  bucket: string;
  path: string;
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({
  bucket,
  path,
  onUpload,
  accept,
  label = "Pilih File",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const filePath = `${path}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    setFileName(file.name);
    setUploading(false);
    onUpload(data.publicUrl);
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 disabled:opacity-50"
      >
        {uploading ? "Mengupload…" : label}
      </button>
      {fileName && (
        <p className="text-xs text-slate-500">✓ {fileName}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/features/file-upload.tsx
git commit -m "feat: add FileUpload component for Supabase Storage direct upload"
```

---

### Task 4: Brief File Upload in Checkout

**Files:**
- Create: `app/checkout/[slug]/_checkout-form.tsx`
- Modify: `app/checkout/[slug]/page.tsx`

**Interfaces:**
- Consumes: `FileUpload` from `components/features/file-upload.tsx`
- Produces: `briefFileUrl` hidden input wired to upload, passed to existing `createOrder` server action

The current page is a server component with an inline `createOrder` action. Because `FileUpload` is a client component, we extract the form into a client component `CheckoutForm` and pass `createOrder` as a prop (Next.js supports passing server actions as props to client components).

- [ ] **Step 1: Create `app/checkout/[slug]/_checkout-form.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";

interface CheckoutFormProps {
  action: (formData: FormData) => Promise<void>;
  userId: string;
}

export function CheckoutForm({ action, userId }: CheckoutFormProps) {
  const [briefFileUrl, setBriefFileUrl] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="briefNotes">Detail kebutuhan Anda</Label>
        <textarea
          id="briefNotes"
          name="briefNotes"
          required
          minLength={10}
          rows={6}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Lampiran Brief (opsional)</Label>
        <FileUpload
          bucket="uploads"
          path={`briefs/${userId}`}
          accept="image/*,application/pdf,.doc,.docx,.zip"
          label="Upload File Brief"
          onUpload={(url) => setBriefFileUrl(url)}
        />
        <input type="hidden" name="briefFileUrl" value={briefFileUrl} />
      </div>
      <Button type="submit" className="w-full">Buat Pesanan</Button>
    </form>
  );
}
```

- [ ] **Step 2: Replace form in `app/checkout/[slug]/page.tsx`**

Full replacement of the file:

```typescript
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validations/order";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { CheckoutForm } from "./_checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const service = await prisma.service.findUnique({ where: { slug } }).catch(() => null);
  if (!service) notFound();

  async function createOrder(formData: FormData) {
    "use server";
    const fresh = await auth();
    if (!fresh?.user) redirect("/login");

    const parsed = orderCreateSchema.safeParse({
      serviceId: service!.id,
      briefNotes: formData.get("briefNotes"),
      briefFileUrl: formData.get("briefFileUrl") || undefined,
      totalAmount: service!.basePrice.toString(),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const order = await prisma.order.create({
      data: {
        clientId: fresh.user.id,
        serviceId: parsed.data.serviceId,
        totalAmount: parsed.data.totalAmount,
        briefNotes: parsed.data.briefNotes,
        briefFileUrl: parsed.data.briefFileUrl ?? null,
        status: "PENDING",
      },
    });

    redirect(`/dashboard/orders/${order.id}`);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto grid w-full max-w-4xl flex-1 gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Brief Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckoutForm action={createOrder} userId={userId} />
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{service.title}</p>
              <div className="flex justify-between text-slate-600">
                <span>Harga dasar</span>
                <span>{formatIDR(service.basePrice.toString())}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatIDR(service.basePrice.toString())}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual test**
  1. `npm run dev`, login as CLIENT
  2. Go to any service → Pesan Sekarang
  3. Upload a PDF/image — verify "Mengupload…" then "✓ filename.pdf"
  4. Fill brief notes, submit
  5. Verify redirect to `/dashboard/orders/[id]`
  6. In Supabase Dashboard → Storage → uploads → briefs/ — verify file exists with public URL

- [ ] **Step 5: Commit**

```bash
git add "app/checkout/[slug]/page.tsx" "app/checkout/[slug]/_checkout-form.tsx"
git commit -m "feat: add brief file upload in checkout via Supabase Storage"
```

---

### Task 5: Deliverable Upload in Admin Order Detail

**Files:**
- Create: `app/admin/orders/[id]/_deliverable-form.tsx`
- Modify: `app/admin/orders/[id]/page.tsx`

**Interfaces:**
- Consumes:
  - `FileUpload` from `components/features/file-upload.tsx`
  - `setDeliverableAction(id: string, formData: FormData)` from `app/admin/orders/actions.ts` — expects `formData.get("deliveryFileUrl")` to be a valid URL string
- Produces: deliverable upload card replaces the current URL text input

- [ ] **Step 1: Create `app/admin/orders/[id]/_deliverable-form.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/features/file-upload";
import { toast } from "sonner";

interface DeliverableFormProps {
  orderId: string;
  currentUrl: string | null;
  action: (formData: FormData) => Promise<void>;
}

export function DeliverableForm({ orderId, currentUrl, action }: DeliverableFormProps) {
  const [deliveryFileUrl, setDeliveryFileUrl] = useState(currentUrl ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!deliveryFileUrl) {
      toast.error("Upload file deliverable terlebih dahulu");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.set("deliveryFileUrl", deliveryFileUrl);
    try {
      await action(formData);
      toast.success("Deliverable dikirim. Status order → REVIEW");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim deliverable");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FileUpload
        bucket="uploads"
        path={`deliverables/${orderId}`}
        accept="image/*,application/pdf,.zip,.doc,.docx"
        label="Upload File Deliverable"
        onUpload={(url) => setDeliveryFileUrl(url)}
      />
      {currentUrl && (
        <p className="text-xs text-slate-500 break-all">
          File saat ini:{" "}
          <a href={currentUrl} target="_blank" className="text-emerald-600 underline">
            {currentUrl.split("/").pop()}
          </a>
        </p>
      )}
      <Button type="submit" disabled={!deliveryFileUrl || submitting} className="w-full" size="sm">
        {submitting ? "Mengirim…" : "Submit & Set REVIEW"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Update `app/admin/orders/[id]/page.tsx` — replace Upload Deliverable card**

Find the "Upload Deliverable" `<Card>` (currently lines 96–115). Replace its `<CardContent>` with `<DeliverableForm>`. Add the import at the top.

Full file replacement:

```typescript
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { updateOrderStatusAction, setDeliverableAction } from "../actions";
import { DeliverableForm } from "./_deliverable-form";

export const metadata = { title: "Admin · Detail Order" };

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;

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
      <header>
        <h1 className="text-2xl font-bold">{order.service.title}</h1>
        <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Client" value={`${order.client.fullName} (${order.client.email})`} />
            <Row label="Total" value={formatIDR(order.totalAmount.toString())} />
            <Row label="Status" value={order.status} />
            <Row label="Due Date" value={order.dueDate ? new Date(order.dueDate).toLocaleString("id-ID") : "—"} />
            <div>
              <p className="mb-1 text-slate-500">Brief</p>
              <p className="whitespace-pre-wrap rounded-md bg-slate-50 p-3">{order.briefNotes ?? "—"}</p>
            </div>
            {order.briefFileUrl && (
              <div>
                <p className="mb-1 text-slate-500">File Brief</p>
                <a href={order.briefFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Lihat Lampiran
                </a>
              </div>
            )}
            {order.deliveryFileUrl && (
              <Row
                label="Deliverable"
                value={
                  <a href={order.deliveryFileUrl} target="_blank" className="text-emerald-600 hover:underline">
                    Download
                  </a>
                }
              />
            )}
            {order.review && (
              <div className="rounded-md bg-amber-50 p-3 text-sm">
                ⭐ {order.review.rating}/5 — {order.review.comment}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ubah Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={statusAction} className="flex gap-2">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button type="submit" size="sm">Update</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Deliverable</CardTitle>
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual test**
  1. Login as ADMIN, go to `/admin/orders/[id]` for any order
  2. Upload a file in "Upload Deliverable" card — verify "Mengupload…" → "✓ filename"
  3. Click "Submit & Set REVIEW" — verify toast success
  4. Verify order status changed to REVIEW (refresh page)
  5. Verify file URL appears in "Deliverable" row

- [ ] **Step 5: Commit**

```bash
git add "app/admin/orders/[id]/page.tsx" "app/admin/orders/[id]/_deliverable-form.tsx"
git commit -m "feat: add deliverable file upload in admin order detail"
```

---

### Task 6: Review Submission

**Files:**
- Modify: `lib/validations/order.ts`
- Create: `components/features/review-form.tsx`
- Modify: `app/dashboard/orders/[id]/page.tsx`

**Interfaces:**
- Produces:
  - `reviewSchema` from `lib/validations/order.ts`
  - `ReviewForm(props: { orderId: string, serviceId: string, action: (fd: FormData) => Promise<void> })` — client component
  - `submitReviewAction` inline server action in the order page

- [ ] **Step 1: Add `reviewSchema` to `lib/validations/order.ts`**

Append to the existing file (keep all existing exports):

```typescript
export const reviewSchema = z.object({
  orderId: z.string().uuid(),
  serviceId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
```

- [ ] **Step 2: Create `components/features/review-form.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReviewFormProps {
  orderId: string;
  serviceId: string;
  action: (formData: FormData) => Promise<void>;
}

export function ReviewForm({ orderId, serviceId, action }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pilih rating bintang terlebih dahulu");
      return;
    }
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));
    formData.set("orderId", orderId);
    formData.set("serviceId", serviceId);
    try {
      await action(formData);
      toast.success("Review berhasil dikirim!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim review");
      setSubmitting(false);
    }
  }

  const activeStars = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
              aria-label={`${star} bintang`}
            >
              <span
                className={`material-symbols-outlined text-3xl ${
                  activeStars >= star ? "icon-fill text-amber-400" : "text-slate-300"
                }`}
              >
                star
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="comment" className="text-sm font-medium text-slate-700">
          Komentar (opsional)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={500}
          placeholder="Bagaimana pengalaman Anda?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </div>

      <Button type="submit" disabled={submitting || rating === 0}>
        {submitting ? "Mengirim…" : "Kirim Review"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Replace `app/dashboard/orders/[id]/page.tsx`**

```typescript
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations/order";
import { ReviewForm } from "@/components/features/review-form";

export const metadata = { title: "Detail Pesanan" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const order = await prisma.order
    .findFirst({
      where: { id, clientId: userId },
      include: { service: true, review: true },
    })
    .catch(() => null);

  if (!order) notFound();

  async function submitReviewAction(formData: FormData) {
    "use server";
    const fresh = await auth();
    if (!fresh?.user) throw new Error("Tidak terautentikasi");

    const parsed = reviewSchema.safeParse({
      orderId: formData.get("orderId"),
      serviceId: formData.get("serviceId"),
      rating: formData.get("rating"),
      comment: formData.get("comment") || undefined,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const existing = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, clientId: fresh.user.id, status: "COMPLETED" },
      include: { review: true },
    });
    if (!existing) throw new Error("Pesanan tidak ditemukan atau belum selesai");
    if (existing.review) throw new Error("Review sudah pernah dikirim");

    await prisma.review.create({
      data: {
        orderId: parsed.data.orderId,
        clientId: fresh.user.id,
        serviceId: parsed.data.serviceId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    revalidatePath(`/dashboard/orders/${parsed.data.orderId}`);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{order.service.title}</h1>
        <p className="text-sm text-slate-500">
          Pesanan #{order.id.slice(0, 8)} · {order.status}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Total</span>
            <span className="font-semibold">{formatIDR(order.totalAmount.toString())}</span>
          </div>
          <div>
            <p className="mb-1 text-slate-500">Brief</p>
            <p className="whitespace-pre-wrap">{order.briefNotes ?? "—"}</p>
          </div>
          {order.briefFileUrl && (
            <div>
              <p className="mb-1 text-slate-500">File Brief</p>
              <a
                href={order.briefFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Lihat Lampiran
              </a>
            </div>
          )}
          {order.deliveryFileUrl && (
            <div>
              <p className="mb-1 text-slate-500">File Deliverable</p>
              <a
                href={order.deliveryFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download Hasil
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {order.status === "COMPLETED" && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent>
            {order.review ? (
              <div className="space-y-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined text-2xl ${
                        star <= order.review!.rating ? "icon-fill text-amber-400" : "text-slate-300"
                      }`}
                    >
                      star
                    </span>
                  ))}
                </div>
                {order.review.comment && (
                  <p className="text-sm text-slate-700">{order.review.comment}</p>
                )}
                <p className="text-xs text-slate-400">Review sudah dikirim — terima kasih!</p>
              </div>
            ) : (
              <ReviewForm
                orderId={order.id}
                serviceId={order.serviceId}
                action={submitReviewAction}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual test**
  1. In Prisma Studio or admin panel, set an order status to `COMPLETED`
  2. Login as the CLIENT who owns that order, go to `/dashboard/orders/[id]`
  3. Verify "Review" card appears with 5-star selector and textarea
  4. Hover stars — verify fill animation
  5. Select 4 stars, add comment, click "Kirim Review"
  6. Verify `toast.success` fires
  7. Verify card switches to read-only star display
  8. Refresh — verify review persists
  9. Verify submitting again is blocked (button gone, shows read-only)

- [ ] **Step 6: Commit**

```bash
git add lib/validations/order.ts components/features/review-form.tsx "app/dashboard/orders/[id]/page.tsx"
git commit -m "feat: add review submission for completed orders"
```

---

### Task 7: Chat Room Creation

**Files:**
- Create: `app/chat/new/page.tsx`
- Modify: `app/chat/page.tsx`

**Interfaces:**
- Consumes: `prisma.chatRoom.upsert` with unique constraint `clientId_adminId_serviceId`
- Produces: `/chat/new?serviceId=X` → upserts room → redirects to `/chat/[roomId]`

- [ ] **Step 1: Create `app/chat/new/page.tsx`**

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function NewChatPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { serviceId } = await searchParams;

  if (!serviceId) redirect("/services");

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/chat/new?serviceId=${encodeURIComponent(serviceId)}`);
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true },
  });
  if (!service) redirect("/services");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) redirect("/services?error=no_admin");

  const room = await prisma.chatRoom.upsert({
    where: {
      clientId_adminId_serviceId: {
        clientId: session.user.id,
        adminId: admin.id,
        serviceId: service.id,
      },
    },
    create: {
      clientId: session.user.id,
      adminId: admin.id,
      serviceId: service.id,
    },
    update: {},
  });

  redirect(`/chat/${room.id}`);
}
```

- [ ] **Step 2: Update `app/chat/page.tsx` — add service slug to query**

The current query already includes `service: { select: { title: true } }`. Add `slug: true` to that select so we can link back to service detail if needed. Also display service title more prominently in the list.

Full file replacement:

```typescript
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Chat" };

export default async function ChatListPage() {
  const session = await auth();
  const userId = session!.user.id;

  const rooms = await prisma.chatRoom
    .findMany({
      where: { OR: [{ clientId: userId }, { adminId: userId }] },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { title: true, slug: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })
    .catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Percakapan</h1>
        <Card>
          <CardHeader>
            <CardTitle>Ruang Chat Anda</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rooms.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="mb-3 text-sm text-slate-500">Belum ada percakapan.</p>
                <Link
                  href="/services"
                  className="text-sm font-medium text-[#004ac6] underline"
                >
                  Mulai dari halaman jasa
                </Link>
              </div>
            ) : (
              rooms.map((r) => (
                <Link
                  key={r.id}
                  href={`/chat/${r.id}`}
                  className="flex items-center justify-between border-b border-slate-200 px-6 py-3 last:border-0 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium">{r.service.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">
                      {r.messages[0]?.content ?? "Belum ada pesan"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual test**
  1. Go to any service detail page as logged-in CLIENT
  2. Click "Diskusi via Chat" button
  3. Verify redirect chain: `/chat/new?serviceId=X` → `/chat/[roomId]`
  4. Click "Diskusi via Chat" again on the same service — verify same room (no duplicate created)
  5. Go to `/chat` — verify room listed with service title and last message preview
  6. Test unauthenticated: log out, click "Diskusi via Chat" → verify redirect to `/login?callbackUrl=...`

- [ ] **Step 5: Commit**

```bash
git add app/chat/new/page.tsx app/chat/page.tsx
git commit -m "feat: add chat room creation from service detail page"
```

---

### Task 8: Search — Services Page + SearchBar Component

**Files:**
- Create: `components/features/search-bar.tsx`
- Modify: `app/services/page.tsx`
- Modify: `components/shared/navbar.tsx`

**Interfaces:**
- Produces:
  - `SearchBar` — client component, no props, reads/writes URL `?q=` param
  - `ServicesPage` accepts `searchParams: Promise<{ q?: string }>` and filters with Prisma `contains`

- [ ] **Step 1: Create `components/features/search-bar.tsx`**

```typescript
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(pathname === "/services" ? (searchParams.get("q") ?? "") : "");
  }, [pathname, searchParams]);

  function search() {
    const q = value.trim();
    router.push(q ? `/services?q=${encodeURIComponent(q)}` : "/services");
  }

  return (
    <div className="relative hidden w-64 md:flex lg:w-96">
      <button
        type="button"
        onClick={search}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#004ac6]"
        aria-label="Cari"
      >
        <span className="material-symbols-outlined">search</span>
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && search()}
        placeholder="Cari jasa..."
        className="w-full rounded-lg border border-[#c3c6d7] bg-[#f7f9fb] py-2 pl-10 pr-4 text-sm transition-all focus:border-[#004ac6] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/10"
      />
    </div>
  );
}
```

- [ ] **Step 2: Update `components/shared/navbar.tsx` — replace inline search with `<SearchBar>`**

`useSearchParams` requires the component to be wrapped in `<Suspense>`. `Navbar` stays server component.

```typescript
import Link from "next/link";
import { Suspense } from "react";
import { auth, signOut } from "@/auth";
import { SearchBar } from "@/components/features/search-bar";

export async function Navbar() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#c3c6d7] bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 md:px-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#004ac6]">
            MahaSewa
          </Link>
          <Suspense fallback={<div className="hidden w-64 md:block lg:w-96" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/services"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] transition-colors hover:bg-[#f2f4f6] hover:text-[#004ac6]"
          >
            Browse
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-medium text-[#191c1e] transition-colors hover:text-[#004ac6]"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-medium text-[#191c1e] transition-colors hover:text-[#004ac6]"
              >
                Dashboard
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-medium text-[#191c1e] transition-colors hover:text-[#004ac6]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger — wired in Task 9 */}
        <button className="md:hidden text-[#191c1e]" aria-label="Menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}
```

(The mobile button remains a stub — Task 9 will replace it with `<NavbarClient>` which includes the working drawer.)

- [ ] **Step 3: Update `app/services/page.tsx`**

```typescript
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ServiceCard } from "@/components/features/service-card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Jelajah Jasa",
  description: "Telusuri semua jasa digital aktif di MahaSewa.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const services = await prisma.service
    .findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, basePrice: true, imageUrls: true },
    })
    .catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10">
        {query ? (
          <h1 className="mb-6 text-3xl font-bold">
            &ldquo;{query}&rdquo; — {services.length} hasil ditemukan
          </h1>
        ) : (
          <h1 className="mb-6 text-3xl font-bold">Semua Jasa</h1>
        )}
        {services.length === 0 ? (
          <p className="text-slate-500">Tidak ada jasa yang cocok dengan pencarian.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const images = Array.isArray(s.imageUrls) ? (s.imageUrls as string[]) : [];
              return (
                <ServiceCard
                  key={s.id}
                  slug={s.slug}
                  title={s.title}
                  basePrice={s.basePrice.toString()}
                  imageUrl={images[0]}
                />
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
```

Note: `export const revalidate = 60` removed — pages using `searchParams` must be dynamic.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Manual test**
  1. `npm run dev`
  2. Type "logo" in navbar search → press Enter
  3. Verify URL is `/services?q=logo`, grid shows filtered results, header shows `"logo" — X hasil ditemukan`
  4. Clear input, Enter → URL becomes `/services`, all services shown
  5. On `/services?q=logo`, refresh page — search bar shows "logo" pre-filled

- [ ] **Step 6: Commit**

```bash
git add components/features/search-bar.tsx app/services/page.tsx components/shared/navbar.tsx
git commit -m "feat: add search with URL-based filtering on services page"
```

---

### Task 9: Mobile Menu

**Files:**
- Create: `components/shared/navbar-client.tsx`
- Modify: `components/shared/navbar.tsx`

**Interfaces:**
- Consumes: `Session | null` from next-auth, `signOutAction: () => Promise<void>` server action
- Produces:
  ```typescript
  export function NavbarClient(props: {
    session: Session | null
    signOutAction: () => Promise<void>
  }): JSX.Element
  ```

- [ ] **Step 1: Create `components/shared/navbar-client.tsx`**

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";

interface NavbarClientProps {
  session: Session | null;
  signOutAction: () => Promise<void>;
}

export function NavbarClient({ session, signOutAction }: NavbarClientProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden text-[#191c1e]"
        aria-label="Menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">
          {open ? "close" : "menu"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-16 z-40 w-full flex-col border-t border-[#c3c6d7] bg-white px-4 py-3 shadow-lg md:hidden flex">
          <Link
            href="/services"
            onClick={close}
            className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
          >
            Browse
          </Link>

          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                onClick={close}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="rounded-lg bg-[#2563eb] mx-3 my-1 px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Update `components/shared/navbar.tsx` — replace stub button with `<NavbarClient>`**

Add import and replace the mobile `<button>` stub (the last element before `</div>`):

```typescript
import { NavbarClient } from "@/components/shared/navbar-client";
```

Replace this at the bottom of the inner flex div (remove the stub button):
```tsx
{/* Replace: */}
<button className="md:hidden text-[#191c1e]" aria-label="Menu">
  <span className="material-symbols-outlined">menu</span>
</button>

{/* With: */}
<NavbarClient session={session} signOutAction={handleSignOut} />
```

`handleSignOut` is already defined as an inline server action in this file from Task 8.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

If error `Property 'role' does not exist on type 'User'`: this means next-auth's Session type doesn't include `role`. Check `auth.ts` — the callback should be injecting `role` into the token and session. If the type augmentation is missing, add to `auth.ts`:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CLIENT" | "ADMIN";
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Manual test (mobile viewport)**
  1. `npm run dev`, open DevTools → toggle device toolbar (mobile size)
  2. Desktop nav hidden, hamburger visible
  3. Click hamburger → drawer slides open with Browse, Dashboard, Keluar (if logged in)
  4. Click any link → drawer closes + navigation works
  5. Click X icon → drawer closes
  6. Resize to desktop → drawer hidden, desktop nav shown
  7. Test Keluar in mobile menu → signs out

- [ ] **Step 5: Commit**

```bash
git add components/shared/navbar-client.tsx components/shared/navbar.tsx
git commit -m "feat: add mobile menu with drawer to navbar"
```

---

### Task 10: Next.js Image Optimization

**Files:**
- Modify: `components/features/service-card.tsx`
- Modify: `components/features/service-gallery.tsx`

**Interfaces:**
- Consumes: `next.config.ts` remotePatterns from Task 2 (already done)
- Produces: All user-content images use `<Image>` from `next/image`

- [ ] **Step 1: Update `components/features/service-card.tsx`**

Add import, replace both `<img>` elements:

```typescript
import Link from "next/link";
import Image from "next/image";
import { formatIDR } from "@/lib/utils";

type ServiceCardProps = {
  slug: string;
  title: string;
  basePrice: string | number;
  imageUrl?: string | null;
  sellerName?: string;
  sellerAvatar?: string | null;
  rating?: number;
  ratingCount?: number;
};

export function ServiceCard({
  slug,
  title,
  basePrice,
  imageUrl,
  sellerName = "MahaSewa",
  sellerAvatar,
  rating = 5.0,
  ratingCount = 0,
}: ServiceCardProps) {
  return (
    <Link
      href={`/services/${slug}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[#c3c6d7] bg-white transition-shadow hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#e6e8ea]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#434655]">
            <span className="material-symbols-outlined text-5xl">image</span>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full bg-[#e0e3e5]">
            {sellerAvatar && (
              <Image
                src={sellerAvatar}
                alt={sellerName}
                fill
                className="object-cover"
                sizes="24px"
              />
            )}
          </div>
          <span className="text-xs font-medium text-[#434655]">{sellerName}</span>
        </div>

        <h3 className="mb-2 line-clamp-2 flex-grow text-base text-[#191c1e] transition-colors group-hover:text-[#004ac6]">
          {title}
        </h3>

        <div className="mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined icon-fill text-sm text-[#bc4800]">star</span>
          <span className="text-xs font-bold text-[#191c1e]">{rating.toFixed(1)}</span>
          <span className="text-xs text-[#434655]">({ratingCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#c3c6d7] pt-3">
          <span className="material-symbols-outlined cursor-pointer text-[#434655] transition-colors hover:text-[#004ac6]">
            favorite
          </span>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#434655]">Mulai dari</span>
            <div className="text-lg font-semibold text-[#191c1e]">{formatIDR(basePrice)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Update `components/features/service-gallery.tsx`**

```typescript
"use client";

import { useState } from "react";
import Image from "next/image";

export function ServiceGallery({ images, title }: { images: string[]; title: string }) {
  const fallback = "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200";
  const list = images.length > 0 ? images : [fallback];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#c3c6d7] bg-white">
        <Image
          src={list[active]}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 70vw"
          priority={active === 0}
        />
      </div>

      {list.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-lg transition-opacity ${
                i === active
                  ? "border-2 border-[#004ac6]"
                  : "border border-[#c3c6d7] opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript + build**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean build. If `hostname not configured` error for any image URL: add that hostname to `next.config.ts` remotePatterns.

- [ ] **Step 4: Manual test**
  1. Go to `/services` — cards render images via Next.js Image (check Network tab, images from `/_next/image?url=...`)
  2. Go to service detail — gallery main image and thumbnails load correctly
  3. Click thumbnails — active image switches
  4. No console errors about `<img>` or domain not allowed

- [ ] **Step 5: Commit**

```bash
git add components/features/service-card.tsx components/features/service-gallery.tsx
git commit -m "feat: replace img tags with next/image for cdn optimization"
```

---

## File Map Summary

| File | Task | Status |
|------|------|--------|
| `prisma/schema.prisma` | 1 | Modified |
| `.env` | 1 | Modified — **do not commit** |
| `package.json` | 1 | Modified |
| `lib/supabase.ts` | 2 | **New** |
| `next.config.ts` | 2 | Modified |
| `app/layout.tsx` | 2 | Modified |
| `components/features/file-upload.tsx` | 3 | **New** |
| `app/checkout/[slug]/_checkout-form.tsx` | 4 | **New** |
| `app/checkout/[slug]/page.tsx` | 4 | Modified |
| `app/admin/orders/[id]/_deliverable-form.tsx` | 5 | **New** |
| `app/admin/orders/[id]/page.tsx` | 5 | Modified |
| `lib/validations/order.ts` | 6 | Modified |
| `components/features/review-form.tsx` | 6 | **New** |
| `app/dashboard/orders/[id]/page.tsx` | 6 | Modified |
| `app/chat/new/page.tsx` | 7 | **New** |
| `app/chat/page.tsx` | 7 | Modified |
| `components/features/search-bar.tsx` | 8 | **New** |
| `app/services/page.tsx` | 8 | Modified |
| `components/shared/navbar.tsx` | 8 + 9 | Modified |
| `components/shared/navbar-client.tsx` | 9 | **New** |
| `components/features/service-card.tsx` | 10 | Modified |
| `components/features/service-gallery.tsx` | 10 | Modified |

**New files:** 8 | **Modified files:** 14 | **Total tasks:** 10 | **Total commits:** 10
