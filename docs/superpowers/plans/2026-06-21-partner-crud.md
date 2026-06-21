# Partner CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bangun CRUD Partner untuk admin + tampilan partner di halaman detail layanan berdasarkan kecocokan kategori.

**Architecture:** Model `Partner` baru di Prisma dengan FK ke `Category` dan array `skills String[]`. Admin CRUD mengikuti pola existing (`_form.tsx` + `actions.ts` + list/new/[id] pages). Halaman detail layanan query partner aktif yang categoryId-nya cocok dan render via komponen `PartnerCard`.

**Tech Stack:** Next.js 15 App Router, Prisma + PostgreSQL, NextAuth (server session), Supabase Storage (foto), shadcn/ui, Tailwind CSS, TypeScript.

## Global Constraints

- Semua admin Server Actions diawali `requireAdmin()` dari `lib/admin-guard.ts`
- UUID primary keys: `@id @default(uuid()) @db.Uuid`
- Params di page component: `params: Promise<{ id: string }>` → `await params`
- Shadcn components dari `components/ui/` (Card, Input, Label, Button, Select)
- Active state badge: `bg-emerald-100 text-emerald-700`, inactive: `bg-slate-100 text-slate-600`
- Redirect setelah create/update ke `/admin/partners`
- Revalidate `/admin/partners` dan `/services` setelah mutasi

---

## File Map

**Baru:**
- `prisma/schema.prisma` — tambah model Partner + relasi Category
- `lib/upload.ts` — helper upload foto ke Supabase Storage
- `components/features/SkillTagInput.tsx` — client component tag input untuk skills
- `app/admin/partners/actions.ts` — Server Actions (create, update, delete, toggle)
- `app/admin/partners/_form.tsx` — PartnerForm shared component
- `app/admin/partners/page.tsx` — admin list
- `app/admin/partners/new/page.tsx` — admin create
- `app/admin/partners/[id]/page.tsx` — admin edit
- `components/features/PartnerCard.tsx` — public card component

**Dimodifikasi:**
- `components/shared/admin-sidebar.tsx` — tambah nav item Partners
- `app/services/[slug]/page.tsx` — tambah query partner + render section

---

