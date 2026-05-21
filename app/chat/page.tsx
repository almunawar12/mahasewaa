import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Chat" };

export default async function ChatListPage() {
  const session = await auth();
  const userId = session!.user.id;

  const rooms = await prisma.chatRoom
    .findMany({
      where: { OR: [{ clientId: userId }, { adminId: userId }] },
      orderBy: { createdAt: "desc" },
      include: {
        service: { select: { title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })
    .catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Percakapan</h1>
        <Card>
          <CardHeader>
            <CardTitle>Ruang Chat Anda</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rooms.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-500">Belum ada percakapan.</p>
            ) : (
              rooms.map((r) => (
                <Link
                  key={r.id}
                  href={`/chat/${r.id}`}
                  className="flex items-center justify-between border-b border-slate-200 px-6 py-3 last:border-0 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium">{r.service.title}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">
                      {r.messages[0]?.content ?? "Belum ada pesan"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
