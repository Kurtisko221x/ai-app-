import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Chat from "@/components/Chat";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/chat");

  return (
    <Chat
      userName={user.name || user.email.split("@")[0]}
      initialCredits={user.credits}
      isAdmin={user.role === "admin"}
    />
  );
}
