# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign landing page MahaSewa menjadi Warm & Human — terracotta palette, left-aligned editorial hero, section Cara Kerja, dan Lucide React icons.

**Architecture:** Full rewrite `app/page.tsx` + update 3 shared components (`navbar.tsx`, `footer.tsx`, `service-card.tsx`). Tidak ada perubahan skema DB, middleware, atau route baru. Warna biru diganti terracotta di semua komponen yang diubah.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Lucide React, Prisma (read-only)

---

## File Map

| File | Tipe | Perubahan |
|---|---|---|
| `components/shared/navbar.tsx` | Modify | Warm palette, hapus search bar, split-color logo, LayoutGrid icon |
| `components/shared/footer.tsx` | Modify | Dark warm bg `#1a1208`, split-color logo, tagline, 3-kolom link |
| `components/features/service-card.tsx` | Modify | Swap Material Symbols → Lucide `Heart` + `Star` |
| `app/page.tsx` | Full rewrite | Hero + Cara Kerja + Kategori + Featured sections |

---

## Task 1: Install lucide-react

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install dependency**

```bash
cd c:/Coding/mahasewa
npm install lucide-react
```

Expected output: `added 1 package` (atau serupa), tidak ada error.

- [ ] **Step 2: Verify installed**

```bash
cat package.json | grep lucide
```

Expected: `"lucide-react": "^x.x.x"` muncul di `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install lucide-react"
```

---

## Task 2: Update service-card.tsx — swap icons ke Lucide

**Files:**
- Modify: `components/features/service-card.tsx`

- [ ] **Step 1: Rewrite file**

Replace seluruh konten `components/features/service-card.tsx` dengan:

```tsx
import Link from "next/link";
import { Heart, Star } from "lucide-react";
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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#f0e4d4] bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#fdf0e8]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#e8d5c0]">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-grow flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-6 w-6 overflow-hidden rounded-full bg-gradient-to-br from-[#fde8d8] to-[#bc4800]">
            {sellerAvatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sellerAvatar} alt={sellerName} className="h-full w-full object-cover" />
            )}
          </div>
          <span className="text-xs font-medium text-[#7a6552]">{sellerName}</span>
        </div>

        <h3 className="mb-2 line-clamp-2 flex-grow text-sm font-semibold text-[#1a1208] transition-colors group-hover:text-[#bc4800]">
          {title}
        </h3>

        <div className="mb-4 flex items-center gap-1">
          <Star className="h-3 w-3 fill-[#bc4800] text-[#bc4800]" />
          <span className="text-xs font-bold text-[#1a1208]">{rating.toFixed(1)}</span>
          <span className="text-xs text-[#7a6552]">({ratingCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[#f0e4d4] pt-3">
          <Heart className="h-4 w-4 cursor-pointer text-[#d0c0b0] transition-colors hover:fill-[#bc4800] hover:text-[#bc4800]" />
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#7a6552]">Mulai dari</span>
            <div className="text-base font-bold text-[#1a1208]">{formatIDR(basePrice)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Type check**

```bash
cd c:/Coding/mahasewa && npx tsc --noEmit
```

Expected: exit 0, tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add components/features/service-card.tsx
git commit -m "feat: swap service-card icons to Lucide Heart + Star"
```

---

## Task 3: Rewrite navbar.tsx — warm palette

**Files:**
- Modify: `components/shared/navbar.tsx`

- [ ] **Step 1: Rewrite file**

Replace seluruh konten `components/shared/navbar.tsx` dengan:

