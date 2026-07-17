import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const MAX_LEN = 120_000; // ~90 KB obrázok (klient posiela zmenšený JPEG data URL)

// Nastaví profilovú fotku (malý data URL z klienta).
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const avatar = (body.avatar ?? "").toString();

  if (!avatar.startsWith("data:image/jpeg;base64,") && !avatar.startsWith("data:image/png;base64,")) {
    return Response.json({ error: "Neplatný obrázok" }, { status: 400 });
  }
  if (avatar.length > MAX_LEN) {
    return Response.json({ error: "Obrázok je príliš veľký" }, { status: 413 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { avatar } });
  return Response.json({ ok: true });
}

// Odstráni profilovú fotku
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });
  await prisma.user.update({ where: { id: user.id }, data: { avatar: null } });
  return Response.json({ ok: true });
}
