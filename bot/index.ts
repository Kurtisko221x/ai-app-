import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  ActivityType,
} from "discord.js";
import { config, assertConfig } from "./config";
import { commands, commandMap } from "./commands";
import { handleTicketButton } from "./systems/tickets";
import { handleMemberJoin } from "./systems/welcome";
import { handleMessageXp } from "./systems/leveling";

assertConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // privilegovaný — zapni v Dev Portáli
    GatewayIntentBits.GuildMessages,
  ],
});

// Registrácia príkazov pri štarte (nech ich netreba deployovať zvlášť)
async function registerCommands() {
  const body = commands.map((c) => c.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(config.token);
  try {
    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body }
      );
      console.log(`✅ ${body.length} príkazov (guild ${config.guildId}).`);
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), { body });
      console.log(`✅ ${body.length} globálnych príkazov.`);
    }
  } catch (e) {
    console.error("Registrácia príkazov zlyhala:", e);
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`🤖 Prihlásený ako ${c.user.tag}`);
  c.user.setActivity("XSkinny AI · /status", { type: ActivityType.Watching });
  await registerCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = commandMap.get(interaction.commandName);
      if (cmd) await cmd.execute(interaction);
    } else if (interaction.isButton()) {
      await handleTicketButton(interaction);
    }
  } catch (err) {
    console.error("Chyba interakcie:", err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      interaction
        .reply({ content: "⚠️ Nastala chyba.", ephemeral: true })
        .catch(() => {});
    }
  }
});

client.on(Events.GuildMemberAdd, (member) => {
  handleMemberJoin(member).catch((e) => console.error("welcome:", e));
});

client.on(Events.MessageCreate, (message) => {
  handleMessageXp(message).catch((e) => console.error("xp:", e));
});

client.login(config.token);
