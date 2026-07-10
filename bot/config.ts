// Konfigurácia Discord bota. Premenné nastavíš na Railway (bot službe) alebo v .env.
export const config = {
  token: process.env.DISCORD_TOKEN ?? "",
  clientId: process.env.DISCORD_CLIENT_ID ?? "",
  guildId: process.env.DISCORD_GUILD_ID ?? "", // nepovinné (rýchlejší deploy príkazov)
  appUrl: process.env.APP_URL ?? "https://ai-app-production-d99c.up.railway.app",
};

// Značka
export const BRAND = {
  name: "XSkinny AI scripter",
  color: 0x00a2ff,
  green: 0x27c93f,
  red: 0xe2231a,
  yellow: 0xffd54a,
  discord: 0x5865f2,
  footer: "XSkinny AI · Roblox script asistent",
};

export function assertConfig() {
  const missing: string[] = [];
  if (!config.token) missing.push("DISCORD_TOKEN");
  if (!config.clientId) missing.push("DISCORD_CLIENT_ID");
  if (missing.length) {
    throw new Error(
      "Chýbajú premenné prostredia: " +
        missing.join(", ") +
        ". Nastav ich (viď DISCORD.md)."
    );
  }
}
