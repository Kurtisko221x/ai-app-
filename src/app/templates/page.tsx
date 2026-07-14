import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import { Markdown } from "@/components/Markdown";
import { TEMPLATES } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Templaty — XSkinny AI scripter",
  description:
    "Hotové Roblox skripty na jeden klik — VIP menu, leaderboard, kill-brick a viac. Skopíruj alebo stiahni a hoď rovno do Roblox Studia.",
};

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  return (
    <div className="landing">
      <SiteNav user={user} />

      <header className="section" style={{ textAlign: "center", paddingBottom: 10 }}>
        <span className="eyebrow">Templaty zdarma</span>
        <h1 style={{ fontSize: 40, margin: "14px 0", letterSpacing: "-1px" }}>
          Hotové skripty <span className="grad">na jeden klik</span> 🎮
        </h1>
        <p
          style={{
            color: "var(--text-dim)",
            fontSize: 17,
            maxWidth: 620,
            margin: "0 auto",
          }}
        >
          Skopíruj alebo stiahni a hoď rovno do Roblox Studia — funguje okamžite.
          Chceš niečo vlastné?{" "}
          <Link href={user ? "/chat" : "/signup"}>Napíš AI v chate</Link>.
        </p>
      </header>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="tpl-grid">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="tpl-card">
              <div className="tpl-head">
                <span className="tpl-icon">{t.icon}</span>
                <div>
                  <h3>{t.title}</h3>
                  <span className="tpl-badge">
                    {t.className} → {t.target}
                  </span>
                </div>
              </div>
              <p className="tpl-desc">{t.desc}</p>
              <Markdown content={"```lua\n" + t.code + "\n```"} />
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
