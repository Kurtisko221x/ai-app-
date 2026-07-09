import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AdminDashboard from "@/components/AdminDashboard";
import { Avatar, BrandName } from "@/components/Brand";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/chat");

  return (
    <div className="account">
      <nav className="site-nav">
        <Link href="/" className="nav-brand">
          <Avatar size={28} />
          <BrandName small /> <span className="scripter-tag">admin</span>
        </Link>
        <div className="nav-links">
          <Link href="/chat" className="btn btn-primary sm">
            Do aplikácie
          </Link>
        </div>
      </nav>
      <AdminDashboard />
    </div>
  );
}
