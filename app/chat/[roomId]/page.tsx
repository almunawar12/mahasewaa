import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/navbar";
import { ChatBox } from "@/components/features/chat-box";

export const metadata = { title: "Percakapan" };

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const room = await prisma.chatRoom
    .findFirst({
      where: { id: roomId, OR: [{ clientId: userId }, { adminId: userId }] },
      include: {
        service: { select: { title: true } },
        messages: { orderBy: { createdAt: "asc" }, take: 100 },
      },
    })
    .catch(() => null);

  if (!room) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <header className="mb-4">
          <h1 className="text-xl font-bold">{room.service.title}</h1>
          <p className="text-xs text-slate-500">Ruang chat #{room.id.slice(0, 8)}</p>
        </header>
        <ChatBox
          roomId={room.id}
          currentUserId={userId}
          initialMessages={room.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            content: m.content,
            isCustomOffer: m.isCustomOffer,
            offerPrice: m.offerPrice ? Number(m.offerPrice) : undefined,
          }))}
        />
      </main>
    </>
  );
}
