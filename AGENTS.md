# 🤖 Project Context & Guidelines for Claude Code — MahaSewa

Dokumen ini memberikan konteks penuh mengenai aplikasi MahaSewa agar Claude Code dapat bertindak sebagai asisten AI yang selaras dengan arsitektur proyek.

## 1. Pengenalan Proyek

- **Nama Proyek:** MahaSewa
- **Jenis Aplikasi:** Marketplace Jasa & Penyewaan Layanan Digital (MVP)
- **Tujuan:** Memudahkan Client mencari jasa digital, melakukan negosiasi (chat) secara real-time, menyepakati harga/brief, dan melakukan transaksi dengan aman.

## 2. Hak Akses & Alur Proteksi Halaman (Hybrid Auth Wall)

Aplikasi ini menggunakan sistem perlindungan akses menggunakan **Next.js Middleware**:

- **Halaman Publik (Tanpa Login):** `/` (Landing Page), `/services/[slug]` (Detail Jasa).
- **Halaman Terproteksi (Wajib Login):** `/chat/*`, `/dashboard/*`, `/checkout/*`.
- **Aturan untuk Claude:** Jika menambah rute baru yang sensitif, pastikan untuk mendaftarkannya ke dalam konfigurasi matcher di file `src/middleware.ts`.

## 3. Referensi Skema Database (ERD & Prisma)

Sistem database PostgreSQL menggunakan relasi terstruktur. Berikut adalah Entity-Relationship Diagram (ERD) proyek ini:

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places (client)"
    USERS ||--o{ CHAT_ROOMS : "participates"
    USERS ||--o{ MESSAGES : "sends"
    USERS ||--o{ REVIEWS : "writes"

    SERVICES ||--o{ ORDERS : "is ordered via"
    SERVICES ||--o{ CHAT_ROOMS : "discussed in"
    SERVICES ||--o{ REVIEWS : "receives"

    CHAT_ROOMS ||--o{ MESSAGES : "contains"
    ORDERS ||--o| REVIEWS : "has 1"

    USERS {
        uuid id PK
        string email UK
        string full_name
        string avatar_url
        enum role "CLIENT, ADMIN"
        datetime created_at
    }

    SERVICES {
        uuid id PK
        string title
        string slug UK
        text description
        decimal base_price
        int revision_limit
        int delivery_days
        jsonb image_urls
        boolean is_active
        datetime created_at
    }

    ORDERS {
        uuid id PK
        uuid client_id FK
        uuid service_id FK
        enum status "PENDING, IN_PROGRESS, REVIEW, COMPLETED, CANCELLED"
        decimal total_amount
        text brief_notes
        string brief_file_url
        string delivery_file_url
        datetime due_date
        datetime created_at
    }

    CHAT_ROOMS {
        uuid id PK
        uuid client_id FK
        uuid admin_id FK
        uuid service_id FK
        datetime created_at
    }

    MESSAGES {
        uuid id PK
        uuid room_id FK
        uuid sender_id FK
        text content
        string attachment_url
        boolean is_custom_offer
        decimal offer_price
        datetime created_at
    }

    REVIEWS {
        uuid id PK
        uuid order_id FK
        uuid client_id FK
        uuid service_id FK
        int rating
        text comment
        datetime created_at
    }

## 4. Arahan Khusus untuk Claude Code (Rules of Engagement)

Saat menulis atau memodifikasi kode dalam proyek ini, ikuti aturan ketat berikut:

1. **Jangan Merusak Migrasi Prisma:** Jika ada perubahan pada struktur data di `prisma/schema.prisma`, ingatkan _developer_ (pengguna) untuk menjalankan perintah `npx prisma migrate dev`.
2. **Gunakan Kapabilitas Real-time:** Untuk fitur chat di halaman `/chat`, pastikan menggunakan pustaka real-time yang didukung oleh infrastruktur proyek.
3. **Optimasi SEO:** Halaman katalog `/services/[slug]` wajib memanfaatkan fungsi `generateMetadata` bawaan Next.js untuk optimasi SEO dinamis.
4. **Prinsip Keamanan (Security First):** Pastikan sesi pengguna selalu divalidasi di sisi server (Server-side session validation) sebelum menjalankan Server Actions, jangan hanya bergantung pada validasi frontend.
```
