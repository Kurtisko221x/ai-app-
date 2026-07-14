import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(3500),
});

// Admin pošle novinku → objaví sa v Discord kanáli #oznamy (cez webhook).
export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const webhook = process.env.DISCORD_ANNOUNCE_WEBHOOK;
  if (!webhook) {
    return Response.json(
      {
        error:
          "Chýba DISCORD_ANNOUNCE_WEBHOOK. Vytvor webhook v kanáli #oznamy a pridaj URL do premenných.",
      },
      { status: 500 }
    );
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

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "XSkinny AI",
      embeds: [
        {
          title: "📣 " + data.title,
          description: data.body,
          color: 0x2f9bff,
          footer: { text: "XSkinny AI scripter · novinka" },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!res.ok) {
    return Response.json(
      { error: `Discord webhook zlyhal (${res.status})` },
      { status: 502 }
    );
  }
  return Response.json({ ok: true });
}
