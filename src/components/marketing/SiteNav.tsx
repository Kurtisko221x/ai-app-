import Link from "next/link";
import type { SafeUser } from "@/lib/auth";
import { Avatar, BrandName } from "@/components/Brand";
import { DISCORD_INVITE } from "@/lib/site";
import { getDict } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";

export default async function SiteNav({ user }: { user: SafeUser | null }) {
  const { lang, t } = await getDict();
  return (
    <nav className="site-nav">
      <Link href="/" className="nav-brand">
        <Avatar size={30} />
        <BrandName small />
        <span className="scripter-tag">scripter</span>
      </Link>

      <div className="nav-center">
        <Link href="/#funkcie">{t.nav.features}</Link>
        <Link href="/templates">{t.nav.templates}</Link>
        <Link href="/plugin">{t.nav.plugin}</Link>
        <Link href="/#cennik">{t.nav.pricing}</Link>
        <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
          {t.nav.discord}
        </a>
      </div>

      <div className="nav-links">
        <LangSwitch lang={lang} />
        {user ? (
          <>
            <span className="nav-credits" title="Credits">
              ⚡ {user.credits}
            </span>
            {user.role === "admin" && (
              <Link href="/admin" className="nav-login">
                {t.nav.admin}
              </Link>
            )}
            <Link href="/chat" className="btn btn-primary sm">
              {t.nav.toApp}
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-login">
              {t.nav.login}
            </Link>
            <Link href="/signup" className="btn btn-primary sm">
              {t.nav.signupFree}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
