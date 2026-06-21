# Partner CRUD — Design Spec

**Date:** 2026-06-21  
**Status:** Approved

## Summary

Fitur Partner memungkinkan admin mengelola daftar partner/freelancer yang ditampilkan di halaman detail layanan berdasarkan kecocokan kategori.

---

## 1. Database Schema

Tambah model `Partner` di `prisma/schema.prisma`:

```prisma
model Partner {
  id         String    @id @default(uuid())
  name       String
  photoUrl   String
  skills     String[]
  isActive   Boolean   @default(true)
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt  DateTime  @default(now())

  @@map("partners")
}
```

Tambah relasi balik di model `Category`:

```prisma
partners Partner[]
```

- Foto disimpan di Supabase Storage bucket `partner-photos` (pola sama dengan ServiceForm).
- `categoryId` nullable — partner tanpa kategori tidak tampil di manapun.
- `skills` adalah `String[]` — array teks bebas (tag custom).
- Setelah edit schema, jalankan `npx prisma migrate dev`.

---

## 2. Admin CRUD

### File Structure

```
app/admin/partners/
├── page.tsx          # List semua partner
├── new/page.tsx      # Form tambah partner
├── [id]/page.tsx     # Form edit partner
├── _form.tsx         # PartnerForm (shared)
└── actions.ts        # Server Actions
```

### Admin List (`/admin/partners`)

Tabel kolom: Foto (avatar 40px) | Nama | Kategori | Skills (badge) | Status | Aksi (Edit / Toggle / Delete).

### PartnerForm Fields

| Field | Type | Keterangan |
|---|---|---|
| `name` | text input | Nama partner |
| `photo` | file input | Upload ke Supabase `partner-photos` |
| `categoryId` | select | Dropdown dari `category.findMany({ where: { isActive: true } })` |
| `skills` | tag input | Ketik + Enter/comma → array string |
| `isActive` | toggle | Default true |

### Server Actions (`actions.ts`)

Semua diawali `requireAdmin()`.

- `createPartner(formData)` — upload foto, insert Partner
- `updatePartner(id, formData)` — replace foto jika ada file baru, update Partner
- `deletePartner(id)` — hapus foto dari Supabase, delete Partner
- `togglePartnerActive(id)` — flip `isActive`

### Sidebar Nav

Tambah item "Partners" di `components/shared/AdminSidebar` (antara Categories dan Services atau setelah Services).

---

## 3. Tampilan di Halaman Detail Layanan

**File:** `app/services/[slug]/page.tsx`

Query tambahan setelah fetch service:

```ts
const partners = service.categoryId
  ? await prisma.partner.findMany({
      where: { categoryId: service.categoryId, isActive: true },
      take: 6,
    })
  : []
```

### Komponen Baru: `components/features/PartnerCard.tsx`

Props: `{ name: string, photoUrl: string, skills: string[] }`

Layout card:
- Foto bulat (avatar 80px)
- Nama partner (bold)
- Skills sebagai badge/chip (max tampil 3, sisanya "+N more")

### Section di Halaman Detail

- Judul: **"Tim Partner Kami"**
- Grid 2–3 kolom responsif
- Posisi: di bawah deskripsi layanan, di atas section reviews
- Hanya render jika `partners.length > 0`

---

## 4. Constraints & Rules

- Max 6 partner tampil per layanan (ordered by `createdAt DESC`)
- Section partner tidak tampil jika tidak ada partner aktif di kategori layanan
- Foto wajib diisi saat create; saat edit, foto lama dipertahankan jika tidak ada file baru
- `requireAdmin()` wajib di semua Server Actions partner

---

## 5. Out of Scope (MVP)

- Tombol "Chat dengan Partner" dari card
- Partner bisa lintas kategori (many-to-many)
- Halaman publik profil partner