## Task 1: Prisma Schema — Tambah Model Partner

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Partner` model dengan fields `id, name, photoUrl, skills, isActive, categoryId, createdAt`

- [ ] **Step 1: Edit `prisma/schema.prisma`**

Tambah di akhir file (setelah model Review):

```prisma
model Partner {
  id         String    @id @default(uuid()) @db.Uuid
  name       String
  photoUrl   String
  skills     String[]
  isActive   Boolean   @default(true)
  categoryId String?   @db.Uuid
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt  DateTime  @default(now())

  @@map("partners")
}
```

Tambah relasi balik di model `Category` (cari `model Category {`, tambah setelah field `services`):

```prisma
  partners Partner[]
```

- [ ] **Step 2: Jalankan migrasi**

```bash
npx prisma migrate dev --name add_partner_model
```

Expected output:
```
✔ Generated Prisma Client
The following migration(s) have been created and applied from new schema changes:
migrations/..._add_partner_model/migration.sql
```

- [ ] **Step 3: Verify Prisma Client ter-generate**

```bash
npx prisma studio
```

Buka browser → pastikan table `partners` muncul di Prisma Studio. Tutup setelah verify.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Partner model to prisma schema"
```

---

## Task 2: Upload Helper untuk Supabase Storage

**Files:**
- Create: `lib/upload.ts`

**Interfaces:**
- Produces: `uploadPhoto(file: File, bucket: string): Promise<string>` — returns public URL

- [ ] **Step 1: Buat Supabase bucket `partner-photos`**

Buka Supabase dashboard → Storage → New bucket:
- Name: `partner-photos`
- Public: ✓ (centang Public bucket)

- [ ] **Step 2: Buat `lib/upload.ts`**

```typescript
import { supabase } from "@/lib/supabase"

export async function uploadPhoto(file: File, bucket: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg"
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload gagal: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function deletePhoto(url: string, bucket: string): Promise<void> {
  const filename = url.split("/").pop()
  if (!filename) return
  await supabase.storage.from(bucket).remove([filename])
}
```

- [ ] **Step 3: Verify file tersimpan**

```bash
npx tsc --noEmit
```

Expected: no errors di `lib/upload.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/upload.ts
git commit -m "feat: add supabase photo upload/delete helpers"
```

---

## Task 3: SkillTagInput Component

**Files:**
- Create: `components/features/SkillTagInput.tsx`

**Interfaces:**
- Produces: `<SkillTagInput name="skills" defaultValue={string[]} />` — renders tag UI + hidden input dengan nilai `skills` sebagai JSON array string

- [ ] **Step 1: Buat `components/features/SkillTagInput.tsx`**

```typescript
"use client"

import { KeyboardEvent, useState } from "react"
import { Input } from "@/components/ui/input"

interface Props {
  name: string
  defaultValue?: string[]
}

export function SkillTagInput({ name, defaultValue = [] }: Props) {
  const [tags, setTags] = useState<string[]>(defaultValue)
  const [inputValue, setInputValue] = useState("")

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInputValue("")
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Backspace" && !inputValue) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md bg-white">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          placeholder={tags.length === 0 ? "Ketik skill lalu Enter..." : ""}
          className="border-0 shadow-none focus-visible:ring-0 h-auto p-0 flex-1 min-w-32 text-sm"
        />
      </div>
      <p className="text-xs text-slate-400">Tekan Enter atau koma untuk menambah skill</p>
    </div>
  )
}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/features/SkillTagInput.tsx
git commit -m "feat: add SkillTagInput client component"
```

---

## Task 4: Server Actions Partner

**Files:**
- Create: `app/admin/partners/actions.ts`

**Interfaces:**
- Consumes: `uploadPhoto(file, bucket)` dari `lib/upload.ts`, `deletePhoto(url, bucket)` dari `lib/upload.ts`, `requireAdmin()` dari `lib/admin-guard.ts`
- Produces: `createPartnerAction(formData)`, `updatePartnerAction(id, formData)`, `deletePartnerAction(id)`, `togglePartnerAction(id)`

- [ ] **Step 1: Buat `app/admin/partners/actions.ts`**

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { uploadPhoto, deletePhoto } from "@/lib/upload"

const BUCKET = "partner-photos"

function parseSkills(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

export async function createPartnerAction(formData: FormData) {
  await requireAdmin()

  const name = formData.get("name")?.toString().trim()
  const categoryId = formData.get("categoryId")?.toString() || null
  const skills = parseSkills(formData.get("skills")?.toString() ?? null)
  const photoFile = formData.get("photo") as File | null

  if (!name) throw new Error("Nama wajib diisi")
  if (!photoFile || photoFile.size === 0) throw new Error("Foto wajib diupload")

  const photoUrl = await uploadPhoto(photoFile, BUCKET)

  await prisma.partner.create({
    data: { name, photoUrl, skills, categoryId },
  })

  revalidatePath("/admin/partners")
  revalidatePath("/services", "layout")
  redirect("/admin/partners")
}

export async function updatePartnerAction(id: string, formData: FormData) {
  await requireAdmin()

  const name = formData.get("name")?.toString().trim()
  const categoryId = formData.get("categoryId")?.toString() || null
  const skills = parseSkills(formData.get("skills")?.toString() ?? null)
  const photoFile = formData.get("photo") as File | null

  if (!name) throw new Error("Nama wajib diisi")

  const existing = await prisma.partner.findUnique({ where: { id } })
  if (!existing) throw new Error("Partner tidak ditemukan")

  let photoUrl = existing.photoUrl
  if (photoFile && photoFile.size > 0) {
    await deletePhoto(existing.photoUrl, BUCKET)
    photoUrl = await uploadPhoto(photoFile, BUCKET)
  }

  await prisma.partner.update({
    where: { id },
    data: { name, photoUrl, skills, categoryId },
  })

  revalidatePath("/admin/partners")
  revalidatePath("/services", "layout")
  redirect("/admin/partners")
}

export async function deletePartnerAction(id: string) {
  await requireAdmin()

  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) return

  await deletePhoto(partner.photoUrl, BUCKET)
  await prisma.partner.delete({ where: { id } })

  revalidatePath("/admin/partners")
  revalidatePath("/services", "layout")
}

export async function togglePartnerAction(id: string) {
  await requireAdmin()

  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) return

  await prisma.partner.update({
    where: { id },
    data: { isActive: !partner.isActive },
  })

  revalidatePath("/admin/partners")
}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/partners/actions.ts
git commit -m "feat: add partner server actions (create, update, delete, toggle)"
```

---

## Task 5: PartnerForm Component

**Files:**
- Create: `app/admin/partners/_form.tsx`

**Interfaces:**
- Consumes: `SkillTagInput` dari `components/features/SkillTagInput`, categories array `{ id: string, name: string }[]`
- Produces: `<PartnerForm action={fn} defaults={PartnerFormDefaults} submitLabel="..." categories={[]} />`

```typescript
export type PartnerFormDefaults = {
  name?: string
  photoUrl?: string
  skills?: string[]
  categoryId?: string | null
  isActive?: boolean
}
```

- [ ] **Step 1: Buat `app/admin/partners/_form.tsx`**

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SkillTagInput } from "@/components/features/SkillTagInput"

export type PartnerFormDefaults = {
  name?: string
  photoUrl?: string
  skills?: string[]
  categoryId?: string | null
  isActive?: boolean
}

type CategoryOption = { id: string; name: string }

interface Props {
  action: (formData: FormData) => Promise<void>
  defaults?: PartnerFormDefaults
  submitLabel?: string
  categories: CategoryOption[]
}

export function PartnerForm({
  action,
  defaults = {},
  submitLabel = "Simpan",
  categories,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Data Partner</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Partner</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaults.name ?? ""}
              placeholder="Contoh: Andi Pratama"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="photo">Foto</Label>
            {defaults.photoUrl && (
              <div className="mb-2">
                <img
                  src={defaults.photoUrl}
                  alt="Foto saat ini"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Foto saat ini. Upload baru untuk mengganti.
                </p>
              </div>
            )}
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              required={!defaults.photoUrl}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={defaults.categoryId ?? ""}
              className="w-full h-10 px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">— Pilih Kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Skills / Keahlian</Label>
            <SkillTagInput name="skills" defaultValue={defaults.skills ?? []} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={defaults.isActive ?? true}
              className="h-4 w-4 accent-emerald-600"
            />
            <Label htmlFor="isActive">Partner Aktif</Label>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/partners/_form.tsx
git commit -m "feat: add PartnerForm shared component"
```

