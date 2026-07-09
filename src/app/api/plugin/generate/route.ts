import { PLUGIN_SYSTEM_PROMPT } from "@/lib/prompt";
import { AUTO_MODELS } from "@/lib/models";
import { getUserByApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CREDITS_PER_MESSAGE } from "@/lib/plans";
import { parsePluginResponse } from "@/lib/pluginParse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 4000;

// Volané Roblox Studio pluginom (cez HttpService). Auth cez API kľúč v hlavičke:
//   Authorization: Bearer xsk_....
export async function POST(request: Request) {
  // 1) Autentifikácia API kľúčom
  const auth = request.headers.get("authorization") ?? "";
  const key = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : auth.trim();
  const user = await getUserByApiKey(key);
  if (!user) {
    return Response.json(
      { error: "Neplatný API kľúč. Vygeneruj si ho na svojom účte." },
      { status: 401 }
    );
  }

  // 2) Vstup
  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").toString().trim().slice(0, MAX_CHARS);
  if (!prompt) {
    return Response.json({ error: "Prázdna požiadavka" }, { status: 400 });
  }

  // 3) Kredit
  const deducted = await prisma.user.updateMany({
    where: { id: user.id, credits: { gte: CREDITS_PER_MESSAGE } },
    data: { credits: { decrement: CREDITS_PER_MESSAGE } },
  });
  if (deducted.count === 0) {
    return Response.json(
      { error: "Došli ti kredity. Doplň si ich na webe XSkinny AI.", code: "NO_CREDITS" },
      { status: 402 }
    );
  }

  async function refund() {
    await prisma.user.update({
      where: { id: user!.id },
      data: { credits: { increment: CREDITS_PER_MESSAGE } },
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    await refund();
    return Response.json({ error: "Server: chýba OPENROUTER_API_KEY" }, { status: 500 });
  }

  // 4) Generovanie (nestreamované — plugin dostane celú odpoveď naraz)
  const messages = [
    { role: "system", content: PLUGIN_SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  let content = "";
  let ok = false;
  let lastStatus = 0;

  for (const model of AUTO_MODELS) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
        "X-Title": "XSkinny AI scripter (plugin)",
      },
      body: JSON.stringify({
        model,
        stream: false,
        max_tokens: 3000,
        messages,
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const c = data?.choices?.[0]?.message?.content;
      if (typeof c === "string" && c.trim()) {
        content = c;
        ok = true;
        break;
      }
    }
    lastStatus = res.status;
    if (res.status !== 429 && res.status !== 404) break;
  }

  if (!ok) {
    await refund();
    const msg =
      lastStatus === 429
        ? "AI modely sú práve preťažené. Skús o chvíľu znova."
        : `Chyba AI (${lastStatus || "?"})`;
    return Response.json({ error: msg }, { status: 502 });
  }

  // 5) Rozparsovanie na skripty
  const parsed = parsePluginResponse(content);

  const fresh = await prisma.user.findUnique({
    where: { id: user.id },
    select: { credits: true },
  });

  return Response.json({
    explanation: parsed.explanation,
    scripts: parsed.scripts,
    credits: fresh?.credits ?? 0,
  });
}
