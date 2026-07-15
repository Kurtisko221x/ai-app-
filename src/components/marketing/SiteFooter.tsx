import Link from "next/link";
import { Avatar, BrandName } from "@/components/Brand";
import { DISCORD_INVITE } from "@/lib/site";
import { getDict } from "@/lib/i18n";

export default async function SiteFooter() {
  const { t } = await getDict();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="nav-brand">
            <Avatar size={30} />
            <BrandName small /> <span className="scripter-tag">scripter</span>
          </div>
          <p>{t.footer.desc}</p>
          <p className="footer-owner">
            Owner: <b>XSkinny</b> · beta
          </p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>{t.footer.product}</h4>
            <Link href="/#funkcie">{t.footer.l_features}</Link>
            <Link href="/#ako">{t.footer.l_how}</Link>
            <Link href="/#cennik">{t.footer.l_pricing}</Link>
          </div>
          <div>
            <h4>{t.footer.account}</h4>
            <Link href="/signup">{t.footer.l_signup}</Link>
            <Link href="/login">{t.footer.l_login}</Link>
            <Link href="/chat">{t.footer.l_app}</Link>
          </div>
          <div>
            <h4>{t.footer.community}</h4>
            <Link href="/#faq">{t.footer.l_faq}</Link>
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">
              {t.footer.l_discord}
            </a>
            <Link href="/templates">{t.footer.l_templates}</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} XSkinny AI scripter</span>
        <span className="footer-disclaimer">{t.footer.disclaimer}</span>
      </div>
    </footer>
  );
}
