"use client";

import { useEffect, useState } from "react";

export default function PluginKeyPanel() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/plugin/key")
      .then((r) => r.json())
      .then((d) => setApiKey(d.apiKey ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/plugin/key", { method: "POST" });
      const d = await res.json();
      if (d.apiKey) {
        setApiKey(d.apiKey);
        setRevealed(true);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function copy() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const masked = apiKey
    ? apiKey.slice(0, 8) + "•".repeat(20) + apiKey.slice(-4)
    : "";

  return (
    <div className="acc-box plugin-box">
      <h3>🎮 Roblox Studio plugin</h3>
      <p>
        Tento API kľúč vlož do XSkinny AI pluginu v Roblox Studio — potom môžeš
        generovať skripty priamo v editore.
      </p>

      {loading ? (
        <div className="td-sub">Načítavam…</div>
      ) : apiKey ? (
        <>
          <div className="apikey-row">
            <code className="apikey-value">{revealed ? apiKey : masked}</code>
            <button
              className="apikey-btn"
              onClick={() => setRevealed((v) => !v)}
              type="button"
            >
              {revealed ? "Skryť" : "Zobraziť"}
            </button>
            <button className="apikey-btn" onClick={copy} type="button">
              {copied ? "✓" : "Kopírovať"}
            </button>
          </div>
          <button
            className="btn btn-ghost sm"
            onClick={generate}
            disabled={generating}
            type="button"
          >
            {generating ? "..." : "Vygenerovať nový (starý prestane platiť)"}
          </button>
        </>
      ) : (
        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={generating}
          type="button"
        >
          {generating ? "..." : "Vygenerovať API kľúč"}
        </button>
      )}

      <p className="modal-note" style={{ textAlign: "left", marginTop: 14 }}>
        📦 Nemáš plugin? Stiahni ho a návod nájdeš{" "}
        <a href="/plugin" target="_blank" rel="noreferrer">
          tu
        </a>
        .
      </p>
    </div>
  );
}