```tsx
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { LayoutGrid } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#f0e4d4] bg-[#fdf8f3]">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 md:px-16">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-[#bc4800]">Maha</span>
          <span className="text-[#1a1208]">Sewa</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/services"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-[#7a6552] transition-colors hover:text-[#bc4800]"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Browse
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-[#e8d5c0] px-4 py-2 text-sm font-semibold text-[#7a6552] transition-colors hover:text-[#bc4800]"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-lg border border-[#e8d5c0] px-4 py-2 text-sm font-semibold text-[#7a6552] transition-colors hover:text-[#bc4800]"
              >
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-[#bc4800] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-[#e8d5c0] px-4 py-2 text-sm font-semibold text-[#7a6552] transition-colors hover:text-[#bc4800]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#bc4800] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Daftar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger — unchanged */}
        <button className="text-[#1a1208] md:hidden" aria-label="Menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Type check**

```bash
cd c:/Coding/mahasewa && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/shared/navbar.tsx
git commit -m "feat: redesign navbar with warm palette and terracotta brand"
```

---

## Task 4: Rewrite footer.tsx — dark warm

**Files:**
- Modify: `components/shared/footer.tsx`

- [ ] **Step 1: Rewrite file**

Replace seluruh konten `components/shared/footer.tsx` dengan:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#1a1208]">
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-14 md:px-16">
        {/* Top row */}
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Branding */}
          <div>
            <div className="text-2xl font-extrabold tracking-tight">
              <span className="text-white">Maha</span>
              <span className="text-[#bc4800]">Sewa</span>
            </div>
            <p className="mt-1.5 text-sm text-[#5a4535]">Marketplace jasa digital Indonesia</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12 text-sm">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">Platform</p>
              <Link href="/services" className="text-[#5a4535] transition-colors hover:text-[#fde8d8]">
                Browse Jasa
              </Link>
              <Link href="#cara-kerja" className="text-[#5a4535] transition-colors hover:text-[#fde8d8]">
                Cara Kerja
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">Legal</p>
              <Link href="#" className="text-[#5a4535] transition-colors hover:text-[#fde8d8]">
                Privacy Policy
              </Link>
              <Link href="#" className="text-[#5a4535] transition-colors hover:text-[#fde8d8]">
                Terms of Service
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">Support</p>
              <Link href="#" className="text-[#5a4535] transition-colors hover:text-[#fde8d8]">
                Bantuan
              </Link>
              <Link href="#" className="text-[#5a4535] transition-colors hover:text-[#fde8d8]">
                Kontak
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-[#2a1e0e] pt-6">
          <p className="text-xs text-[#3a2a1a]">
            © {new Date().getFullYear()} MahaSewa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Type check**

```bash
cd c:/Coding/mahasewa && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/shared/footer.tsx
git commit -m "feat: redesign footer with dark warm palette and 3-column links"
```

---

## Task 5: Rewrite app/page.tsx — semua sections

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite file**

Replace seluruh konten `app/page.tsx` dengan:

```tsx
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ServiceCard } from "@/components/features/service-card";
import { prisma } from "@/lib/prisma";
import {
  Search,
  MessageSquare,
  ShieldCheck,
  Palette,
  Code2,
  PenLine,
  Megaphone,
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";

export const revalidate = 300;

const CATEGORIES = [
  { icon: Palette, label: "Desain Grafis", count: 12 },
  { icon: Code2, label: "Programming & Tech", count: 18 },
  { icon: PenLine, label: "Penulisan & Terjemahan", count: 9 },
  { icon: Megaphone, label: "Digital Marketing", count: 11 },
] as const;

const HERO_CATS = [
  { label: "Semua", q: "" },
  { label: "Desain", q: "Desain" },
  { label: "Programming", q: "Programming" },
  { label: "Konten", q: "Konten" },
  { label: "Marketing", q: "Marketing" },
];

const HOW_STEPS = [
  {
    icon: <Search className="h-5 w-5 text-[#bc4800]" />,
    circleCls: "bg-[#fde8d8]",
    title: "Cari & Temukan",
    desc: "Browse jasa dari freelancer terverifikasi. Filter sesuai kebutuhan & budget.",
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-white" />,
    circleCls: "bg-[#bc4800]",
    title: "Chat & Sepakati",
    desc: "Diskusi langsung, negosiasi harga & brief secara real-time.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-[#bc4800]" />,
    circleCls: "bg-[#fde8d8]",
    title: "Bayar & Selesai",
    desc: "Dana diteruskan ke freelancer setelah kamu puas dengan hasilnya.",
  },
];

async function getFeaturedServices() {
  try {
    return await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        imageUrls: true,
      },
    });
  } catch {
    return [];
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-[#fde8d8] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#bc4800]">
      {children}
    </span>
  );
}

