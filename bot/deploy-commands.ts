// Zaregistruje slash príkazy na Discorde.
// Spusti: npm run bot:deploy  (potrebuje DISCORD_TOKEN, DISCORD_CLIENT_ID)
import { REST, Routes } from "discord.js";
import { config, assertConfig } from "./config";
import { commands } from "./commands";

async function main() {
  assertConfig();
  const body = commands.map((c) => c.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(config.token);

  if (config.guildId) {
    // guild-scoped = okamžité (dobré na vývoj)
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body }
    );
    console.log(`✅ Zaregistrovaných ${body.length} príkazov pre guild ${config.guildId}.`);
  } else {
    // global = do hodiny sa rozšíri na všetky servery
    await rest.put(Routes.applicationCommands(config.clientId), { body });
    console.log(`✅ Zaregistrovaných ${body.length} globálnych príkazov (môže trvať ~1h).`);
  }
}

main().catch((e) => {
  console.error("Chyba pri registrácii príkazov:", e);
  process.exit(1);
});
