import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Presmeruje používateľa na Discord prihlásenie (OAuth2).
export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (!clientId) {
    return Response.json(
      { error: "Chýba DISCORD_CLIENT_ID na serveri." },
      { status: 500 }
    );
  }

  const redirectUri = `${appUrl}/api/auth/discord/callback`;
  const state = randomBytes(16).toString("hex");

  // uložíme state do krátkodobej cookie (ochrana proti CSRF)
  const store = await cookies();
  store.set("discord_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify email");
  url.searchParams.set("state", state);

  return Response.redirect(url.toString());
}
