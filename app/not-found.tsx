import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-20">
      <h2 className="text-2xl font-bold">404 · Tidak ditemukan</h2>
      <p className="text-sm text-slate-500">Halaman yang dicari tidak ada.</p>
      <Link href="/">
        <Button>Kembali ke beranda</Button>
      </Link>
    </main>
  );
}
