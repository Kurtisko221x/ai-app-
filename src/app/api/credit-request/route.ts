import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const schema = z.object({
  reason: z.string().trim().min(5, "Napíš aspoň krátky dôvod").max(500),
});

// Používateľ požiada o free kredity (dôvod). Admin to potom schváli v /admin.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });

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

  // Zabránime spamu — max 1 čakajúca žiadosť naraz
  const pending = await prisma.creditRequest.findFirst({
    where: { userId: user.id, status: "pending" },
  });
  if (pending) {
    return Response.json(
      { error: "Už máš čakajúcu žiadosť. Počkaj na jej vybavenie. 🙏" },
      { status: 409 }
    );
  }

  await prisma.creditRequest.create({
    data: { userId: user.id, reason: data.reason },
  });
  return Response.json({ ok: true });
}
