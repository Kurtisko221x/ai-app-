"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Avatar, BrandName } from "./Brand";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/chat";

  const [name, setName] = useState("");
  const [robloxName, setRobloxName] = useState("");
  const [robloxUrl, setRobloxUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignup
            ? { name, robloxName, robloxUrl, email, password }
            : { email, password }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Niečo sa pokazilo");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <Avatar size={30} /> <BrandName small />
        </Link>
        <h1>{isSignup ? "Vytvor si účet" : "Vitaj späť"}</h1>
        <p className="auth-sub">
          {isSignup
            ? "Zaregistruj sa a dostaneš kredity zadarmo na vyskúšanie."
            : "Prihlás sa a pokračuj v skriptovaní."}
        </p>

        <form onSubmit={onSubmit} className="auth-form">
          {isSignup && (
            <>
              <label>
                Meno (nepovinné)
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ako ťa máme volať?"
                  autoComplete="name"
                />
              </label>
              <label>
                Roblox meno (nepovinné)
                <input
                  type="text"
                  value={robloxName}
                  onChange={(e) => setRobloxName(e.target.value)}
                  placeholder="tvoj Roblox username"
                />
              </label>
              <label>
                URL Roblox profilu (nepovinné)
                <input
                  type="text"
                  value={robloxUrl}
                  onChange={(e) => setRobloxUrl(e.target.value)}
                  placeholder="https://www.roblox.com/users/..."
                />
              </label>
            </>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tvoj@email.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Heslo
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "aspoň 6 znakov" : "tvoje heslo"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </label>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Moment..."
              : isSignup
                ? "Zaregistrovať sa"
                : "Prihlásiť sa"}
          </button>
        </form>

        <div className="auth-switch">
          {isSignup ? (
            <>
              Už máš účet? <Link href="/login">Prihlás sa</Link>
            </>
          ) : (
            <>
              Nemáš účet? <Link href="/signup">Zaregistruj sa</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
