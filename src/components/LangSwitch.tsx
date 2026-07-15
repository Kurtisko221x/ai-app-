"use client";

import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";

export default function LangSwitch({ lang }: { lang: Lang }) {
  const router = useRouter();

  function set(l: Lang) {
    if (l === lang) return;
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="lang-switch" title="Language / Jazyk">
      <button
        className={lang === "en" ? "active" : ""}
        onClick={() => set("en")}
        type="button"
      >
        EN
      </button>
      <button
        className={lang === "sk" ? "active" : ""}
        onClick={() => set("sk")}
        type="button"
      >
        SK
      </button>
    </div>
  );
}
