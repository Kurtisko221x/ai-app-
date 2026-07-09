import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/components/marketing/SiteNav";
import SiteFooter from "@/components/marketing/SiteFooter";
import Pricing from "@/components/marketing/Pricing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cenník — XSkinny AI scripter" };

export default async function CennikPage() {
  const user = await getCurrentUser();
  return (
    <div className="landing">
      <SiteNav user={user} />
      <div style={{ paddingTop: "40px" }}>
        <Pricing loggedIn={!!user} />
      </div>
      <SiteFooter />
    </div>
  );
}