export default async function HomePage() {
  const services = await getFeaturedServices();

  return (
    <>
      <Navbar />
      <main className="flex-grow">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-[#fdf8f3] px-4 py-20 md:px-16 md:py-28">
          {/* Blob decorations */}
          <div
            aria-hidden
            style={{
              borderRadius: "60% 40% 50% 50%",
              background: "radial-gradient(circle at 40% 40%, #fde8d8, transparent 65%)",
              opacity: 0.8,
            }}
            className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] -translate-y-1/4 translate-x-1/4"
          />
          <div
            aria-hidden
            style={{ borderRadius: "50% 30% 60% 40%", background: "#fdf0e8", opacity: 0.5 }}
            className="pointer-events-none absolute bottom-0 right-24 h-[200px] w-[200px] translate-y-1/3"
          />

          <div className="relative z-10 mx-auto max-w-[1280px]">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#fde8d8] px-3.5 py-1.5 text-xs font-semibold text-[#bc4800]">
              <Sparkles className="h-3 w-3" />
              Platform Jasa Digital Indonesia
            </div>

            {/* Category pills */}
            <div className="mb-6 flex flex-wrap gap-2">
              {HERO_CATS.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.q ? `/services?cat=${encodeURIComponent(cat.q)}` : "/services"}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    cat.label === "Semua"
                      ? "border-[#bc4800] bg-[#bc4800] text-white"
                      : "border-[#e8d5c0] bg-white text-[#7a6552] hover:border-[#bc4800] hover:text-[#bc4800]"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* Headline */}
            <h1 className="mb-4 max-w-xl text-5xl font-extrabold leading-[1.08] tracking-[-2px] text-[#1a1208] md:text-6xl">
              Kerja bareng
              <br />
              orang <em className="text-[#bc4800]">berbakat.</em>
            </h1>

            <p className="mb-8 max-w-md text-base leading-relaxed text-[#7a6552] md:text-lg">
              Dari logo sampai full website — temukan freelancer digital terpercaya untuk bisnis kamu.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-[#bc4800] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Jelajahi Jasa
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#cara-kerja"
                className="inline-flex items-center gap-2 rounded-xl border border-[#e8d5c0] px-6 py-3.5 text-sm font-semibold text-[#7a6552] transition-colors hover:border-[#bc4800] hover:text-[#bc4800]"
              >
                <Play className="h-3.5 w-3.5" />
                Cara Kerja
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-8 border-t border-[#f0e4d4] pt-8">
              {[
                { num: "50+", label: "Jasa Aktif" },
                { num: "4.9★", label: "Rating Rata-rata" },
                { num: "100%", label: "Terverifikasi" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-[#1a1208]">{s.num}</div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-[#7a6552]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CARA KERJA ── */}
        <section id="cara-kerja" className="border-t border-[#f0e4d4] bg-white px-4 py-20 md:px-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-14">
              <SectionLabel>Cara Kerja</SectionLabel>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1a1208]">
                Mudah dalam 3 langkah
              </h2>
            </div>
            <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
              {/* Connector line */}
              <div
                aria-hidden
                className="absolute left-[calc(16.67%+27px)] right-[calc(16.67%+27px)] top-[27px] hidden h-px md:block"
                style={{ background: "linear-gradient(90deg, #fde8d8, #bc4800, #fde8d8)" }}
              />
              {HOW_STEPS.map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${step.circleCls}`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-[#1a1208]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#7a6552]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KATEGORI ── */}
        <section className="border-t border-[#f0e4d4] bg-[#fdf8f3] px-4 py-20 md:px-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-10">
              <SectionLabel>Kategori</SectionLabel>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1a1208]">
                Apa yang kamu butuhkan?
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/services?cat=${encodeURIComponent(cat.label)}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-[#f0e4d4] bg-white p-5 transition-all hover:border-[#bc4800] hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fde8d8]">
                    <cat.icon className="h-5 w-5 text-[#bc4800]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1208]">{cat.label}</p>
                    <p className="mt-0.5 text-[11px] text-[#aaa]">{cat.count} jasa tersedia</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED ── */}
        <section className="border-t border-[#f0e4d4] bg-white px-4 py-20 md:px-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <SectionLabel>Pilihan Editor</SectionLabel>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1a1208]">
                  Jasa Rekomendasi
                </h2>
              </div>
              <Link
                href="/services"
                className="hidden items-center gap-1 text-sm font-semibold text-[#bc4800] underline underline-offset-4 md:flex"
              >
                Lihat Semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {services.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#f0e4d4] bg-[#fdf8f3] py-14 text-center text-sm text-[#7a6552]">
                Belum ada jasa. Jalankan{" "}
                <code className="rounded bg-[#fde8d8] px-2 py-0.5 text-xs text-[#bc4800]">
                  npm run db:seed
                </code>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((s) => {
                  const images = Array.isArray(s.imageUrls) ? (s.imageUrls as string[]) : [];
                  return (
                    <ServiceCard
                      key={s.id}
                      slug={s.slug}
                      title={s.title}
                      basePrice={s.basePrice.toString()}
                      imageUrl={images[0]}
                      rating={4.9}
                      ratingCount={120}
                    />
                  );
                })}
              </div>
            )}

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/services"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#f0e4d4] px-6 py-3 text-sm font-semibold text-[#1a1208] transition-colors hover:border-[#bc4800] hover:text-[#bc4800]"
              >
                Lihat Semua Jasa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Type check**

```bash
cd c:/Coding/mahasewa && npx tsc --noEmit
```

Expected: exit 0. Jika ada error terkait `React` not defined, tambahkan `import React from "react"` di baris pertama — Next.js 13+ biasanya tidak membutuhkannya tapi tergantung konfigurasi tsconfig.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign landing page with warm palette, hero, cara kerja section"
```

---

## Task 6: Visual verification

**Files:** (tidak ada perubahan kode)

- [ ] **Step 1: Jalankan dev server**

```bash
cd c:/Coding/mahasewa && npm run dev
```

Buka `http://localhost:3000` di browser.

- [ ] **Step 2: Checklist visual**

Verifikasi setiap item berikut:

| Item | Expected |
|---|---|
| Navbar bg | Cream `#fdf8f3`, bukan putih |
| Logo | "Maha" terracotta + "Sewa" dark brown |
| Browse link | Ada icon `LayoutGrid` kecil di sebelah kiri teks |
| Hero bg | Cream, bukan putih |
| Hero layout | LEFT-aligned, bukan center |
| Blob shapes | Terlihat di kanan hero (mobile: tidak kelihatan) |
| Headline | Font besar, kata "berbakat." italic terracotta |
| Stat row | 3 angka di bawah CTA dengan border-top |
| Section Cara Kerja | Muncul setelah hero, 3 langkah dengan connector line |
| Step 2 circle | Filled terracotta (bukan outline) |
| Kategori bg | Cream `#fdf8f3` |
| Kategori card | Left-aligned icon + nama + count |
| Featured section | Label "Pilihan Editor" + heading "Jasa Rekomendasi" |
| Service card | Icon star ★ terracotta, icon heart outline |
| Footer bg | Dark `#1a1208` |
| Footer logo | "Maha" putih + "Sewa" terracotta |
| Footer links | 3 kolom (Platform, Legal, Support) |

- [ ] **Step 3: Build check**

```bash
cd c:/Coding/mahasewa && npm run build
```

Expected: exit 0, tidak ada build error.

- [ ] **Step 4: Final commit jika ada fix**

Jika ada minor fix dari visual check:

```bash
git add -p
git commit -m "fix: visual adjustments from landing page review"
```
