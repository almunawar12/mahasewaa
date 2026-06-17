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
        service: { select: { title: true, slug: true } },
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
              <div className="px-6 py-8 text-center">
                <p className="mb-3 text-sm text-slate-500">Belum ada percakapan.</p>
                <Link
                  href="/services"
                  className="text-sm font-medium text-[#004ac6] underline"
                >
                  Mulai dari halaman jasa
                </Link>
              </div>
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
