import type { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  amount: z.number().int().min(1).max(100000).optional(),
});

// Admin schváli / zamietne žiadosť o kredity. Pri schválení pripíše kredity.
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/credit-request/[id]">
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;

  let data;
  try {
    data = schema.parse(await request.json());
  } catch {
    return Response.json({ error: "Neplatné údaje" }, { status: 400 });
  }

  const req = await prisma.creditRequest.findUnique({ where: { id } });
  if (!req || req.status !== "pending") {
    return Response.json(
      { error: "Žiadosť neexistuje alebo už bola vybavená." },
      { status: 404 }
    );
  }

  if (data.action === "reject") {
    await prisma.creditRequest.update({
      where: { id },
      data: { status: "rejected", handledAt: new Date() },
    });
    return Response.json({ ok: true });
  }

  const amount = data.amount ?? req.amount;
  await prisma.$transaction([
    prisma.creditRequest.update({
      where: { id },
      data: { status: "approved", amount, handledAt: new Date() },
    }),
    prisma.user.update({
      where: { id: req.userId },
      data: { credits: { increment: amount } },
    }),
  ]);
  return Response.json({ ok: true, granted: amount });
}
