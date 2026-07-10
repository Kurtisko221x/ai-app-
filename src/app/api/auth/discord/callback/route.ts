import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { createSession, hashPassword, getCurrentUser } from "@/lib/auth";
import { FREE_CREDITS } from "@/lib/plans";
import { randomBytes } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Discord presmeruje sem s ?code=... — vymeníme za token, načítame profil,
// prepojíme / vytvoríme účet a prihlásime.
export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const fail = (msg: string) =>
    Response.redirect(`${appUrl}/login?error=${encodeURIComponent(msg)}`);

  if (!clientId || !clientSecret) return fail("Discord nie je nakonfigurovaný");
  if (!code) return fail("Chýba kód z Discordu");

  // overenie state (CSRF)
  const store = await cookies();
  const savedState = store.get("discord_oauth_state")?.value;
  if (!savedState || savedState !== state) return fail("Neplatný state");
  store.delete("discord_oauth_state");

  // 1) code -> access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${appUrl}/api/auth/discord/callback`,
    }),
  });
  if (!tokenRes.ok) return fail("Nepodarilo sa overiť cez Discord");
  const token = await tokenRes.json();

  // 2) profil používateľa
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userRes.ok) return fail("Nepodarilo sa načítať Discord profil");
  const dc = await userRes.json();
  const discordId: string = dc.id;
  const discordName: string = dc.global_name || dc.username || "DiscordUser";
  const email: string | null = dc.email ? String(dc.email).toLowerCase() : null;

  // 3) prepojenie / vytvorenie
  // Ak je používateľ práve prihlásený → len prepojíme Discord na jeho účet.
  const current = await getCurrentUser();
  if (current) {
    await prisma.user.update({
      where: { id: current.id },
      data: { discordId, discordName },
    });
    return Response.redirect(`${appUrl}/ucet`);
  }

  // Už existuje účet s týmto Discordom?
  let user = await prisma.user.findUnique({ where: { discordId } });

  // Alebo účet s rovnakým emailom → prepojíme
  if (!user && email) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { discordId, discordName },
      });
    }
  }

  // Inak vytvoríme nový účet
  if (!user) {
    const fakeEmail = email ?? `discord_${discordId}@xskinny.local`;
    // ak by email náhodou kolidoval, pridáme discordId
    const emailToUse = (await prisma.user.findUnique({
      where: { email: fakeEmail },
    }))
      ? `discord_${discordId}@xskinny.local`
      : fakeEmail;

    user = await prisma.user.create({
      data: {
        email: emailToUse,
        name: discordName,
        discordId,
        discordName,
        passwordHash: await hashPassword(randomBytes(24).toString("hex")),
        credits: FREE_CREDITS,
      },
    });
  }

  await createSession(user.id);
  return Response.redirect(`${appUrl}/chat`);
}
