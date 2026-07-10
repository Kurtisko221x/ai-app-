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

        <div className="auth-divider">
          <span>alebo</span>
        </div>
        <a href="/api/auth/discord" className="discord-btn">
          <svg width="20" height="20" viewBox="0 0 127 96" fill="currentColor">
            <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
          </svg>
          Prihlásiť sa cez Discord
        </a>

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
