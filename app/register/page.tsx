import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Daftar" };

const CHIP_ROWS = [
  ["Desain Logo", "Web Development", "Copywriting", "UI/UX Design", "Fotografi"],
  ["Video Editing", "Brand Identity", "SEO Optimization", "Motion Graphic", "Ilustrasi"],
  ["App Development", "Social Media", "Email Marketing", "3D Modeling", "Konten Kreatif"],
  ["Desain Logo", "Web Development", "Copywriting", "UI/UX Design", "Fotografi"],
  ["Video Editing", "Brand Identity", "SEO Optimization", "Motion Graphic", "Ilustrasi"],
];

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  async function register(formData: FormData) {
    "use server";
    const parsed = registerSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("fullName"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) throw new Error("Email sudah terdaftar");

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        fullName: parsed.data.fullName,
        role: "CLIENT",
      },
    });

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — desktop only ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[40%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0055e6 0%, #003a9e 100%)" }}
      >
        {/* Chip texture */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none"
          aria-hidden="true"
        >
          <div
            className="flex flex-col gap-4 mt-[-2rem] ml-[-4rem]"
            style={{ transform: "rotate(-8deg) scale(1.35)", transformOrigin: "center" }}
          >
            {CHIP_ROWS.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="flex gap-3 flex-nowrap"
                style={{ marginLeft: rowIdx % 2 === 1 ? "5rem" : "0" }}
              >
                {row.map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium"
                    style={{
                      border: "1px solid rgba(255,255,255,0.22)",
                      color: "rgba(255,255,255,0.22)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
          <Link
            href="/"
            className="text-[1.35rem] font-bold tracking-tight text-white"
          >
            MahaSewa
          </Link>

          <div className="mt-auto">
            <p
              className="mb-4 text-[10px] font-semibold uppercase text-white/50"
              style={{ letterSpacing: "0.22em" }}
            >
              Platform Jasa Digital
            </p>
            <h2 className="text-[2rem] xl:text-[2.5rem] font-bold leading-[1.15] tracking-tight text-white">
              Mulai perjalanan<br />
              digital Anda.
            </h2>
            <p className="mt-5 max-w-[26ch] text-[0.9375rem] leading-relaxed text-white/60">
              Bergabung dengan ribuan klien yang sudah menemukan freelancer terbaik di MahaSewa.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile wordmark */}
          <Link
            href="/"
            className="mb-8 block text-xl font-bold tracking-tight text-[#004ac6] lg:hidden"
          >
            MahaSewa
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[1.625rem] font-bold tracking-tight text-[#191c1e]">
              Buat akun baru
            </h1>
            <p className="mt-1.5 text-sm text-[#434655]">
              Gratis. Tidak perlu kartu kredit.
            </p>
          </div>

          {/* Form */}
          <form action={register} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#191c1e]">
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                required
                placeholder="Budi Santoso"
                className="h-11 border-[#c3c6d7] placeholder:text-[#c3c6d7] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-[#191c1e]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nama@email.com"
                className="h-11 border-[#c3c6d7] placeholder:text-[#c3c6d7] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-[#191c1e]">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Min. 8 karakter"
                className="h-11 border-[#c3c6d7] placeholder:text-[#c3c6d7] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/10"
              />
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-[#004ac6] py-[0.6875rem] text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              Buat Akun
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#434655]">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#004ac6] hover:underline"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
