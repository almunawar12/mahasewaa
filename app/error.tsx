"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-20">
      <h2 className="text-xl font-semibold">Ada yang tidak beres.</h2>
      <p className="max-w-md text-center text-sm text-slate-500">{error.message}</p>
      <Button onClick={reset}>Coba lagi</Button>
    </main>
  );
}
