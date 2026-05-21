export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} MahaSewa. Marketplace jasa digital.</p>
        <p>Built with Next.js, Prisma, Tailwind.</p>
      </div>
    </footer>
  );
}
