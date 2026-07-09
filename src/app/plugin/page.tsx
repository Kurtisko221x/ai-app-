import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Roblox Studio plugin — XSkinny AI scripter",
  description:
    "Generuj Roblox skripty priamo v Roblox Studio. Stiahni XSkinny AI plugin a píš kód bez kopírovania.",
};

const STEPS = [
  {
    n: "1",
    title: "Stiahni plugin",
    body: (
      <>
        Klikni na tlačidlo nižšie a stiahni súbor <code>XSkinnyAI.lua</code>.
      </>
    ),
  },
  {
    n: "2",
    title: "Otvor Plugins priečinok",
    body: (
      <>
        V Roblox Studio choď na kartu <b>Plugins</b> (hore) → klikni{" "}
        <b>Plugins Folder</b>. Otvorí sa priečinok na disku.
      </>
    ),
  },
  {
    n: "3",
    title: "Vlož súbor a reštartuj",
    body: (
      <>
        Skopíruj <code>XSkinnyAI.lua</code> do toho priečinka a{" "}
        <b>reštartuj Roblox Studio</b>. Plugin sa objaví na karte Plugins ako
        „XSkinny AI".
      </>
    ),
  },
  {
    n: "4",
    title: "Vlož API kľúč",
    body: (
      <>
        Na svojom účte (<Link href="/ucet">/ucet</Link>) vygeneruj API kľúč,
        skopíruj ho a vlož do pluginu (horné pole). Hotovo! 🎉
      </>
    ),
  },
];

export default async function PluginPage() {
  const user = await getCurrentUser();
  return (
    <div className="landing">
      <SiteNav user={user} />

      <header className="section" style={{ textAlign: "center", paddingBottom: 20 }}>
        <span className="eyebrow">Roblox Studio plugin</span>
        <h1 style={{ fontSize: 40, margin: "12px 0" }}>
          Píš skripty <span className="grad">priamo v Roblox Studio</span> 🪄
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: 17, maxWidth: 620, margin: "0 auto 26px" }}>
          Žiadne kopírovanie. Napíšeš čo chceš, klikneš „Vložiť" a skript sa
          objaví presne tam kam patrí — ServerScriptService, StarterGui...
        </p>
        <a href="/XSkinnyAI.lua" download className="btn btn-primary lg">
          ⬇ Stiahnuť plugin (.lua)
        </a>
      </header>

      <section className="section alt">
        <div className="section-head">
          <h2>Inštalácia — 4 kroky</h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step" style={{ textAlign: "left" }}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="faq" style={{ maxWidth: 720 }}>
          <details className="faq-item">
            <summary>Plugin hlási „chyba spojenia" / nefunguje HTTP</summary>
            <p>
              V Roblox Studio choď na <b>Home → Game Settings → Security</b> a
              zapni <b>Allow HTTP Requests</b>. Potom skús znova.
            </p>
          </details>
          <details className="faq-item">
            <summary>Kde získam API kľúč?</summary>
            <p>
              Prihlás sa na webe, choď na <Link href="/ucet">Môj účet</Link> a v
              sekcii „Roblox Studio plugin" klikni na „Vygenerovať API kľúč".
            </p>
          </details>
          <details className="faq-item">
            <summary>Míňa plugin kredity?</summary>
            <p>
              Áno — rovnako ako chat na webe, každé generovanie stojí kredity z
              tvojho účtu. Zostatok vidíš aj priamo v plugine.
            </p>
          </details>
          <details className="faq-item">
            <summary>Je to bezpečné?</summary>
            <p>
              Plugin komunikuje len s naším serverom cez tvoj API kľúč. Kľúč
              nikomu nedávaj — keby unikol, vygeneruj si nový (starý prestane
              platiť).
            </p>
          </details>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
