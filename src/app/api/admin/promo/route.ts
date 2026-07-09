import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Kód musí mať aspoň 3 znaky")
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Iba písmená, čísla, - a _"),
  credits: z.number().int().min(1).max(100000),
  maxUses: z.number().int().min(1).max(1000000),
});

// Admin vytvorí promo kód (na giveaway).
export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

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

  const code = data.code.toUpperCase();
  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    return Response.json({ error: "Tento kód už existuje." }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: { code, credits: data.credits, maxUses: data.maxUses },
  });
  return Response.json({ ok: true, promo });
}

// Admin (de)aktivuje promo kód
export async function PATCH(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") {
    return Response.json({ error: "chýba id" }, { status: 400 });
  }
  await prisma.promoCode.update({
    where: { id: body.id },
    data: { active: !!body.active },
  });
  return Response.json({ ok: true });
}
