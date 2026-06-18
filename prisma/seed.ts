import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("🌱 Seeding…");

  const passwordHash = await bcrypt.hash("password123", 10);

  // ── Users ──────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@mahasewa.id" },
    update: {},
    create: {
      email: "admin@mahasewa.id",
      passwordHash,
      fullName: "Admin MahaSewa",
      role: "ADMIN",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
    },
  });

  const clients = await Promise.all(
    [
      { email: "client1@example.com", fullName: "Budi Santoso" },
      { email: "client2@example.com", fullName: "Sari Wijaya" },
      { email: "client3@example.com", fullName: "Andi Pratama" },
    ].map((c) =>
      prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: {
          ...c,
          passwordHash,
          role: "CLIENT",
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.fullName)}`,
        },
      }),
    ),
  );

  // ── Categories ─────────────────────────────────────────────
  const categoryData = [
    { name: "Konstruksi & Arsitektur", slug: "konstruksi-arsitektur", icon: "architecture" },
    { name: "Event & Dokumentasi", slug: "event-dokumentasi", icon: "event" },
    { name: "Multi Technology", slug: "multi-technology", icon: "memory" },
    { name: "Jasa Layanan Umum", slug: "jasa-layanan-umum", icon: "handyman" },
  ];

  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, icon: c.icon },
        create: { ...c, isActive: true },
      }),
    ),
  );

  const [catKonstruksi, catEvent, catTech, catUmum] = categories;

  // ── Services ───────────────────────────────────────────────
  const servicesData = [
    // Konstruksi & Arsitektur
    {
      title: "Desain Denah Rumah 2D & 3D",
      slug: "desain-denah-rumah-2d-3d",
      description:
        "Denah rumah lengkap 2D dan visualisasi 3D eksterior + interior. Cocok untuk rumah tinggal, kos, atau ruko. Termasuk gambar tampak depan, samping, dan potongan.\n\nProses:\n1. Konsultasi kebutuhan & ukuran lahan\n2. Draft denah 2D\n3. Revisi & finalisasi\n4. Render 3D eksterior",
      basePrice: "2500000",
      revisionLimit: 3,
      deliveryDays: 10,
      imageUrls: ["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800"],
      categoryId: catKonstruksi.id,
    },
    {
      title: "Gambar Kerja Konstruksi (IMB Ready)",
      slug: "gambar-kerja-konstruksi-imb",
      description:
        "Paket gambar kerja lengkap untuk pengajuan IMB: site plan, denah, tampak, potongan, detail struktur, mekanikal elektrikal. Format CAD + PDF.",
      basePrice: "5000000",
      revisionLimit: 2,
      deliveryDays: 14,
      imageUrls: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      categoryId: catKonstruksi.id,
    },
    {
      title: "RAB (Rencana Anggaran Biaya) Bangunan",
      slug: "rab-rencana-anggaran-biaya",
      description:
        "Penyusunan RAB detail untuk proyek konstruksi rumah tinggal, renovasi, atau komersial. Termasuk bill of quantity, harga satuan pekerjaan, dan rekap biaya per item.",
      basePrice: "1500000",
      revisionLimit: 2,
      deliveryDays: 7,
      imageUrls: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"],
      categoryId: catKonstruksi.id,
    },

    // Event & Dokumentasi
    {
      title: "Paket Foto & Video Pernikahan",
      slug: "foto-video-pernikahan",
      description:
        "Dokumentasi lengkap pernikahan: foto akad + resepsi (500+ edited photos), video highlight 5–7 menit, teaser 60 detik. Delivery via Google Drive dalam 14 hari.",
      basePrice: "8000000",
      revisionLimit: 1,
      deliveryDays: 14,
      imageUrls: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"],
      categoryId: catEvent.id,
    },
    {
      title: "Jasa EO Corporate Event & Seminar",
      slug: "eo-corporate-event-seminar",
      description:
        "Pengelolaan event korporat end-to-end: venue, dekorasi, sound system, MC, katering koordinasi, dan rundown. Kapasitas hingga 500 pax. Konsultasi gratis.",
      basePrice: "15000000",
      revisionLimit: 1,
      deliveryDays: 30,
      imageUrls: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"],
      categoryId: catEvent.id,
    },
    {
      title: "Foto Produk & Lifestyle (30 Foto)",
      slug: "foto-produk-lifestyle",
      description:
        "30 foto produk berkualitas tinggi dengan prop dan styling. Background putih + lifestyle scene. Cocok untuk marketplace, website, dan sosial media.",
      basePrice: "1800000",
      revisionLimit: 2,
      deliveryDays: 5,
      imageUrls: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
      categoryId: catEvent.id,
    },

    // Multi Technology
    {
      title: "Pembuatan Website Company Profile",
      slug: "website-company-profile",
      description:
        "Website company profile responsif dengan Next.js + Tailwind. SEO-ready, CMS sederhana, deploy ke Vercel. Termasuk 5 halaman: Home, Tentang, Layanan, Portofolio, Kontak.",
      basePrice: "4500000",
      revisionLimit: 3,
      deliveryDays: 14,
      imageUrls: ["https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800"],
      categoryId: catTech.id,
    },
    {
      title: "Aplikasi Mobile Android (React Native)",
      slug: "aplikasi-mobile-android-react-native",
      description:
        "Pengembangan aplikasi Android dengan React Native. Fitur: auth, database lokal/cloud, notifikasi push. Cocok untuk MVP bisnis. Termasuk deploy ke Google Play.",
      basePrice: "12000000",
      revisionLimit: 2,
      deliveryDays: 30,
      imageUrls: ["https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800"],
      categoryId: catTech.id,
    },
    {
      title: "Setup & Optimasi Server VPS",
      slug: "setup-optimasi-server-vps",
      description:
        "Konfigurasi VPS (Ubuntu/Debian): Nginx, SSL Let's Encrypt, firewall, PM2, Docker. Migrasi dari shared hosting. Laporan keamanan dasar + monitoring uptime.",
      basePrice: "800000",
      revisionLimit: 1,
      deliveryDays: 3,
      imageUrls: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"],
      categoryId: catTech.id,
    },

    // Jasa Layanan Umum
    {
      title: "Pengurusan Izin Usaha & SIUP",
      slug: "pengurusan-izin-usaha-siup",
      description:
        "Bantu proses pengurusan SIUP, NIB (OSS), NPWP badan, dan dokumen legalitas usaha lainnya. Termasuk konsultasi jenis badan usaha (CV/PT/UD) dan pendampingan.",
      basePrice: "1200000",
      revisionLimit: 1,
      deliveryDays: 14,
      imageUrls: ["https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=800"],
      categoryId: catUmum.id,
    },
    {
      title: "Jasa Desain Interior Ruang Kerja",
      slug: "desain-interior-ruang-kerja",
      description:
        "Desain interior kantor / co-working space dengan konsep ergonomis dan produktif. Termasuk mood board, 3D render, dan rekomendasi furnitur + material.",
      basePrice: "3500000",
      revisionLimit: 3,
      deliveryDays: 10,
      imageUrls: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
      categoryId: catUmum.id,
    },
    {
      title: "Konsultasi & Pembuatan SOP Bisnis",
      slug: "konsultasi-pembuatan-sop-bisnis",
      description:
        "Penyusunan SOP operasional bisnis: pemetaan proses, flowchart, dan dokumen prosedur siap pakai. Cocok untuk UMKM yang ingin scale up dan standarisasi tim.",
      basePrice: "2000000",
      revisionLimit: 2,
      deliveryDays: 7,
      imageUrls: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800"],
      categoryId: catUmum.id,
    },
  ];

  const services = await Promise.all(
    servicesData.map((s) =>
      prisma.service.upsert({
        where: { slug: s.slug },
        update: { categoryId: s.categoryId },
        create: s,
      }),
    ),
  );

  const [client1, client2, client3] = clients;
  const denah = services[0];
  const website = services[6];
  const foto = services[5];

  // ── Orders ─────────────────────────────────────────────────
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        clientId: client1.id,
        serviceId: denah.id,
        status: "IN_PROGRESS",
        totalAmount: denah.basePrice,
        briefNotes: "Rumah 2 lantai, lahan 8x15m, 3 kamar tidur, 2 kamar mandi.",
        dueDate: new Date(Date.now() + 8 * 24 * 3600_000),
      },
    }),
    prisma.order.create({
      data: {
        clientId: client2.id,
        serviceId: website.id,
        status: "REVIEW",
        totalAmount: website.basePrice,
        briefNotes: "Company profile untuk perusahaan kontraktor bangunan.",
        deliveryFileUrl: "https://example.com/deliverables/company-profile-v1.zip",
        dueDate: new Date(Date.now() + 2 * 24 * 3600_000),
      },
    }),
    prisma.order.create({
      data: {
        clientId: client3.id,
        serviceId: foto.id,
        status: "COMPLETED",
        totalAmount: foto.basePrice,
        briefNotes: "Foto produk skincare 30 pcs, background putih + 5 lifestyle.",
        deliveryFileUrl: "https://example.com/deliverables/foto-produk.zip",
        dueDate: new Date(Date.now() - 3 * 24 * 3600_000),
      },
    }),
    prisma.order.create({
      data: {
        clientId: client1.id,
        serviceId: website.id,
        status: "PENDING",
        totalAmount: website.basePrice,
        briefNotes: "Website untuk startup property tech.",
      },
    }),
  ]);

  // ── Chat Rooms ─────────────────────────────────────────────
  const room1 = await prisma.chatRoom.upsert({
    where: { clientId_adminId_serviceId: { clientId: client1.id, adminId: admin.id, serviceId: denah.id } },
    update: {},
    create: { clientId: client1.id, adminId: admin.id, serviceId: denah.id },
  });

  const room2 = await prisma.chatRoom.upsert({
    where: { clientId_adminId_serviceId: { clientId: client2.id, adminId: admin.id, serviceId: website.id } },
    update: {},
    create: { clientId: client2.id, adminId: admin.id, serviceId: website.id },
  });

  await prisma.message.createMany({
    data: [
      { roomId: room1.id, senderId: client1.id, content: "Halo, saya mau pesan desain denah rumah 2 lantai." },
      { roomId: room1.id, senderId: admin.id, content: "Halo Budi! Boleh share ukuran lahan dan kebutuhan ruangannya?" },
      { roomId: room1.id, senderId: client1.id, content: "Lahan 8x15m, butuh 3 kamar, ruang tamu luas, dan dapur semi-terbuka." },
      {
        roomId: room1.id,
        senderId: admin.id,
        content: "Siap! Saya tawarkan paket premium dengan 3D render eksterior + interior 2 ruangan.",
        isCustomOffer: true,
        offerPrice: "3500000",
      },
      { roomId: room2.id, senderId: client2.id, content: "Untuk website company profile, apakah bisa tambah fitur blog?" },
      { roomId: room2.id, senderId: admin.id, content: "Bisa! Blog dengan CMS sederhana bisa ditambahkan, ada biaya tambahan Rp 500rb." },
    ],
  });

  // ── Reviews ────────────────────────────────────────────────
  const completed = orders.find((o) => o.status === "COMPLETED");
  if (completed) {
    await prisma.review.upsert({
      where: { orderId: completed.id },
      update: {},
      create: {
        orderId: completed.id,
        clientId: completed.clientId,
        serviceId: completed.serviceId,
        rating: 5,
        comment: "Hasil foto produk sangat memuaskan! Background bersih, warna akurat, pengiriman tepat waktu.",
      },
    });
  }

  console.log("✅ Seed selesai:");
  console.log(`   Users      : ${clients.length + 1} (1 admin, ${clients.length} client)`);
  console.log(`   Categories : ${categories.length}`);
  console.log(`   Services   : ${services.length}`);
  console.log(`   Orders     : ${orders.length}`);
  console.log(`   Rooms      : 2 (dengan pesan)`);
  console.log(`   Reviews    : 1`);
  console.log("");
  console.log("🔑 Login:");
  console.log("   admin@mahasewa.id  / password123");
  console.log("   client1@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
