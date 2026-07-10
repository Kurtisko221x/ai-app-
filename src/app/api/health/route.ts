import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Verejný health check — používa ho Discord bot pre /status.
export async function GET() {
  let db = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    db = false;
  }
  return Response.json(
    {
      status: db ? "ok" : "degraded",
      db,
      service: "XSkinny AI scripter",
      time: new Date().toISOString(),
    },
    { status: db ? 200 : 503 }
  );
}
