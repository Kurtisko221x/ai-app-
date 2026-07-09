import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, isAdminEmail } from "@/lib/auth";
import { FREE_CREDITS } from "@/lib/plans";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1).max(60).optional().or(z.literal("")),
  robloxName: z.string().trim().max(60).optional().or(z.literal("")),
  robloxUrl: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("Neplatný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov").max(100),
});

export async function POST(request: Request) {
  let data;
  try {
    data = schema.parse(await request.json());
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues[0]?.message ?? "Neplatné údaje"
        : "Neplatné údaje";
    return Response.json({ error: msg }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return Response.json(
      { error: "Účet s týmto emailom už existuje. Prihlás sa." },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name || null,
      robloxName: data.robloxName || null,
      robloxUrl: data.robloxUrl || null,
      passwordHash: await hashPassword(data.password),
      credits: FREE_CREDITS,
      role: isAdminEmail(data.email) ? "admin" : "user",
    },
    select: { id: true },
  });

  await createSession(user.id);
  return Response.json({ ok: true });
}
