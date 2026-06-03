# Landing Page Redesign — MahaSewa

**Date:** 2026-06-03  
**Status:** Approved

## Summary

Redesign landing page dari zero — lebih clean, modern, tidak terlihat seperti template AI generic. Pendekatan: Warm & Human dengan terracotta accent, left-aligned editorial hero, tambah section Cara Kerja, dan install Lucide React untuk semua icon.

---

## Design Decisions

| Keputusan | Pilihan |
|---|---|
| Arah visual | Warm & Human (cream background, terracotta accent) |
| Hero layout | Left-aligned, bold typography, organic blob shapes, no search bar |
| Warna aksen | Terracotta `#bc4800` (ganti biru `#2563eb`) |
| Icon library | Lucide React (`npm install lucide-react`) |
| Sections | Hero → Cara Kerja → Kategori → Jasa Rekomendasi |
| Scope | Rewrite `page.tsx` + update `navbar.tsx` + update `footer.tsx` |

---

## Color Palette

| Token | Value | Penggunaan |
|---|---|---|
| Background cream | `#fdf8f3` | Hero bg, Navbar bg, Kategori section bg |
| Terracotta | `#bc4800` | CTA button, aksen, icon warna, section label |
| Terracotta light | `#fde8d8` | Badge bg, blob shape, step circle bg, category icon bg |
| Dark brown | `#1a1208` | Heading, footer bg |
| Warm gray | `#7a6552` | Body text, secondary text |
| Border | `#f0e4d4` | Card border, divider |

Warna biru (`#004ac6`, `#2563eb`) dihapus dari semua komponen yang diubah. `globals.css` tidak perlu diubah karena token lama tidak dipakai di komponen baru.

---

## Section Specs

### 1. Navbar (`components/shared/navbar.tsx`)

- Background: `#fdf8f3` (warm cream, bukan putih)
- Logo: `MahaSewa` dengan terracotta + dark brown split-color
- Search bar di navbar: **dihapus** (tidak konsisten jika hero juga tidak ada search)
- Nav links: Browse (dengan icon `LayoutGrid`), tidak ada search
- Auth buttons: Ghost border warm + solid terracotta primary
- Sticky, border-bottom `#f0e4d4`

### 2. Hero Section (`app/page.tsx`)

- Background: `#fdf8f3`
- Layout: left-aligned, `max-w-[1280px]` container
- Elemen dekoratif: 2-3 organic blob shapes (CSS `border-radius` asymmetric + `background` radial-gradient), posisi kanan hero
- Badge: `✦ Platform Jasa Digital Indonesia` — pill terracotta light
- Category pills: Semua (active/terracotta), Desain, Programming, Konten, Marketing — scroll horizontal mobile
  - Setiap pill punya Lucide icon kecil (14px)
  - Pills berfungsi sebagai filter shortcut ke `/services?cat=X`
- Headline: `font-size: 3rem–4rem`, `font-weight: 800`, `letter-spacing: -2px`
  - Teks: "Kerja bareng orang *berbakat.*" — kata italic berwarna terracotta
- Subheadline: max 2 baris, `color: #7a6552`
- CTA row:
  - Primary: "Jelajahi Jasa →" — solid terracotta, icon `ArrowRight`
  - Secondary: "▶ Cara Kerja" — ghost border warm, icon `Play`
- Stat row (bawah CTA, separated border-top):
  - 3 stat: `50+ Jasa Aktif`, `4.9★ Rating`, `100% Terverifikasi`
  - Data stat hardcoded (MVP, bukan dari DB)
- **Tidak ada search bar** di hero

### 3. Cara Kerja (section baru di `app/page.tsx`)

- Background: `#ffffff`
- Section label: pill terracotta light + teks "Cara Kerja"
- Heading: "Mudah dalam 3 langkah"
- Layout: 3 kolom grid, dengan connector line horizontal di antara step circles
- Connector line: CSS `::before` pseudo-element, gradient terracotta
- Steps:
  1. **Cari & Temukan** — icon `Search` (terracotta), circle `#fde8d8`
  2. **Chat & Sepakati** — icon `MessageSquare` (white), circle `#bc4800` (filled/active)
  3. **Bayar & Selesai** — icon `ShieldCheck` (terracotta), circle `#fde8d8`
- Step description: max 2 baris, `font-size: 14px`, `color: #7a6552`

### 4. Kategori (`app/page.tsx`)

- Background: `#fdf8f3`
- Section label + heading: "Apa yang kamu butuhkan?"
- Grid: 4 kolom desktop, 2 kolom mobile
- Card design baru: left-aligned (tidak center), icon box 42px rounded + nama + jumlah jasa
- Icon box: `#fde8d8` bg, Lucide icon `stroke: #bc4800`
  - Desain: `Palette`
  - Programming: `Code2`
  - Penulisan: `PenLine`
  - Marketing: `Megaphone`
- Jumlah jasa: hardcoded string "X jasa tersedia" (MVP, bukan dari DB)
- Hover: border terracotta

### 5. Jasa Rekomendasi (`app/page.tsx`)

- Background: `#ffffff`
- Section label: "Pilihan Editor" + heading "Jasa Rekomendasi"
- "Lihat Semua →" dengan icon `ArrowRight`, warna terracotta
- Grid: 4 kolom desktop, 2 kolom tablet, 1 kolom mobile
- ServiceCard: **tidak diubah** — sudah cukup netral, akan tetap render dengan data DB
- Favorite icon di card: ganti dari Material Symbols ke Lucide `Heart`

### 6. Footer (`components/shared/footer.tsx`)

- Background: dark `#1a1208` (warm near-black, bukan abu)
- Logo split-color: "Maha" putih + "Sewa" terracotta
- Tagline di bawah logo: "Marketplace jasa digital Indonesia"
- Layout 2-kolom: kiri branding, kanan 3 kolom link (Platform, Legal, Support)
- Link color: `#5a4535` default, `#fde8d8` hover
- Border-bottom separator sebelum copyright: `#2a1e0e`
- Copyright: `#3a2a1a`

---

## Dependencies

```bash
npm install lucide-react
```

Import pattern di setiap file:
```tsx
import { Search, MessageSquare, ShieldCheck, Palette, Code2, PenLine, Megaphone, ArrowRight, Play, Heart, Star, LayoutGrid, Sparkles } from "lucide-react";
```

---

## Files Changed

| File | Perubahan |
|---|---|
| `app/page.tsx` | Full rewrite — semua sections |
| `components/shared/navbar.tsx` | Warm palette, hapus search bar, icon LayoutGrid di Browse link |
| `components/shared/footer.tsx` | Dark warm bg, split-color logo, 3-kolom link |
| `components/features/service-card.tsx` | Ganti Material Symbols `favorite` → Lucide `Heart`, `star` → Lucide `Star` |

---

## Out of Scope

- `app/services/page.tsx` — tidak diubah
- `app/services/[slug]/page.tsx` — tidak diubah
- Database/Prisma — tidak ada perubahan skema
- Auth/middleware — tidak ada perubahan
- Mobile nav (hamburger menu) — tidak diubah, sudah minimal
