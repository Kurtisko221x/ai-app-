import { getCurrentUser, generateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vráti aktuálny API kľúč používateľa (pre plugin)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { apiKey: true },
  });
  return Response.json({ apiKey: full?.apiKey ?? null });
}

// Vygeneruje / preregeneruje API kľúč
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });

  const apiKey = generateApiKey();
  await prisma.user.update({
    where: { id: user.id },
    data: { apiKey },
  });
  return Response.json({ apiKey });
}
