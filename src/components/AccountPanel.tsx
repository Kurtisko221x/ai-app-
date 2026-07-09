"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPanel({ credits }: { credits: number }) {
  const router = useRouter();
  const [bal, setBal] = useState(credits);

  // promo
  const [code, setCode] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [promoLoading, setPromoLoading] = useState(false);

  // credit request
  const [reason, setReason] = useState("");
  const [reqMsg, setReqMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [reqLoading, setReqLoading] = useState(false);

  async function redeem() {
    if (!code.trim()) return;
    setPromoLoading(true);
    setPromoMsg(null);
    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Neplatný kód");
      setBal((b) => b + (data.credits ?? 0));
      setPromoMsg({ ok: true, text: `Pripísaných +${data.credits} kreditov! 🎉` });
      setCode("");
      router.refresh();
    } catch (err) {
      setPromoMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Chyba",
      });
    } finally {
      setPromoLoading(false);
    }
  }

  async function requestCredits() {
    if (reason.trim().length < 5) {
      setReqMsg({ ok: false, text: "Napíš aspoň krátky dôvod (min. 5 znakov)." });
      return;
    }
    setReqLoading(true);
    setReqMsg(null);
    try {
      const res = await fetch("/api/credit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Chyba");
      setReqMsg({
        ok: true,
        text: "Žiadosť odoslaná! Owner ju čoskoro vybaví. 🙏",
      });
      setReason("");
    } catch (err) {
      setReqMsg({ ok: false, text: err instanceof Error ? err.message : "Chyba" });
    } finally {
      setReqLoading(false);
    }
  }

  return (
    <div className="acc-panel">
      <div className="acc-box">
        <h3>🎁 Promo kód</h3>
        <p>Máš promo kód z giveawayu? Zadaj ho a získaj kredity.</p>
        <div className="acc-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="NAPR-KOD-2026"
            className="acc-input"
          />
          <button
            className="btn btn-primary"
            onClick={redeem}
            disabled={promoLoading}
            type="button"
          >
            {promoLoading ? "..." : "Uplatniť"}
          </button>
        </div>
        {promoMsg && (
          <div className={promoMsg.ok ? "acc-ok" : "acc-err"}>
            {promoMsg.ok ? "✅ " : "⚠️ "}
            {promoMsg.text}
          </div>
        )}
      </div>

      <div className="acc-box">
        <h3>⚡ Požiadať o free kredity</h3>
        <p>Napíš dôvod — owner (XSkinny) to skontroluje a pridelí kredity.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Na čom pracuješ a prečo potrebuješ kredity?"
          className="acc-textarea"
          rows={3}
        />
        <button
          className="btn btn-outline"
          onClick={requestCredits}
          disabled={reqLoading}
          type="button"
        >
          {reqLoading ? "Odosielam..." : "Odoslať žiadosť"}
        </button>
        {reqMsg && (
          <div className={reqMsg.ok ? "acc-ok" : "acc-err"}>
            {reqMsg.ok ? "✅ " : "⚠️ "}
            {reqMsg.text}
          </div>
        )}
      </div>

      <input type="hidden" value={bal} readOnly />
    </div>
  );
}
