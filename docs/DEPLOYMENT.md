# 🚀 Deployment — Docker + Dokploy

Panduan deploy MahaSewa (Next.js 16 + Prisma 7 + PostgreSQL) menggunakan Docker ke
[Dokploy](https://dokploy.com).

---

## 1. Arsitektur Build

| File | Fungsi |
|------|--------|
| `Dockerfile` | Multi-stage build → Next.js **standalone** image (kecil, prod-ready) |
| `docker-entrypoint.sh` | Jalankan `prisma migrate deploy` lalu start server |
| `.dockerignore` | Kecualikan `node_modules`, `.next`, `.env`, dll dari context |
| `docker-compose.yml` | Untuk Dokploy "Compose" deploy & test lokal |
| `.env.example` | Daftar env var yang dibutuhkan |

**Catatan penting:**
- `next.config.ts` sudah di-set `output: "standalone"`.
- Prisma client digenerate ke `app/generated/prisma` (di-`.gitignore`), jadi
  `npx prisma generate` **dijalankan saat build** di dalam Dockerfile.
- Adapter `PrismaPg` (driver `pg`) dipakai → tidak butuh Prisma query engine binary
  saat runtime. `migrate deploy` tetap butuh `openssl` (sudah di-install di image).

---

## 2. Environment Variables

Wajib di-set (lihat `.env.example`):

| Var | Keterangan |
|-----|-----------|
| `DATABASE_URL` | Koneksi runtime. Supabase → **pooler 6543** (`?pgbouncer=true`) |
| `DIRECT_URL` | Koneksi migrasi. Supabase → **direct 5432** |
| `AUTH_SECRET` | NextAuth v5. Generate: `openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | `true` (wajib di belakang proxy/Traefik) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase |
| `RUN_MIGRATIONS` | `true` (default). `false` untuk skip migrasi saat start |

> ⚠️ `NEXT_PUBLIC_*` di-embed ke bundle browser saat **build**. Kalau berubah,
> wajib rebuild image.

---

## 3. Test Lokal (sebelum push ke Dokploy)

```bash
# 1. Siapkan env
cp .env.example .env        # isi nilainya

# 2. Build + run
docker compose up --build

# 3. Buka
# http://localhost:3888  (uncomment `ports` di docker-compose.yml dulu)
```

Build sekali jalan tanpa compose:

```bash
docker build -t mahasewa .
docker run --rm -p 3888:3888 --env-file .env mahasewa
```

---

## 4. Deploy ke Dokploy

Ada **2 cara**. Pilih salah satu.

### Cara A — Application (Dockerfile) — *direkomendasikan*

1. Dokploy Dashboard → **Create → Application**.
2. **Source**: hubungkan repo Git (GitHub/GitLab) branch `main`,
   atau pakai Docker registry.
3. **Build Type**: pilih **Dockerfile**. Path: `Dockerfile` (root).
4. Tab **Environment** → paste semua var dari bagian (2).
5. Tab **Domains** → tambah domain, aktifkan **HTTPS (Let's Encrypt)**.
   - Container port: **3888**.
6. **Deploy**.

Dokploy build image dari Dockerfile, Traefik handle TLS + routing ke port 3888.

### Cara B — Docker Compose

1. Dokploy → **Create → Compose**.
2. Source: repo Git. Compose path: `docker-compose.yml`.
3. Tab **Environment** → isi var (compose mereferensikan `${VAR}`).
4. Tab **Domains** → arahkan ke service `app`, container port `3888`, aktifkan HTTPS.
5. **Deploy**.

---

## 5. Migrasi Database

- Saat container start, `docker-entrypoint.sh` menjalankan
  **`prisma migrate deploy`** memakai `DIRECT_URL`.
- Hanya menerapkan migrasi yang sudah ada di `prisma/migrations/` — **tidak**
  membuat migrasi baru (aman untuk prod).
- Untuk menonaktifkan (mis. DB dikelola terpisah): set `RUN_MIGRATIONS=false`.

**Buat migrasi baru** (di lokal, saat ubah `schema.prisma`):

```bash
npx prisma migrate dev --name nama_perubahan
git add prisma/migrations && git commit -m "db: nama_perubahan"
# push → redeploy → migrate deploy otomatis menerapkannya
```

**Seed data** (opsional, manual sekali):

```bash
# dari mesin lokal yang terhubung ke DB prod, ATAU exec ke container:
npm run db:seed
```

---

## 6. Pakai Postgres Bundled (tanpa Supabase)

Default memakai Supabase. Untuk Postgres di dalam stack:

1. Edit `docker-compose.yml` → uncomment service `db`, `volumes`, dan `depends_on`.
2. Set env:
   ```
   DATABASE_URL=postgresql://postgres:postgres@db:5432/mahasewa
   DIRECT_URL=postgresql://postgres:postgres@db:5432/mahasewa
   ```
3. Storage file (avatar, attachment) tetap butuh Supabase Storage atau
   alternatif — Postgres lokal tidak menggantikan itu.

---

## 7. Troubleshooting

| Gejala | Penyebab / Fix |
|--------|----------------|
| Build gagal di `prisma generate` | Pastikan `prisma/schema.prisma` ter-commit |
| `migrate deploy` error koneksi | Cek `DIRECT_URL` (port 5432, bukan pooler) |
| `PrismaClientInitializationError` runtime | Cek `DATABASE_URL` (pooler 6543) |
| Login gagal / CSRF | `AUTH_SECRET` belum di-set, atau `AUTH_TRUST_HOST` ≠ `true` |
| Gambar Supabase tidak muncul | Hostname sudah whitelisted di `next.config.ts` (`*.supabase.co`) |
| `migrate deploy` "command not found" | Prisma CLI gagal ter-copy — rebuild image (lihat stage `runner`) |
| Env `NEXT_PUBLIC_*` lama tetap muncul | Rebuild image (di-embed saat build) |

---

## 8. Checklist Rilis

- [ ] `.env` produksi terisi lengkap (jangan commit `.env`)
- [ ] `AUTH_SECRET` di-generate baru untuk prod
- [ ] `DATABASE_URL` = pooler 6543, `DIRECT_URL` = direct 5432
- [ ] Migrasi ter-commit di `prisma/migrations/`
- [ ] Domain + HTTPS aktif di Dokploy
- [ ] Test login, chat, dan upload setelah deploy
