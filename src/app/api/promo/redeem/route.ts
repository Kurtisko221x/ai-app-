import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(1, "Zadaj promo kód").max(60),
});

// Používateľ zadá promo kód → dostane kredity.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });

  let data;
  try {
    data = schema.parse(await request.json());
  } catch {
    return Response.json({ error: "Zadaj promo kód" }, { status: 400 });
  }

  const code = data.code.toUpperCase();
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) {
    return Response.json({ error: "Neplatný promo kód." }, { status: 404 });
  }
  if (promo.uses >= promo.maxUses) {
    return Response.json(
      { error: "Tento promo kód už bol vyčerpaný." },
      { status: 410 }
    );
  }

  // Už použil tento kód?
  const already = await prisma.promoRedemption.findUnique({
    where: { codeId_userId: { codeId: promo.id, userId: user.id } },
  });
  if (already) {
    return Response.json(
      { error: "Tento kód si už použil. 🙂" },
      { status: 409 }
    );
  }

  // Pripíšeme kredity + zaznamenáme použitie (v transakcii)
  await prisma.$transaction([
    prisma.promoRedemption.create({
      data: { codeId: promo.id, userId: user.id },
    }),
    prisma.promoCode.update({
      where: { id: promo.id },
      data: { uses: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: promo.credits } },
    }),
  ]);

  return Response.json({ ok: true, credits: promo.credits });
}
