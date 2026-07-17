import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "./db";

const COOKIE_NAME = "roblox_ai_session";
const SESSION_DAYS = 30;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET chýba alebo je príliš krátky (.env.local)");
  }
  return new TextEncoder().encode(secret);
}

// ---------- Heslá ----------
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---------- Session (JWT v httpOnly cookie) ----------
export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function getUserIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  role: string;
  avatar: string | null;
};

// Zoznam admin emailov z .env.local (ADMIN_EMAILS=a@b.com,c@d.com)
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.trim().toLowerCase());
}

// Vráti prihláseného používateľa (bez hesla) alebo null.
export async function getCurrentUser(): Promise<SafeUser | null> {
  const userId = await getUserIdFromCookie();
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      role: true,
      avatar: true,
    },
  });
  if (!user) return null;
  // Bezpečnostná poistka: ak je email v ADMIN_EMAILS, ber ho vždy ako admina.
  if (user.role !== "admin" && isAdminEmail(user.email)) {
    return { ...user, role: "admin" };
  }
  return user;
}

// ---------- API kľúč pre Roblox Studio plugin ----------

// Vygeneruje nový API kľúč (formát: xsk_<64 hex znakov>)
export function generateApiKey(): string {
  return "xsk_" + randomBytes(32).toString("hex");
}

// Nájde používateľa podľa API kľúča (autentifikácia pluginu — bez cookies)
export async function getUserByApiKey(
  key: string | null | undefined
): Promise<{ id: string; credits: number } | null> {
  if (!key || !key.startsWith("xsk_")) return null;
  const user = await prisma.user.findUnique({
    where: { apiKey: key },
    select: { id: true, credits: true },
  });
  return user;
}
