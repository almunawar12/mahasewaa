import { requireAdmin } from "@/lib/admin-guard";
import { AdminShell } from "@/components/shared/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return <AdminShell session={session}>{children}</AdminShell>;
}
