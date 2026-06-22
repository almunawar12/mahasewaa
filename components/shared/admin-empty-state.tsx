import Link from "next/link";
import { Inbox } from "lucide-react";

interface AdminEmptyStateProps {
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

export function AdminEmptyState({ message, actionHref, actionLabel }: AdminEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <Inbox size={40} className="mx-auto mb-3 text-slate-300" />
      <p className="text-sm text-slate-500">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
