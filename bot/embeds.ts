import { EmbedBuilder } from "discord.js";
import { BRAND, config } from "./config";
import { PLANS, FREE_CREDITS, CREDITS_PER_MESSAGE } from "../src/lib/plans";

export function rulesEmbed() {
  return new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle("📜 Pravidlá servera")
    .setDescription(
      [
        "**1.** Buď slušný — žiadne urážky, rasizmus, spam.",
        "**2.** Žiadne NSFW ani nevhodný obsah.",
        "**3.** Nespamuj a nereklamuj iné servery/appky.",
        "**4.** Otázky píš do správnych kanálov.",
        "**5.** Nezdieľaj cheaty ani spôsoby obchádzania Roblox ToS.",
        "**6.** Rešpektuj staff a rozhodnutia adminov.",
        "**7.** Drž sa Discord Community Guidelines.",
        "",
        "Porušenie = warn / mute / ban. Príjemný pobyt! 🎮",
      ].join("\n")
    )
    .setFooter({ text: BRAND.footer });
}

export function pricingEmbed() {
  const e = new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle("💎 Cenník — XSkinny AI scripter")
    .setDescription(
      `Každá odpoveď AI stojí **${CREDITS_PER_MESSAGE} kredit**. Nový účet dostane **${FREE_CREDITS} kreditov zadarmo**.`
    );
  for (const p of PLANS) {
    e.addFields({
      name: `${p.highlight ? "⭐ " : ""}${p.name} — ${p.price} ${p.period}`,
      value: `${p.credits}\n${p.features.map((f) => `• ${f}`).join("\n")}`,
      inline: true,
    });
  }
  e.addFields({
    name: "​",
    value: `🔗 Web: ${config.appUrl}/cennik`,
  });
  e.setFooter({ text: BRAND.footer });
  return e;
}

export function welcomeEmbed(memberTag: string, memberCount: number) {
  return new EmbedBuilder()
    .setColor(BRAND.green)
    .setTitle(`👋 Vitaj na XSkinny AI, ${memberTag}!`)
    .setDescription(
      [
        "Sme komunita okolo **AI ktoré píše Roblox skripty**. 🎮",
        "",
        "🔹 Prečítaj si **#pravidlá**",
        "🔹 Prihlás sa cez Discord na webe a začni tvoriť",
        `🔹 Web: ${config.appUrl}`,
        "🔹 Máš problém? Otvor **ticket** v #podpora",
        "",
        "Uži si to a nech ti tvorba hier ide! 🚀",
      ].join("\n")
    )
    .setFooter({ text: `Si náš ${memberCount}. člen! · ${BRAND.footer}` });
}

export function statusEmbed(online: boolean, latencyMs: number | null, db: boolean) {
  return new EmbedBuilder()
    .setColor(online ? BRAND.green : BRAND.red)
    .setTitle("📡 Live status")
    .addFields(
      {
        name: "Web appka",
        value: online ? "🟢 Online" : "🔴 Offline",
        inline: true,
      },
      {
        name: "Databáza",
        value: db ? "🟢 OK" : "🔴 Problém",
        inline: true,
      },
      {
        name: "Odozva",
        value: latencyMs != null ? `${latencyMs} ms` : "—",
        inline: true,
      }
    )
    .setDescription(
      online
        ? "Všetko funguje! Môžeš generovať skripty. ✅"
        : "Appka je momentálne nedostupná. Skús o chvíľu. ⚠️"
    )
    .setFooter({ text: BRAND.footer })
    .setTimestamp();
}
