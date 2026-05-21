import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chat Inbox</h1>

      <Card>
        <CardContent className="p-0">
          {rooms.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">Belum ada percakapan.</p>
          ) : (
            rooms.map((r) => (
              <Link
                key={r.id}
                href={`/chat/${r.id}`}
                className="flex items-center justify-between border-b border-slate-200 px-6 py-4 last:border-0 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-medium">{r.client.fullName}</p>
                  <p className="text-xs text-slate-500">{r.service.title}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                    {r.messages[0]?.content ?? "Belum ada pesan"}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>{r._count.messages} pesan</p>
                  <p>{new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
