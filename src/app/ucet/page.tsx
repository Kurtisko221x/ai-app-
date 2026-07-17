import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import AccountPanel from "@/components/AccountPanel";
import PluginKeyPanel from "@/components/PluginKeyPanel";
import AvatarUpload from "@/components/AvatarUpload";
import { Avatar, BrandName } from "@/components/Brand";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/ucet");

  const [chatCount, full] = await Promise.all([
    prisma.chat.count({ where: { userId: user.id } }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { robloxName: true, robloxUrl: true, createdAt: true },
    }),
  ]);

  return (
    <div className="account">
      <nav className="site-nav">
        <Link href="/" className="nav-brand">
          <Avatar size={28} />
          <BrandName small /> <span className="scripter-tag">scripter</span>
        </Link>
        <div className="nav-links">
          {user.role === "admin" && (
            <Link href="/admin" className="btn btn-outline sm">
              🛠️ Admin
            </Link>
          )}
          <Link href="/chat" className="btn btn-primary sm">
            Do aplikácie
          </Link>
        </div>
      </nav>

      <main className="account-main">
        <h1>Môj účet</h1>

        <div className="account-grid">
          <div className="account-card">
            <div className="account-label">Prihlásený ako</div>
            <AvatarUpload
              name={user.name || user.email.split("@")[0]}
              avatar={user.avatar}
            />
            <div className="account-value">{user.name || "—"}</div>
            <div className="account-email">{user.email}</div>
            {full?.robloxName && (
              <div className="account-email">🎮 {full.robloxName}</div>
            )}
            {full?.robloxUrl && (
              <a
                className="account-email link"
                href={full.robloxUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Roblox profil ↗
              </a>
            )}
          </div>

          <div className="account-card highlight">
            <div className="account-label">Zostatok kreditov</div>
            <div className="account-credits">⚡ {user.credits}</div>
          </div>

          <div className="account-card">
            <div className="account-label">Vytvorené konverzácie</div>
            <div className="account-value">{chatCount}</div>
          </div>
        </div>

        <AccountPanel credits={user.credits} />

        <PluginKeyPanel />

        <div className="account-actions">
          <Link href="/chat" className="btn btn-primary">
            Späť do chatu
          </Link>
          <LogoutButton />
        </div>
      </main>
    </div>
  );
}
