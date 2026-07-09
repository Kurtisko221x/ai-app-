import { ROBLOX_SYSTEM_PROMPT } from "@/lib/prompt";
import { AUTO_MODELS } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CREDITS_PER_MESSAGE } from "@/lib/plans";

// Beží na serveri — OpenRouter kľúč sa NIKDY nedostane ku klientovi.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY = 20; // koľko posledných správ posielame ako kontext
const MAX_CHARS = 8000; // limit dĺžky jednej správy

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { error: "Musíš byť prihlásený. Prihlás sa a skús znova." },
      { status: 401 }
    );
  }

  let body: { chatId?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const content = (body.content ?? "").toString().trim().slice(0, MAX_CHARS);
  if (!content) {
    return Response.json({ error: "Prázdna správa" }, { status: 400 });
  }

  // Odpočítame kredit atomicky
  const deducted = await prisma.user.updateMany({
    where: { id: user.id, credits: { gte: CREDITS_PER_MESSAGE } },
    data: { credits: { decrement: CREDITS_PER_MESSAGE } },
  });
  if (deducted.count === 0) {
    return Response.json(
      {
        error: "Došli ti kredity. Požiadaj o free kredity alebo zadaj promo kód.",
        code: "NO_CREDITS",
      },
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
    return Response.json(
      { error: "Chýba OPENROUTER_API_KEY na serveri (.env.local)" },
      { status: 500 }
    );
  }

  // Nájdeme / vytvoríme chat
  let chat = body.chatId
    ? await prisma.chat.findFirst({
        where: { id: body.chatId, userId: user.id },
      })
    : null;
  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title: content.slice(0, 60),
      },
    });
  }

  // Kontext = predošlé správy z DB + nová
  const prior = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY,
    select: { role: true, content: true },
  });

  // Uložíme novú používateľskú správu
  await prisma.message.create({
    data: { chatId: chat.id, role: "user", content },
  });

  const messagesPayload = [
    { role: "system", content: ROBLOX_SYSTEM_PROMPT },
    ...prior.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content },
  ];

  // Skúšame free modely po poradí, kým jeden nezaberie
  let upstream: Response | null = null;
  let lastStatus = 0;
  let lastText = "";

  for (const model of AUTO_MODELS) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
        "X-Title": "XSkinny AI scripter",
      },
      body: JSON.stringify({
        model,
        stream: true,
        max_tokens: 2048,
        messages: messagesPayload,
      }),
    });
    if (res.ok && res.body) {
      upstream = res;
      break;
    }
    lastStatus = res.status;
    lastText = (await res.text().catch(() => "")).slice(0, 300);
    if (res.status !== 429 && res.status !== 404) break;
  }

  if (!upstream || !upstream.body) {
    await refund();
    const friendly =
      lastStatus === 429
        ? "Všetky AI modely sú práve preťažené. Skús o pár sekúnd znova. 🙏"
        : `Chyba AI (${lastStatus}): ${lastText}`;
    return Response.json({ error: friendly }, { status: 502 });
  }

  // Stream do klienta + priebežné hromadenie odpovede na uloženie do DB
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const chatId = chat.id;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream!.body!.getReader();
      let buffer = "";
      let full = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) {
                full += delta;
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              /* neúplný riadok */
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        // Uložíme odpoveď AI do histórie
        if (full.trim()) {
          await prisma.message
            .create({
              data: { chatId, role: "assistant", content: full },
            })
            .catch(() => {});
          await prisma.chat
            .update({ where: { id: chatId }, data: { updatedAt: new Date() } })
            .catch(() => {});
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "X-Chat-Id": chatId, // klient si podľa toho zapamätá otvorený chat
    },
  });
}
