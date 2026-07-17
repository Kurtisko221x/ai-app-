import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 2 * 60 * 1000; // online = aktivita za posledné 2 min

// Heartbeat — klient volá každú minútu, označí používateľa ako online.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenAt: new Date() },
  });
  return Response.json({ ok: true });
}

// Zoznam online používateľov (meno + avatar).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ users: [] }, { status: 401 });

  const since = new Date(Date.now() - ONLINE_WINDOW_MS);
  const users = await prisma.user.findMany({
    where: { lastSeenAt: { gte: since } },
    orderBy: { lastSeenAt: "desc" },
    take: 30,
    select: { id: true, name: true, email: true, avatar: true },
  });

  return Response.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name || u.email.split("@")[0],
      avatar: u.avatar,
      me: u.id === user.id,
    })),
  });
}
