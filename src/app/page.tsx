import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import Pricing from "@/components/marketing/Pricing";
import MockEditor from "@/components/marketing/MockEditor";
import { DISCORD_INVITE } from "@/lib/site";
import { Avatar } from "@/components/Brand";
import { getDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

// mini **bold** parser
function b(text: string): ReactNode {
  return text.split("**").map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : p));
}

export default async function Home() {
  const user = await getCurrentUser();
  const { t } = await getDict();
  const loggedIn = !!user;
  const primaryHref = loggedIn ? "/chat" : "/signup";
  const whoIcons = ["🌱", "🚀", "🧩", "📚"];

  return (
    <div className="landing">
      <SiteNav user={user} />

      {/* HERO */}
      <header className="hero">
        <div className="hero-text">
          <div className="hero-badge">
            <Avatar size={20} /> {t.hero.badge}
          </div>
          <h1>
            {t.hero.titleA} <span className="grad">{t.hero.titleGrad}</span>
          </h1>
          <p className="hero-sub">
            {t.hero.sub1}
            <b>{t.hero.subBold}</b>
            {t.hero.sub2}
          </p>
          <div className="hero-cta">
            <Link href={primaryHref} className="btn btn-primary lg">
              {loggedIn ? t.hero.ctaIn : t.hero.ctaOut} →
            </Link>
            <Link href="/#ako" className="btn btn-outline lg">
              {t.hero.ctaSecondary}
            </Link>
          </div>
          <div className="hero-trust">{t.hero.trust}</div>
        </div>
        <div className="hero-visual">
          <MockEditor />
        </div>
      </header>

      {/* HOW */}
      <section id="ako" className="section">
        <div className="section-head">
          <span className="eyebrow">{t.how.eyebrow}</span>
          <h2>{t.how.title}</h2>
        </div>
        <div className="steps">
          {t.how.steps.map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funkcie" className="section alt">
        <div className="section-head">
          <span className="eyebrow">{t.feat.eyebrow}</span>
          <h2>{t.feat.title}</h2>
          <p>{t.feat.sub}</p>
        </div>
        <div className="features-grid">
          {t.feat.items.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHO */}
      <section className="section">
        <div className="who">
          <div className="who-text">
            <span className="eyebrow">{t.who.eyebrow}</span>
            <h2>{t.who.title}</h2>
            <ul className="who-list">
              {t.who.list.map((item, i) => (
                <li key={i}>
                  <span>{whoIcons[i]}</span> {b(item.replace(/^\S+\s/, ""))}
                </li>
              ))}
            </ul>
          </div>
          <div className="who-card">
            <div className="who-chat-you">{t.who.chatYou}</div>
            <div className="who-chat-ai">{t.who.chatAi}</div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <div className="section alt no-pad-top">
        <Pricing loggedIn={loggedIn} />
      </div>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="section-head">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2>{t.faq.title}</h2>
        </div>
        <div className="faq">
          {t.faq.items.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* DISCORD COMMUNITY */}
      <section className="section">
        <div className="discord-band">
          <div className="discord-band-glow" />
          <div className="discord-band-inner">
            <div className="discord-logo-big">💬</div>
            <h2>{t.discord.title}</h2>
            <p>{t.discord.sub}</p>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="btn discord-band-btn lg"
            >
              {t.discord.button}
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <h2>{t.cta.title}</h2>
        <p>{t.cta.sub}</p>
        <Link href={primaryHref} className="btn btn-primary lg">
          {loggedIn ? t.hero.ctaIn : t.hero.ctaOut} →
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