---

## Task 6: Admin List Page

**Files:**
- Create: `app/admin/partners/page.tsx`

**Interfaces:**
- Consumes: `deletePartnerAction`, `togglePartnerAction` dari `actions.ts`
- Consumes: `requireAdmin()` dari `lib/admin-guard`

- [ ] **Step 1: Buat `app/admin/partners/page.tsx`**

```typescript
import Link from "next/link"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { deletePartnerAction, togglePartnerAction } from "./actions"

export default async function PartnersPage() {
  await requireAdmin()

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Partners</h1>
          <p className="text-sm text-slate-500">{partners.length} partner terdaftar</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/admin/partners/new">+ Tambah Partner</Link>
        </Button>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium">Belum ada partner</p>
          <p className="text-sm mt-1">Tambah partner pertama Anda</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Partner</th>
                <th className="px-4 py-3 text-left font-medium">Kategori</th>
                <th className="px-4 py-3 text-left font-medium">Skills</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Aksi</th>
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
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.category?.name ?? <span className="text-slate-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs"
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
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/partners/${p.id}`}
                        className="text-xs text-slate-600 hover:text-emerald-600 underline"
                      >
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server"
                          await togglePartnerAction(p.id)
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-slate-600 hover:text-amber-600 underline"
                        >
                          {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server"
                          await deletePartnerAction(p.id)
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-red-500 hover:text-red-700 underline"
                          onClick={(e) => {
                            if (!confirm(`Hapus partner "${p.name}"?`)) e.preventDefault()
                          }}
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/partners/page.tsx
git commit -m "feat: add admin partners list page"
```

---

## Task 7: Admin Create Page

**Files:**
- Create: `app/admin/partners/new/page.tsx`

**Interfaces:**
- Consumes: `PartnerForm` dari `../_form.tsx`, `createPartnerAction` dari `../actions.ts`

- [ ] **Step 1: Buat `app/admin/partners/new/page.tsx`**

```typescript
import Link from "next/link"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { PartnerForm } from "../_form"
import { createPartnerAction } from "../actions"

export default async function NewPartnerPage() {
  await requireAdmin()

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/partners" className="hover:text-slate-700">
          Partners
        </Link>
        <span>/</span>
        <span>Tambah Partner</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Tambah Partner</h1>

      <PartnerForm
        action={createPartnerAction}
        submitLabel="Tambah Partner"
        categories={categories}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/partners/new/page.tsx
git commit -m "feat: add admin create partner page"
```

---

## Task 8: Admin Edit Page

**Files:**
- Create: `app/admin/partners/[id]/page.tsx`

**Interfaces:**
- Consumes: `PartnerForm` dari `../_form.tsx`, `updatePartnerAction`, `deletePartnerAction` dari `../actions.ts`

- [ ] **Step 1: Buat `app/admin/partners/[id]/page.tsx`**

```typescript
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { PartnerForm } from "../_form"
import { updatePartnerAction, deletePartnerAction } from "../actions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPartnerPage({ params }: Props) {
  await requireAdmin()

  const { id } = await params
  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) notFound()

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const updateAction = updatePartnerAction.bind(null, id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/partners" className="hover:text-slate-700">
          Partners
        </Link>
        <span>/</span>
        <span>{partner.name}</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Edit Partner</h1>

      <PartnerForm
        action={updateAction}
        defaults={{
          name: partner.name,
          photoUrl: partner.photoUrl,
          skills: partner.skills,
          categoryId: partner.categoryId,
          isActive: partner.isActive,
        }}
        submitLabel="Simpan Perubahan"
        categories={categories}
      />

      <div className="border border-red-200 rounded-lg p-4 space-y-3 bg-red-50">
        <p className="text-sm font-medium text-red-700">Zona Berbahaya</p>
        <p className="text-xs text-red-600">Hapus partner ini secara permanen. Foto juga akan dihapus dari storage.</p>
        <form
          action={async () => {
            "use server"
            await deletePartnerAction(id)
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            onClick={(e) => {
              if (!confirm(`Hapus partner "${partner.name}"? Tindakan ini tidak bisa dibatalkan.`))
                e.preventDefault()
            }}
          >
            Hapus Partner
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/partners/[id]/page.tsx
git commit -m "feat: add admin edit partner page"
```

---

## Task 9: Tambah Partners ke Admin Sidebar

**Files:**
- Modify: `components/shared/admin-sidebar.tsx`

**Interfaces:**
- Produces: nav item `{ href: "/admin/partners", label: "Partners" }` di array NAV

- [ ] **Step 1: Edit `components/shared/admin-sidebar.tsx`**

Cari array `NAV` di file tersebut. Tambah item Partners setelah Categories (atau setelah Services, sesuai urutan logis):

```typescript
{ href: "/admin/partners", label: "Partners" },
```

Contoh array NAV setelah edit:
```typescript
const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/categories", label: "Kategori" },
  { href: "/admin/services", label: "Layanan" },
  { href: "/admin/partners", label: "Partners" },   // ← tambah ini
  { href: "/admin/orders", label: "Pesanan" },
  { href: "/admin/users", label: "Pengguna" },
  { href: "/admin/chat", label: "Chat Inbox" },
]
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/admin-sidebar.tsx
git commit -m "feat: add Partners nav item to admin sidebar"
```

---

## Task 10: PartnerCard Component

**Files:**
- Create: `components/features/PartnerCard.tsx`

**Interfaces:**
- Produces: `<PartnerCard name={string} photoUrl={string} skills={string[]} />` — card dengan foto bulat, nama, dan skill badges

- [ ] **Step 1: Buat `components/features/PartnerCard.tsx`**

```typescript
interface Props {
  name: string
  photoUrl: string
  skills: string[]
}

export function PartnerCard({ name, photoUrl, skills }: Props) {
  const displaySkills = skills.slice(0, 3)
  const remaining = skills.length - displaySkills.length

  return (
    <div className="flex flex-col items-center text-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <img
        src={photoUrl}
        alt={name}
        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-100 mb-3"
      />
      <p className="font-semibold text-slate-800 text-sm">{name}</p>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {displaySkills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs"
          >
            {skill}
          </span>
        ))}
        {remaining > 0 && (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs">
            +{remaining} lainnya
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/features/PartnerCard.tsx
git commit -m "feat: add PartnerCard component"
```

---

## Task 11: Integrasi di Halaman Detail Layanan

**Files:**
- Modify: `app/services/[slug]/page.tsx`

**Interfaces:**
- Consumes: `PartnerCard` dari `components/features/PartnerCard`
- Consumes: `prisma.partner.findMany({ where: { categoryId, isActive: true }, take: 6 })`

- [ ] **Step 1: Edit `app/services/[slug]/page.tsx`**

Tambah import di bagian atas file:

```typescript
import { PartnerCard } from "@/components/features/PartnerCard"
```

Di fungsi `getService` atau langsung di `Page` component, tambah query partner setelah fetch service:

```typescript
// Setelah baris: const service = await prisma.service.findUnique(...)
const partners = service?.categoryId
  ? await prisma.partner.findMany({
      where: { categoryId: service.categoryId, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
  : []
```

Tambah section partner di JSX — letakkan di bawah section deskripsi layanan, di atas section reviews. Cari pola `{/* reviews */}` atau elemen yang merender reviews, lalu sisipkan sebelumnya:

```tsx
{partners.length > 0 && (
  <section className="mt-10">
    <h2 className="text-xl font-bold text-slate-800 mb-4">Tim Partner Kami</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {partners.map((partner) => (
        <PartnerCard
          key={partner.id}
          name={partner.name}
          photoUrl={partner.photoUrl}
          skills={partner.skills}
        />
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 2: Verify tipe**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: Build succeeded, no type errors.

- [ ] **Step 4: Manual verify**

1. Buka `/admin/partners` → pastikan tabel muncul (kosong)
2. Klik "+ Tambah Partner" → isi form, upload foto, pilih kategori, tambah skills → submit
3. Cek list → partner muncul dengan foto, kategori, skill badges
4. Klik Edit → ubah nama/skills → simpan → cek perubahan di list
5. Nonaktifkan partner → status berubah
6. Buka `/services/[slug]` untuk layanan dengan kategori yang sama → section "Tim Partner Kami" muncul
7. Buka layanan dengan kategori berbeda → section tidak muncul
8. Hapus partner → hilang dari list dan foto terhapus di Supabase Storage

- [ ] **Step 5: Commit**

```bash
git add app/services/[slug]/page.tsx
git commit -m "feat: show matching partners on service detail page"
```
