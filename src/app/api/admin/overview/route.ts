import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Kompletný prehľad pre admina: users, žiadosti o kredity, promo kódy.
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const [users, creditRequests, promoCodes, stats] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        robloxName: true,
        robloxUrl: true,
        credits: true,
        role: true,
        createdAt: true,
        _count: { select: { chats: true } },
      },
    }),
    prisma.creditRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        user: {
          select: {
            email: true,
            name: true,
            robloxName: true,
            robloxUrl: true,
            credits: true,
          },
        },
      },
    }),
    prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.aggregate({ _count: true, _sum: { credits: true } }),
  ]);

  return Response.json({
    users,
    creditRequests,
    promoCodes,
    stats: {
      totalUsers: stats._count,
      totalCredits: stats._sum.credits ?? 0,
      pendingRequests: creditRequests.filter((r) => r.status === "pending")
        .length,
    },
  });
}
