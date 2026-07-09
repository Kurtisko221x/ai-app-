import { getUserByApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Plugin toto pravidelne volá (polling). Vráti čakajúce skripty a zmaže ich z fronty.
// Auth: Authorization: Bearer xsk_...
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const key = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : auth.trim();
  const user = await getUserByApiKey(key);
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });

  const jobs = await prisma.studioJob.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  if (jobs.length > 0) {
    await prisma.studioJob.deleteMany({
      where: { id: { in: jobs.map((j) => j.id) } },
    });
  }

  return Response.json({
    scripts: jobs.map((j) => ({
      name: j.name,
      className: j.className,
      target: j.target,
      source: j.source,
    })),
  });
}
