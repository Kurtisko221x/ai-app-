import Link from "next/link";
import type { SafeUser } from "@/lib/auth";
import { Avatar, BrandName } from "@/components/Brand";

export default function SiteNav({ user }: { user: SafeUser | null }) {
  return (
    <nav className="site-nav">
      <Link href="/" className="nav-brand">
        <Avatar size={30} />
        <BrandName small />
        <span className="scripter-tag">scripter</span>
      </Link>

      <div className="nav-center">
        <Link href="/#funkcie">Funkcie</Link>
        <Link href="/#ako">Ako to funguje</Link>
        <Link href="/plugin">Plugin 🎮</Link>
        <Link href="/#cennik">Ceny</Link>
        <Link href="/#faq">FAQ</Link>
      </div>

      <div className="nav-links">
        {user ? (
          <>
            <span className="nav-credits" title="Kredity">
              ⚡ {user.credits}
            </span>
            {user.role === "admin" && (
              <Link href="/admin" className="nav-login">
                Admin
              </Link>
            )}
            <Link href="/chat" className="btn btn-primary sm">
              Do aplikácie
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-login">
              Prihlásiť
            </Link>
            <Link href="/signup" className="btn btn-primary sm">
              Začať zadarmo
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
