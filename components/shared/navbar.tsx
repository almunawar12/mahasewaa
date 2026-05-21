import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Maha<span className="text-emerald-600">Sewa</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/services" className="text-sm text-slate-600 hover:text-slate-900">
            Jelajah Jasa
          </Link>
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">Keluar</Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Masuk</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
