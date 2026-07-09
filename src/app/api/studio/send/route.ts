import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractScripts } from "@/lib/extractScripts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Web zavolá po kliknutí "Poslať do Studia" — z markdown správy vytiahne skripty
// a pridá ich do fronty (StudioJob), odkiaľ si ich plugin vyzdvihne.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauth" }, { status: 401 });

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const content = (body.content ?? "").toString();
  const scripts = extractScripts(content).slice(0, 10); // max 10 naraz

  if (scripts.length === 0) {
    return Response.json(
      { error: "V tejto odpovedi som nenašiel žiadny skript na vloženie." },
      { status: 400 }
    );
  }

  await prisma.studioJob.createMany({
    data: scripts.map((s) => ({
      userId: user.id,
      name: s.name,
      className: s.className,
      target: s.target,
      source: s.source,
    })),
  });

  return Response.json({ ok: true, count: scripts.length });
}
