import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Chat Inbox" };

export default async function AdminChatInboxPage() {
  const rooms = await prisma.chatRoom.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true } },
      client: { select: { fullName: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chat Inbox"
        description={`${rooms.length} percakapan`}
      />

      {rooms.length === 0 ? (
        <AdminEmptyState message="Belum ada percakapan." />
      ) : (
        <Card>
          {rooms.map((r) => {
            const lastMsg = r.messages[0];
            const isRecent = lastMsg && new Date(lastMsg.createdAt) > oneDayAgo;
            return (
              <Link
                key={r.id}
                href={`/chat/${r.id}`}
                className="relative flex items-center justify-between border-b border-slate-200 px-6 py-4 last:border-0 hover:bg-slate-50"
              >
                {isRecent && (
                  <span className="absolute right-6 top-4 h-2 w-2 rounded-full bg-emerald-500" />
                )}
                <div className="min-w-0 pr-8">
                  <p className="font-medium">{r.client.fullName}</p>
                  <p className="text-xs text-slate-500">{r.service.title}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                    {lastMsg?.content ?? "Belum ada pesan"}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  <p>{r._count.messages} pesan</p>
                  <p>{new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
