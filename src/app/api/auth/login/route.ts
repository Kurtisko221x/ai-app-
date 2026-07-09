import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Neplatný email"),
  password: z.string().min(1, "Zadaj heslo"),
});

export async function POST(request: Request) {
  let data;
  try {
    data = schema.parse(await request.json());
  } catch {
    return Response.json({ error: "Neplatné údaje" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  // Rovnaká hláška pri zlom emaili aj hesle (neprezrádzame či email existuje)
  const invalid = Response.json(
    { error: "Nesprávny email alebo heslo" },
    { status: 401 }
  );
  if (!user) return invalid;

  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) return invalid;

  await createSession(user.id);
  return Response.json({ ok: true });
}
