"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(pathname === "/services" ? (searchParams.get("q") ?? "") : "");
  }, [pathname, searchParams]);

  function search() {
    const q = value.trim();
    router.push(q ? `/services?q=${encodeURIComponent(q)}` : "/services");
  }

  return (
    <div className="relative hidden w-64 md:flex lg:w-96">
      <button
        type="button"
        onClick={search}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#004ac6]"
        aria-label="Cari"
      >
        <span className="material-symbols-outlined">search</span>
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && search()}
        placeholder="Cari jasa..."
        className="w-full rounded-lg border border-[#c3c6d7] bg-[#f7f9fb] py-2 pl-10 pr-4 text-sm transition-all focus:border-[#004ac6] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/10"
      />
    </div>
  );
}
