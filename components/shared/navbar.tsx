import Link from "next/link";
import { Suspense } from "react";
import { auth, signOut } from "@/auth";
import { SearchBar } from "@/components/features/search-bar";

export async function Navbar() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#c3c6d7] bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 md:px-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#004ac6]">
            MahaSewa
          </Link>
          <Suspense fallback={<div className="hidden w-64 md:block lg:w-96" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/services"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] transition-colors hover:bg-[#f2f4f6] hover:text-[#004ac6]"
          >
            Browse
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-medium text-[#191c1e] transition-colors hover:text-[#004ac6]"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-medium text-[#191c1e] transition-colors hover:text-[#004ac6]"
              >
                Dashboard
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-[#c3c6d7] px-4 py-2 text-sm font-medium text-[#191c1e] transition-colors hover:text-[#004ac6]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger — wired in Task 9 */}
        <button className="md:hidden text-[#191c1e]" aria-label="Menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}
