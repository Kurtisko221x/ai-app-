import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Načíta správy jedného chatu (po kliknutí v bočnom paneli)
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/chats/[id]">
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });
  const { id } = await ctx.params;

  const chat = await prisma.chat.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
      },
    },
  });
  if (!chat) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ chat });
}

// Premenuje chat
export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/chats/[id]">
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const title = (body.title ?? "").toString().trim().slice(0, 80);
  if (!title) return Response.json({ error: "empty" }, { status: 400 });

  await prisma.chat.updateMany({
    where: { id, userId: user.id },
    data: { title },
  });
  return Response.json({ ok: true, title });
}

// Zmaže chat
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/chats/[id]">
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });
  const { id } = await ctx.params;

  await prisma.chat.deleteMany({ where: { id, userId: user.id } });
  return Response.json({ ok: true });
}
