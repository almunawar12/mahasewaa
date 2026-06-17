"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";

interface NavbarClientProps {
  session: Session | null;
  signOutAction: () => Promise<void>;
}

export function NavbarClient({ session, signOutAction }: NavbarClientProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden text-[#191c1e]"
        aria-label="Menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">
          {open ? "close" : "menu"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-16 z-40 w-full flex-col border-t border-[#c3c6d7] bg-white px-4 py-3 shadow-lg md:hidden flex">
          <Link
            href="/services"
            onClick={close}
            className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
          >
            Browse
          </Link>

          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                onClick={close}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
              >
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Keluar
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#434655] hover:bg-[#f2f4f6] hover:text-[#004ac6]"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="rounded-lg bg-[#2563eb] mx-3 my-1 px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
