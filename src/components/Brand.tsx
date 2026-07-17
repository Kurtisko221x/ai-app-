"use client";

import { useState } from "react";

// Avatar XSkinny — načíta /xskinny-avatar.png ak existuje, inak pekný fallback (🎮).
// Ulož svoj Roblox avatar sem: roblox-ai/public/xskinny-avatar.png
export function Avatar({ size = 34 }: { size?: number }) {
  const [ok, setOk] = useState(true);
  return (
    <span
      className="xs-avatar"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/xskinny-avatar.png"
          alt="XSkinny"
          onError={() => setOk(false)}
        />
      ) : (
        "🎮"
      )}
    </span>
  );
}

export function BrandName({ small = false }: { small?: boolean }) {
  return (
    <span className={`xs-brandname ${small ? "sm" : ""}`}>
      XSkinny <span className="xs-grad">AI</span>
    </span>
  );
}

// Avatar AI agenta v chate — načíta /ai-agent.png (ulož obrázok agenta sem),
// fallback na XSkinny avatar. Má neónový ring.
export function AiAvatar({ size = 34 }: { size?: number }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <Avatar size={size} />;
  return (
    <span
      className="xs-avatar ai-ring"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ai-agent.png" alt="XSkinny AI" onError={() => setOk(false)} />
    </span>
  );
}
