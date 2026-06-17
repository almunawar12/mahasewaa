import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function NewChatPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { serviceId } = await searchParams;

  if (!serviceId) redirect("/services");

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/chat/new?serviceId=${encodeURIComponent(serviceId)}`);
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { id: true },
  });
  if (!service) redirect("/services");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) redirect("/services?error=no_admin");

  const room = await prisma.chatRoom.upsert({
    where: {
      clientId_adminId_serviceId: {
        clientId: session.user.id,
        adminId: admin.id,
        serviceId: service.id,
      },
    },
    create: {
      clientId: session.user.id,
      adminId: admin.id,
      serviceId: service.id,
    },
    update: {},
  });

  redirect(`/chat/${room.id}`);
}
