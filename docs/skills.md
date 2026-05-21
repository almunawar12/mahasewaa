# 🛠️ Tech Stack & Coding Standards — MahaSewa

Dokumen ini berisi panduan teknis, standar penulisan kode, dan kapabilitas teknologi yang digunakan dalam proyek MahaSewa. Claude Code wajib mengikuti standar ini dalam setiap pembuatan atau modifikasi kode.

## 1. Core Tech Stack

Setiap komponen dalam proyek ini harus dibangun menggunakan teknologi berikut:

- **Framework Utama:** Next.js 14+ (App Router dengan Direktori `src/`)
- **Bahasa Pemrograman:** TypeScript (Strict Mode aktif)
- **Database:** PostgreSQL
- **ORM:** Prisma Client
- **State Management & Caching:** React Query (TanStack Query v5)
- **Data Validation:** Zod
- **UI/Styling:** Tailwind CSS & shadcn/ui

---

## 2. Standar Penulisan Kode (Coding Standards)

### A. Next.js App Router & Server Components

- Gunakan **React Server Components (RSC)** secara default untuk performa dan SEO yang optimal.
- Gunakan `'use client'` hanya pada komponen atomik yang memerlukan interaksi pengguna (seperti form, tombol klik, atau real-time chat box).
- Manfaatkan **Server Actions** untuk operasi mutasi data (create, update, delete) daripada membuat API Route terpisah, kecuali diperlukan untuk integrasi eksternal (seperti Webhook Payment Gateway).

### B. Type Safety (Strict TypeScript)

- Hindari penggunaan tipe data `any`. Selalu definisikan `interface` atau `type` untuk setiap data.
- Gunakan tipe data otomatis yang dihasilkan oleh Prisma Client (`import { User, Order, Service } from '@prisma/client'`) ketika mengelola data dari database.

### C. Validasi Data dengan Zod

- Semua input dari pengguna (Form Input) atau request payload wajib divalidasi menggunakan skema **Zod** sebelum diproses oleh Server Actions atau API.
- Letakkan skema validasi Zod di dalam folder `src/lib/validations/`.

### D. Error & State Handling

- Setiap operasi async wajib dibungkus dalam blok `try-catch`.
- Manfaatkan fitur `loading.tsx` dan `error.tsx` bawaan Next.js untuk mengelola komponen UI saat memuat data atau jika terjadi _error_.

---

## 3. Struktur Komponen UI

- Gunakan pendekatan **Atomic Design** yang dipermudah di dalam folder `src/components/`:
  - `ui/`: Tempat untuk komponen dasar dari shadcn/ui (Button, Input, Dialog).
  - `shared/`: Komponen global seperti Navbar, Footer, dan Sidebar.
  - `features/`: Komponen spesifik fitur (seperti `ChatBox` untuk fitur chat, `OrderRow` untuk manajemen pesanan).

---

## 4. Referensi Desain

- Seluruh referensi desain dan rancangan halaman (HTML Mockup) dapat ditemukan di dalam folder `html/`.
- Gunakan file-file statis di folder tersebut (misalnya `dashboard.html`, `chat.html`, `landing-page.html`, dll.) sebagai acuan utama ketika membangun _user interface_ menggunakan Tailwind CSS dan shadcn/ui.
