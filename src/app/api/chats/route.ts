import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zoznam chatov prihláseného používateľa (pre bočný panel)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ chats: [] }, { status: 401 });

  const chats = await prisma.chat.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
    take: 100,
  });
  return Response.json({ chats });
}
