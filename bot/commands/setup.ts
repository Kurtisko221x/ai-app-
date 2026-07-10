import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  Guild,
  Role,
  CategoryChannel,
  TextChannel,
} from "discord.js";
import { BRAND, config } from "../config";
import { rulesEmbed, pricingEmbed } from "../embeds";
import { ticketPanelEmbed, ticketPanelRow } from "../systems/tickets";

export const data = new SlashCommandBuilder()
  .setName("setup-server")
  .setDescription("Vygeneruje kompletný XSkinny AI server (role, kanály, permissie).")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function getOrCreateRole(
  guild: Guild,
  name: string,
  opts: { color?: number; perms?: bigint[]; hoist?: boolean }
): Promise<Role> {
  const existing = guild.roles.cache.find((r) => r.name === name);
  if (existing) return existing;
  return guild.roles.create({
    name,
    color: opts.color,
    permissions: opts.perms ?? [],
    hoist: opts.hoist ?? false,
    reason: "XSkinny AI setup",
  });
}

async function getOrCreateCategory(guild: Guild, name: string): Promise<CategoryChannel> {
  const existing = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === name
  ) as CategoryChannel | undefined;
  if (existing) return existing;
  return guild.channels.create({ name, type: ChannelType.GuildCategory });
}

async function getOrCreateText(
  guild: Guild,
  name: string,
  parent: CategoryChannel,
  readOnly: boolean
): Promise<TextChannel> {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const existing = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.name === slug
  ) as TextChannel | undefined;
  const overwrites = readOnly
    ? [{ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.SendMessages] }]
    : undefined;
  if (existing) {
    if (overwrites) await existing.edit({ permissionOverwrites: overwrites }).catch(() => {});
    return existing;
  }
  return guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: parent.id,
    permissionOverwrites: overwrites,
  });
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({ content: "Len na serveri.", ephemeral: true });
    return;
  }
  const me = guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content:
        "⚠️ Bot potrebuje oprávnenie **Administrator** aby vytvoril role a kanály. Daj mu ho a skús znova.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  // 1) Role
  await getOrCreateRole(guild, "🛡️ Staff", {
    color: BRAND.discord,
    hoist: true,
    perms: [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageRoles,
    ],
  });
  await getOrCreateRole(guild, "💎 Premium", { color: BRAND.yellow, hoist: true });
  await getOrCreateRole(guild, "✅ Člen", { color: BRAND.color, hoist: false });

  // 2) Kategórie + kanály
  const info = await getOrCreateCategory(guild, "📢 INFORMÁCIE");
  const vitaj = await getOrCreateText(guild, "👋・vitaj", info, true);
  const pravidla = await getOrCreateText(guild, "📜・pravidlá", info, true);
  await getOrCreateText(guild, "📣・oznamy", info, true);
  const cennik = await getOrCreateText(guild, "💎・cennik", info, true);
  const statusCh = await getOrCreateText(guild, "📡・status", info, true);

  const komunita = await getOrCreateCategory(guild, "💬 KOMUNITA");
  await getOrCreateText(guild, "💬・general", komunita, false);
  await getOrCreateText(guild, "🎮・tvoje-hry", komunita, false);
  await getOrCreateText(guild, "🧩・pomoc-so-skriptami", komunita, false);
  await getOrCreateText(guild, "😂・memes", komunita, false);

  const podporaCat = await getOrCreateCategory(guild, "🎫 PODPORA");
  const podpora = await getOrCreateText(guild, "🎫・podpora", podporaCat, true);

  const hlas = await getOrCreateCategory(guild, "🔊 HLAS");
  const hasVoice = guild.channels.cache.some(
    (c) => c.type === ChannelType.GuildVoice && c.parentId === hlas.id
  );
  if (!hasVoice) {
    await guild.channels.create({ name: "🔊 General", type: ChannelType.GuildVoice, parent: hlas.id });
    await guild.channels.create({ name: "💻 Coding", type: ChannelType.GuildVoice, parent: hlas.id });
  }

  // 3) Obsah — pošle len ak je kanál prázdny (idempotentné)
  const postIfEmpty = async (
    ch: TextChannel,
    payload: Parameters<TextChannel["send"]>[0]
  ) => {
    const msgs = await ch.messages.fetch({ limit: 1 }).catch(() => null);
    if (!msgs || msgs.size === 0) await ch.send(payload).catch(() => {});
  };

  await postIfEmpty(pravidla, { embeds: [rulesEmbed()] });
  await postIfEmpty(cennik, { embeds: [pricingEmbed()] });
  await postIfEmpty(podpora, { embeds: [ticketPanelEmbed()], components: [ticketPanelRow()] });
  await postIfEmpty(vitaj, {
    embeds: [
      rulesEmbed()
        .setTitle("🎮 Vitaj na XSkinny AI scripter!")
        .setDescription(
          `Sme komunita okolo AI ktoré píše Roblox skripty.\n\n🔹 Web: ${config.appUrl}\n🔹 Prihlás sa cez Discord a začni tvoriť\n🔹 Otázky do #🧩・pomoc-so-skriptami\n🔹 Problém? Otvor ticket v #🎫・podpora`
        ),
    ],
  });
  await postIfEmpty(statusCh, {
    content: "Aktuálny live status zisti príkazom `/status`. 📡",
  });

  await interaction.editReply(
    "✅ **Server vygenerovaný!**\nRoly, kategórie, kanály, permissie, pravidlá, cenník aj ticket panel sú pripravené. 🎉\nTip: presuň rolu bota nad ostatné aby fungovalo prideľovanie rolí."
  );
}
