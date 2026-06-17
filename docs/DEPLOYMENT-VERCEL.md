# Deploy ke Vercel

Panduan deploy MahaSewa (Next.js 16 + Prisma 7 + Supabase) ke [Vercel](https://vercel.com).

---

## Prasyarat

- Akun [Vercel](https://vercel.com) (Hobby gratis, Pro untuk team/custom domain penuh)
- Repo sudah di GitHub / GitLab / Bitbucket
- Supabase project sudah dibuat dan kredensial tersedia

---

## 1. Persiapan Kode (Wajib Sebelum Push)

### A. Hapus `output: "standalone"` dari `next.config.ts`

`standalone` hanya untuk Docker. Vercel punya build system sendiri — opsi ini bisa menyebabkan masalah di Vercel.

```ts
// next.config.ts — SEBELUM
const nextConfig: NextConfig = {
  output: "standalone",   // ← hapus baris ini
  images: { ... },
};

// SESUDAH
const nextConfig: NextConfig = {
  images: { ... },
};
```

### B. Tambah `postinstall` di `package.json`

Vercel jalankan `npm install` → `postinstall` otomatis → Prisma client ter-generate sebelum build.

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "postinstall": "prisma generate",
  ...
}
```

### C. Commit + Push

```bash
git add next.config.ts package.json
git commit -m "chore: prepare for vercel deploy"
git push
```

---

## 2. Import Project ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Pilih **Import Git Repository** → pilih repo `mahasewa`
3. Framework: Vercel otomatis deteksi **Next.js** → biarkan default
4. **Root Directory**: biarkan kosong (root repo)
5. **Build Command**: biarkan default (`npm run build` → otomatis jalankan `postinstall` dulu)
6. **Output Directory**: biarkan default (`.next`)
7. Jangan klik Deploy dulu — isi env var dulu (langkah 3)

---

## 3. Environment Variables

Di tab **Environment Variables** sebelum deploy pertama, isi semua variabel berikut:

| Variable | Value | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` | **Transaction Pooler** — wajib untuk serverless |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres` | Session Pooler — untuk `db:push` manual |
| `AUTH_SECRET` | hasil `openssl rand -base64 32` | Generate baru, jangan pakai nilai dev |
| `AUTH_URL` | `https://namadomain.vercel.app` | URL produksi (update jika pakai custom domain) |
| `AUTH_TRUST_HOST` | `true` | Wajib — Vercel pakai proxy/reverse proxy |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | Di-embed ke bundle browser saat build |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Di-embed ke bundle browser saat build |

> ⚠️ **`NEXT_PUBLIC_*` di-bake saat build.** Jika nilainya berubah, wajib redeploy (bukan cukup restart).

> ⚠️ **`DATABASE_URL` wajib pakai Transaction Pooler (port 6543).** Vercel functions bersifat serverless — ribuan koneksi bisa terbuka bersamaan. Tanpa pooler, Supabase akan kehabisan koneksi.

### Generate `AUTH_SECRET`

```bash
openssl rand -base64 32
```

---

## 4. Deploy

Klik **Deploy**. Vercel akan:

1. `npm install` → `postinstall` → `prisma generate` (buat Prisma client)
2. `next build` (compile, optimize, bundle)
3. Deploy ke edge network

Durasi build pertama: ~2–3 menit.

---

## 5. Setup Database (Satu Kali)

Schema belum ada di Supabase prod. Jalankan dari lokal dengan `DIRECT_URL` yang mengarah ke Supabase:

```bash
# Pastikan .env sudah berisi DIRECT_URL yang benar
npm run db:push
```

Atau jalankan migrasi jika sudah ada di `prisma/migrations/`:

```bash
npx prisma migrate deploy
```

Untuk seed data awal (opsional):

```bash
npm run db:seed
```

---

## 6. Custom Domain (Opsional)

1. Vercel Dashboard → Project → **Settings → Domains**
2. Tambah domain → ikuti instruksi DNS (CNAME atau A record)
3. Update env var `AUTH_URL` ke domain baru:
   - Settings → Environment Variables → edit `AUTH_URL` → `https://mahasewa.com`
4. **Redeploy** agar `AUTH_URL` yang baru masuk ke build.

---

## 7. Supabase Storage — Policy

Setelah bucket `uploads` dibuat di Supabase Dashboard (Storage → New bucket, aktifkan **Public**), jalankan SQL ini di **Supabase SQL Editor**:

```sql
-- Allow browser upload langsung ke bucket uploads
CREATE POLICY "allow_anon_insert"
ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'uploads');
```

Tanpa policy ini, upload file dari browser akan gagal dengan error 403.

---

## 8. Checklist Sebelum Go Live

- [ ] `output: "standalone"` sudah dihapus dari `next.config.ts`
- [ ] `"postinstall": "prisma generate"` ada di `package.json`
- [ ] Semua 7 env var terisi di Vercel Dashboard
- [ ] `AUTH_SECRET` baru (bukan nilai development)
- [ ] `AUTH_URL` = URL produksi yang benar
- [ ] `DATABASE_URL` = Transaction Pooler port **6543** + `?pgbouncer=true`
- [ ] `db:push` atau `migrate deploy` sudah dijalankan ke Supabase
- [ ] Bucket `uploads` dibuat + policy SQL dijalankan
- [ ] Test login, order, upload, review di domain produksi

---

## 9. Troubleshooting

| Gejala | Penyebab / Fix |
|--------|----------------|
| Build error: `Cannot find module '@/app/generated/prisma'` | `postinstall` belum ada di `package.json`, atau belum di-commit |
| `PrismaClientInitializationError` di runtime | `DATABASE_URL` salah atau belum di-set di Vercel |
| Login redirect loop | `AUTH_URL` salah atau belum di-set. Pastikan sesuai domain aktif |
| `CSRF token mismatch` / auth error | `AUTH_TRUST_HOST` belum `true` |
| Upload gagal 403 | Storage policy belum dibuat di Supabase |
| Gambar tidak muncul | `NEXT_PUBLIC_SUPABASE_URL` salah, atau hostname belum ada di `next.config.ts` |
| `Too many connections` error | `DATABASE_URL` masih pakai port 5432 (direct) — ganti ke 6543 (pooler) |
| Env `NEXT_PUBLIC_*` masih nilai lama | Nilai di-embed saat build — wajib redeploy setelah ubah |
| `migrate deploy` gagal | Gunakan `DIRECT_URL` (Session Pooler port 5432), bukan Transaction Pooler |

---

## Perbedaan vs Deploy Docker/Dokploy

| Aspek | Vercel | Docker/Dokploy |
|-------|--------|----------------|
| Build | Otomatis di Vercel CI | Manual / git webhook |
| Runtime | Serverless functions | Container always-on |
| `output: "standalone"` | **Tidak** dipakai | **Wajib** |
| Migrasi DB | Manual (`db:push` dari lokal) | Otomatis via entrypoint |
| Cold start | Ada (serverless) | Tidak ada |
| Koneksi DB | Wajib pooler (6543) | Bisa direct (5432) |
| Custom domain | Built-in + auto HTTPS | Via Traefik di Dokploy |
