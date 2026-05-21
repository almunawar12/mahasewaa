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

  const servicesData = [
    {
      title: "Desain Logo Profesional",
      slug: "desain-logo-profesional",
      description:
        "Logo modern, unik, dan siap pakai untuk brand Anda. Termasuk file vektor (AI, SVG, PNG), versi monokrom, dan brand guideline mini.\n\nProses:\n1. Brief & riset\n2. 3 konsep awal\n3. Revisi sesuai paket\n4. Final delivery",
      basePrice: "750000",
      revisionLimit: 3,
      deliveryDays: 5,
      imageUrls: ["https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800"],
    },
    {
      title: "Website Landing Page Next.js",
      slug: "website-landing-page-nextjs",
      description:
        "Landing page responsif dengan Next.js + Tailwind. SEO-ready, performa A+, deploy ke Vercel. Cocok untuk produk SaaS, event, atau profil bisnis.",
      basePrice: "3500000",
      revisionLimit: 2,
      deliveryDays: 10,
      imageUrls: ["https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800"],
    },
    {
      title: "Video Editing Promosi 60 Detik",
      slug: "video-editing-promosi-60-detik",
      description:
        "Video promosi 60 detik dengan motion graphics, color grading, dan sound design. Format vertikal & horizontal untuk semua platform.",
      basePrice: "1200000",
      revisionLimit: 2,
      deliveryDays: 7,
      imageUrls: ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"],
    },
    {
      title: "Copywriting Konten Sosial Media (10 Post)",
      slug: "copywriting-konten-sosial-media",
      description:
        "10 caption + konsep visual untuk Instagram/TikTok. Tone disesuaikan brand, lengkap dengan hashtag riset dan CTA kuat.",
      basePrice: "500000",
      revisionLimit: 2,
      deliveryDays: 4,
      imageUrls: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800"],
    },
    {
      title: "UI/UX Design Mobile App",
      slug: "ui-ux-design-mobile-app",
      description:
        "Desain interface untuk mobile app (iOS & Android). Termasuk wireframe, mockup hi-fi di Figma, dan prototype interaktif. Maksimal 10 screen utama.",
      basePrice: "5000000",
      revisionLimit: 3,
      deliveryDays: 14,
      imageUrls: ["https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800"],
    },
    {
      title: "Penerjemahan Dokumen ID-EN (10 Halaman)",
      slug: "penerjemahan-dokumen-id-en",
      description:
        "Terjemahan akurat dokumen Indonesia ke Inggris (atau sebaliknya). 10 halaman A4, proofread native speaker. Cocok untuk legal, akademik, bisnis.",
      basePrice: "400000",
      revisionLimit: 1,
      deliveryDays: 3,
      imageUrls: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800"],
    },
  ];

  const services = await Promise.all(
    servicesData.map((s) =>
      prisma.service.upsert({
        where: { slug: s.slug },
        update: {},
        create: s,
      }),
    ),
  );

  const [client1, client2, client3] = clients;
  const [logo, landing, video] = services;

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        clientId: client1.id,
        serviceId: logo.id,
        status: "IN_PROGRESS",
        totalAmount: logo.basePrice,
        briefNotes: "Logo untuk coffee shop minimalis, warna earthy tone (cokelat, hijau zaitun).",
        dueDate: new Date(Date.now() + 5 * 24 * 3600_000),
      },
    }),
    prisma.order.create({
      data: {
        clientId: client2.id,
        serviceId: landing.id,
        status: "REVIEW",
        totalAmount: landing.basePrice,
        briefNotes: "Landing page untuk produk SaaS bookkeeping UMKM. Hero, fitur, pricing, FAQ.",
        deliveryFileUrl: "https://example.com/deliverables/landing-v1.zip",
        dueDate: new Date(Date.now() + 2 * 24 * 3600_000),
      },
    }),
    prisma.order.create({
      data: {
        clientId: client3.id,
        serviceId: video.id,
        status: "COMPLETED",
        totalAmount: video.basePrice,
        briefNotes: "Video promosi launching produk skincare baru.",
        deliveryFileUrl: "https://example.com/deliverables/promo.mp4",
        dueDate: new Date(Date.now() - 3 * 24 * 3600_000),
      },
    }),
    prisma.order.create({
      data: {
        clientId: client1.id,
        serviceId: landing.id,
        status: "PENDING",
        totalAmount: landing.basePrice,
        briefNotes: "Landing page event tahunan komunitas developer.",
      },
    }),
  ]);

  const room1 = await prisma.chatRoom.upsert({
    where: {
      clientId_adminId_serviceId: {
        clientId: client1.id,
        adminId: admin.id,
        serviceId: logo.id,
      },
    },
    update: {},
    create: { clientId: client1.id, adminId: admin.id, serviceId: logo.id },
  });

  const room2 = await prisma.chatRoom.upsert({
    where: {
      clientId_adminId_serviceId: {
        clientId: client2.id,
        adminId: admin.id,
        serviceId: landing.id,
      },
    },
    update: {},
    create: { clientId: client2.id, adminId: admin.id, serviceId: landing.id },
  });

  await prisma.message.createMany({
    data: [
      { roomId: room1.id, senderId: client1.id, content: "Halo, saya tertarik dengan jasa logo." },
      { roomId: room1.id, senderId: admin.id, content: "Halo Budi! Boleh share referensi visual yang Anda suka?" },
      { roomId: room1.id, senderId: client1.id, content: "Saya suka style minimalis. Apakah bisa pakai warna earthy?" },
      {
        roomId: room1.id,
        senderId: admin.id,
        content: "Bisa! Saya tawarkan paket khusus dengan 3 konsep + 5 revisi.",
        isCustomOffer: true,
        offerPrice: "950000",
      },

      { roomId: room2.id, senderId: client2.id, content: "Untuk landing page, apakah include hosting?" },
      { roomId: room2.id, senderId: admin.id, content: "Belum, tapi saya bantu setup deploy di Vercel gratis." },
    ],
  });

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
        comment: "Hasil video sangat memuaskan, pengerjaan cepat dan komunikatif!",
      },
    });
  }

  console.log("✅ Seed selesai:");
  console.log(`   Users   : ${clients.length + 1} (1 admin, ${clients.length} client)`);
  console.log(`   Services: ${services.length}`);
  console.log(`   Orders  : ${orders.length}`);
  console.log(`   Rooms   : 2 (dengan beberapa pesan)`);
  console.log(`   Reviews : 1`);
  console.log("");
  console.log("🔑 Login kredensial (semua):");
  console.log("   admin@mahasewa.id / password123");
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
