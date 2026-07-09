import Link from "next/link";
import { Avatar, BrandName } from "@/components/Brand";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="nav-brand">
            <Avatar size={30} />
            <BrandName small /> <span className="scripter-tag">scripter</span>
          </div>
          <p>
            Tvoj AI parťák na tvorbu Roblox hier. Od nápadu ku kódu za sekundy.
          </p>
          <p className="footer-owner">
            Owner: <b>XSkinny</b> · beta verzia
          </p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Produkt</h4>
            <Link href="/#funkcie">Funkcie</Link>
            <Link href="/#ako">Ako to funguje</Link>
            <Link href="/#cennik">Ceny</Link>
          </div>
          <div>
            <h4>Účet</h4>
            <Link href="/signup">Registrácia</Link>
            <Link href="/login">Prihlásenie</Link>
            <Link href="/chat">Aplikácia</Link>
          </div>
          <div>
            <h4>Pomoc</h4>
            <Link href="/#faq">FAQ</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} XSkinny AI scripter</span>
        <span className="footer-disclaimer">
          Nie sme spojení so spoločnosťou Roblox Corporation. „Roblox" je ochranná
          známka jej vlastníka.
        </span>
      </div>
    </footer>
  );
}
