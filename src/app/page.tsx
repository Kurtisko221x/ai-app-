import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import Pricing from "@/components/marketing/Pricing";
import MockEditor from "@/components/marketing/MockEditor";
import { Avatar } from "@/components/Brand";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "🧠",
    title: "Rozumie Robloxu",
    text: "Pozná Luau, služby, RemoteEvents aj rozdiel medzi serverom a klientom. Nie je to obyčajný chatbot.",
  },
  {
    icon: "📍",
    title: "Povie ti KAM to dať",
    text: "Ku každému skriptu dostaneš presné miesto v Roblox Studio — ServerScriptService, StarterGui, ModuleScript...",
  },
  {
    icon: "💬",
    title: "Píšeš po svojom",
    text: "Žiadne odborné termíny netreba. Napíš „chcem dvere čo sa otvoria po dotyku“ a máš hotový kód.",
  },
  {
    icon: "📋",
    title: "Kód na jeden klik",
    text: "Zvýraznená syntax a tlačidlo Kopírovať. Prilepíš do Studia a hra funguje.",
  },
  {
    icon: "🎓",
    title: "Učí ťa popri tom",
    text: "Nielen kód — aj vysvetlenie ako funguje. Postupne sa staneš lepším tvorcom.",
  },
  {
    icon: "🛡️",
    title: "Bezpečný kód",
    text: "AI dbá na to aby sa hráčovi (klientovi) nedalo veriť — chráni tvoju hru pred exploitmi.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Popíš čo chceš",
    text: "„Sprav leaderboard s bodmi za zabitia.“ Stačí normálna reč.",
  },
  {
    n: "2",
    title: "Dostaneš hotový kód",
    text: "AI napíše Luau skript a povie ti presne kam ho v Studiu vložiť.",
  },
  {
    n: "3",
    title: "Vlož a hraj",
    text: "Skopíruješ, prilepíš do Roblox Studia, stlačíš Play. Hotovo. 🎉",
  },
];

const FAQ = [
  {
    q: "Musím vedieť programovať?",
    a: "Nie. Práve preto XSkinny AI scripter vznikol — píšeš vlastnými slovami a dostaneš hotový kód aj s návodom kam ho dať. Popri tom sa učíš.",
  },
  {
    q: "Naozaj to napíše funkčný Roblox kód?",
    a: "Áno. AI je vyladené špeciálne na Roblox a jazyk Luau — pozná služby, skripty, RemoteEvents aj bežné vzory z Roblox hier.",
  },
  {
    q: "Ako fungujú kredity?",
    a: "Každá odpoveď AI stojí kredity. Po registrácii dostaneš kredity zadarmo na vyskúšanie. Keď minieš, doplníš si balík.",
  },
  {
    q: "Je to zadarmo?",
    a: "Na vyskúšanie áno — nový účet dostane štartovacie kredity. Väčšie používanie je cez lacné mesačné balíky.",
  },
  {
    q: "Je to oficiálny nástroj od Robloxu?",
    a: "Nie, sme nezávislý nástroj. Nie sme spojení so spoločnosťou Roblox Corporation.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  const loggedIn = !!user;
  const primaryHref = loggedIn ? "/chat" : "/signup";

  return (
    <div className="landing">
      <SiteNav user={user} />

      {/* HERO */}
      <header className="hero">
        <div className="hero-text">
          <div className="hero-badge">
            <Avatar size={20} /> XSkinny AI scripter · beta
          </div>
          <h1>
            Vytvor Roblox skript <span className="grad">bez programovania</span>
          </h1>
          <p className="hero-sub">
            Popíš čo chceš v hre — XSkinny AI ti napíše hotový Luau kód a povie
            presne <b>kam ho v Roblox Studio vložiť</b>. Aj keď si úplný
            začiatočník.
          </p>
          <div className="hero-cta">
            <Link href={primaryHref} className="btn btn-primary lg">
              {loggedIn ? "Otvoriť aplikáciu" : "Začať zadarmo"} →
            </Link>
            <Link href="/#ako" className="btn btn-outline lg">
              Ako to funguje
            </Link>
          </div>
          <div className="hero-trust">
            ⚡ Kredity zadarmo na štart · 🇸🇰 Po slovensky · 🔒 Bez inštalácie
          </div>
        </div>
        <div className="hero-visual">
          <MockEditor />
        </div>
      </header>

      {/* AKO TO FUNGUJE */}
      <section id="ako" className="section">
        <div className="section-head">
          <span className="eyebrow">Ako to funguje</span>
          <h2>Od nápadu ku kódu za 3 kroky</h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FUNKCIE */}
      <section id="funkcie" className="section alt">
        <div className="section-head">
          <span className="eyebrow">Funkcie</span>
          <h2>Nie hocijaká AI — parťák čo pozná Roblox</h2>
          <p>
            Bežné chatboty ti dajú kód ktorý nefunguje alebo nevieš kam ho dať.
            XSkinny AI je iné.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRE KOHO */}
      <section className="section">
        <div className="who">
          <div className="who-text">
            <span className="eyebrow">Pre koho</span>
            <h2>Pre každého kto chce robiť Roblox hry</h2>
            <ul className="who-list">
              <li>
                <span>🌱</span> <b>Začiatočníci</b> — nevieš kód? Nevadí, píšeš po
                svojom.
              </li>
              <li>
                <span>🚀</span> <b>Tvorcovia hier</b> — zrýchli prácu, prestaň
                googliť.
              </li>
              <li>
                <span>🧩</span> <b>Zaseknutí</b> — máš chybu? Vlož kód a AI ju
                nájde.
              </li>
              <li>
                <span>📚</span> <b>Študenti</b> — uč sa Luau na reálnych
                príkladoch.
              </li>
            </ul>
          </div>
          <div className="who-card">
            <div className="who-chat-you">
              „Chcem aby hráč dostal +10 coinov keď zoberie mincu“
            </div>
            <div className="who-chat-ai">
              <b>🤖 XSkinny AI:</b> Jasné! Toto je <b>Server Script</b>, daj ho do
              mince. Tu je kód... ✅
            </div>
          </div>
        </div>
      </section>

      {/* CENNÍK */}
      <div className="section alt no-pad-top">
        <Pricing loggedIn={loggedIn} />
      </div>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>Časté otázky</h2>
        </div>
        <div className="faq">
          {FAQ.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <h2>Pripravený vytvoriť svoju hru?</h2>
        <p>Zaregistruj sa a napíš svoj prvý skript o 30 sekúnd.</p>
        <Link href={primaryHref} className="btn btn-primary lg">
          {loggedIn ? "Otvoriť aplikáciu" : "Začať zadarmo"} →
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
