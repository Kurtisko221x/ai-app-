"use client";

import { useEffect, useState, useCallback } from "react";

type OverviewUser = {
  id: string;
  email: string;
  name: string | null;
  robloxName: string | null;
  robloxUrl: string | null;
  credits: number;
  role: string;
  createdAt: string;
  _count: { chats: number };
};
type CreditReq = {
  id: string;
  reason: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
    robloxName: string | null;
    robloxUrl: string | null;
    credits: number;
  };
};
type Promo = {
  id: string;
  code: string;
  credits: number;
  maxUses: number;
  uses: number;
  active: boolean;
};
type Overview = {
  users: OverviewUser[];
  creditRequests: CreditReq[];
  promoCodes: Promo[];
  stats: { totalUsers: number; totalCredits: number; pendingRequests: number };
};

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<"requests" | "users" | "promo" | "news">(
    "requests"
  );
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  // promo form
  const [pCode, setPCode] = useState("");
  const [pCredits, setPCredits] = useState(100);
  const [pUses, setPUses] = useState(50);
  const [pMsg, setPMsg] = useState<string | null>(null);

  // news form
  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");
  const [nMsg, setNMsg] = useState<string | null>(null);
  const [nSending, setNSending] = useState(false);

  async function sendNews() {
    setNMsg(null);
    setNSending(true);
    try {
      const res = await fetch("/api/admin/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nTitle, body: nBody }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Chyba");
      setNMsg("✅ Novinka odoslaná do Discordu!");
      setNTitle("");
      setNBody("");
    } catch (e) {
      setNMsg("⚠️ " + (e instanceof Error ? e.message : "Chyba"));
    } finally {
      setNSending(false);
    }
  }

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRequest(id: string, action: "approve" | "reject") {
    const amount = amounts[id];
    await fetch(`/api/admin/credit-request/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, amount }),
    });
    load();
  }

  async function createPromo() {
    setPMsg(null);
    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: pCode, credits: pCredits, maxUses: pUses }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPMsg("⚠️ " + (d.error ?? "Chyba"));
      return;
    }
    setPMsg("✅ Kód vytvorený!");
    setPCode("");
    load();
  }

  async function togglePromo(id: string, active: boolean) {
    await fetch("/api/admin/promo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  }

  if (!data) return <div className="admin-loading">Načítavam admin panel…</div>;

  const pending = data.creditRequests.filter((r) => r.status === "pending");
  const handled = data.creditRequests.filter((r) => r.status !== "pending");

  return (
    <main className="admin">
      <h1>🛠️ Admin panel</h1>

      <div className="admin-stats">
        <div className="stat">
          <div className="stat-num">{data.stats.totalUsers}</div>
          <div className="stat-lbl">Používatelia</div>
        </div>
        <div className="stat">
          <div className="stat-num">{data.stats.totalCredits}</div>
          <div className="stat-lbl">Kreditov spolu</div>
        </div>
        <div className="stat">
          <div className="stat-num">{data.stats.pendingRequests}</div>
          <div className="stat-lbl">Čakajúce žiadosti</div>
        </div>
        <div className="stat">
          <div className="stat-num">{data.promoCodes.length}</div>
          <div className="stat-lbl">Promo kódy</div>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={tab === "requests" ? "active" : ""}
          onClick={() => setTab("requests")}
        >
          Žiadosti o kredity{" "}
          {pending.length > 0 && <span className="badge">{pending.length}</span>}
        </button>
        <button
          className={tab === "users" ? "active" : ""}
          onClick={() => setTab("users")}
        >
          Používatelia ({data.users.length})
        </button>
        <button
          className={tab === "promo" ? "active" : ""}
          onClick={() => setTab("promo")}
        >
          Promo kódy
        </button>
        <button
          className={tab === "news" ? "active" : ""}
          onClick={() => setTab("news")}
        >
          📣 Novinky
        </button>
      </div>

      {/* ŽIADOSTI */}
      {tab === "requests" && (
        <section>
          {pending.length === 0 && (
            <p className="admin-empty">Žiadne čakajúce žiadosti. 🎉</p>
          )}
          {pending.map((r) => (
            <div key={r.id} className="req-card">
              <div className="req-info">
                <div className="req-user">
                  <b>{r.user.name || r.user.email}</b>{" "}
                  <span className="req-email">{r.user.email}</span>
                </div>
                {r.user.robloxName && (
                  <div className="req-roblox">
                    🎮 {r.user.robloxName}
                    {r.user.robloxUrl && (
                      <a href={r.user.robloxUrl} target="_blank" rel="noreferrer">
                        {" "}
                        ↗ profil
                      </a>
                    )}
                  </div>
                )}
                <div className="req-reason">„{r.reason}“</div>
                <div className="req-meta">
                  Má teraz {r.user.credits} kreditov ·{" "}
                  {new Date(r.createdAt).toLocaleString("sk")}
                </div>
              </div>
              <div className="req-actions">
                <input
                  type="number"
                  className="req-amount"
                  value={amounts[r.id] ?? r.amount}
                  min={1}
                  onChange={(e) =>
                    setAmounts((a) => ({
                      ...a,
                      [r.id]: Number(e.target.value),
                    }))
                  }
                />
                <button
                  className="btn btn-primary sm"
                  onClick={() => handleRequest(r.id, "approve")}
                >
                  ✓ Schváliť
                </button>
                <button
                  className="btn btn-ghost sm"
                  onClick={() => handleRequest(r.id, "reject")}
                >
                  ✕ Zamietnuť
                </button>
              </div>
            </div>
          ))}

          {handled.length > 0 && (
            <>
              <h3 className="admin-subtitle">Vybavené</h3>
              {handled.map((r) => (
                <div key={r.id} className="req-card done">
                  <div className="req-info">
                    <b>{r.user.name || r.user.email}</b> — „{r.reason}“
                  </div>
                  <span
                    className={`req-status ${r.status}`}
                  >
                    {r.status === "approved"
                      ? `✓ +${r.amount}`
                      : "✕ zamietnuté"}
                  </span>
                </div>
              ))}
            </>
          )}
        </section>
      )}

      {/* POUŽÍVATELIA */}
      {tab === "users" && (
        <section className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Meno / Email</th>
                <th>Roblox</th>
                <th>Kredity</th>
                <th>Chaty</th>
                <th>Rola</th>
                <th>Registrácia</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.name || "—"}</b>
                    <div className="td-sub">{u.email}</div>
                  </td>
                  <td>
                    {u.robloxName ? (
                      u.robloxUrl ? (
                        <a href={u.robloxUrl} target="_blank" rel="noreferrer">
                          {u.robloxName} ↗
                        </a>
                      ) : (
                        u.robloxName
                      )
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>⚡ {u.credits}</td>
                  <td>{u._count.chats}</td>
                  <td>
                    {u.role === "admin" ? (
                      <span className="role-admin">admin</span>
                    ) : (
                      "user"
                    )}
                  </td>
                  <td className="td-sub">
                    {new Date(u.createdAt).toLocaleDateString("sk")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* PROMO */}
      {tab === "promo" && (
        <section>
          <div className="promo-create">
            <h3>Vytvoriť promo kód (giveaway)</h3>
            <div className="promo-form">
              <label>
                Kód
                <input
                  value={pCode}
                  onChange={(e) => setPCode(e.target.value.toUpperCase())}
                  placeholder="GIVEAWAY2026"
                />
              </label>
              <label>
                Kreditov
                <input
                  type="number"
                  value={pCredits}
                  min={1}
                  onChange={(e) => setPCredits(Number(e.target.value))}
                />
              </label>
              <label>
                Max použití
                <input
                  type="number"
                  value={pUses}
                  min={1}
                  onChange={(e) => setPUses(Number(e.target.value))}
                />
              </label>
              <button className="btn btn-primary" onClick={createPromo}>
                Vytvoriť
              </button>
            </div>
            {pMsg && <div className="promo-msg">{pMsg}</div>}
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kód</th>
                  <th>Kredity</th>
                  <th>Použité</th>
                  <th>Stav</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.promoCodes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="td-sub">
                      Zatiaľ žiadne promo kódy.
                    </td>
                  </tr>
                )}
                {data.promoCodes.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code className="promo-code">{p.code}</code>
                    </td>
                    <td>⚡ {p.credits}</td>
                    <td>
                      {p.uses} / {p.maxUses}
                    </td>
                    <td>
                      {p.active ? (
                        <span className="role-admin">aktívny</span>
                      ) : (
                        <span className="td-sub">vypnutý</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost sm"
                        onClick={() => togglePromo(p.id, !p.active)}
                      >
                        {p.active ? "Vypnúť" : "Zapnúť"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* NOVINKY */}
      {tab === "news" && (
        <section>
          <div className="promo-create">
            <h3>📣 Poslať novinku do Discordu (#oznamy)</h3>
            <p className="td-sub" style={{ marginBottom: 14 }}>
              Napíš novinku a objaví sa členom priamo v Discord kanáli #oznamy.
            </p>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-dim)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Nadpis
            </label>
            <input
              value={nTitle}
              onChange={(e) => setNTitle(e.target.value)}
              placeholder="Napr.: Pridali sme Studio plugin!"
              className="acc-input"
              style={{ width: "100%", marginBottom: 12 }}
            />
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-dim)",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Text novinky
            </label>
            <textarea
              value={nBody}
              onChange={(e) => setNBody(e.target.value)}
              placeholder="Čo je nové? Podporuje **markdown**."
              className="acc-textarea"
              rows={5}
              style={{ width: "100%", marginBottom: 12 }}
            />
            <button
              className="btn btn-primary"
              onClick={sendNews}
              disabled={nSending || !nTitle.trim() || !nBody.trim()}
            >
              {nSending ? "Odosielam…" : "📣 Odoslať do Discordu"}
            </button>
            {nMsg && <div className="promo-msg">{nMsg}</div>}
          </div>
        </section>
      )}
    </main>
  );
}
