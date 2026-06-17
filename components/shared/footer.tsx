import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#c3c6d7] bg-[#eceef0]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-16">
        <div className="text-xl font-bold text-[#191c1e]">MahaSewa</div>
        <div className="flex gap-6">
          <Link href="#" className="text-xs font-medium text-[#54647a] transition-colors hover:text-[#004ac6]">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs font-medium text-[#54647a] transition-colors hover:text-[#004ac6]">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs font-medium text-[#54647a] transition-colors hover:text-[#004ac6]">
            Support
          </Link>
        </div>
        <div className="text-sm text-[#54647a]">© {new Date().getFullYear()} MahaSewa. All rights reserved.</div>
      </div>
    </footer>
  );
}
