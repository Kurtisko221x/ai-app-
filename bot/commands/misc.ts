import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { config, BRAND } from "../config";
import { prisma } from "../db";
import { rulesEmbed, pricingEmbed, statusEmbed } from "../embeds";
import {
  getRank,
  getLeaderboard,
  levelFromXp,
  xpForLevel,
} from "../systems/leveling";

type Command = {
  data: SlashCommandBuilder;
  execute: (i: ChatInputCommandInteraction) => Promise<void>;
};

// /status — live stav web appky
export const status: Command = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Zisti či je XSkinny AI appka online."),
  async execute(i) {
    await i.deferReply();
    const start = Date.now();
    let online = false;
    let db = false;
    try {
      const res = await fetch(`${config.appUrl}/api/health`, {
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json().catch(() => ({}));
      online = res.ok;
      db = !!data.db;
    } catch {
      online = false;
    }
    const latency = online ? Date.now() - start : null;
    await i.editReply({ embeds: [statusEmbed(online, latency, db)] });
  },
};

// /kredity — zostatok kreditov prepojeného účtu
export const kredity: Command = {
  data: new SlashCommandBuilder()
    .setName("kredity")
    .setDescription("Zobrazí tvoj zostatok kreditov na XSkinny AI."),
  async execute(i) {
    const user = await prisma.user.findUnique({
      where: { discordId: i.user.id },
      select: { credits: true, name: true, email: true },
    });
    if (!user) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Prepojiť účet")
          .setStyle(ButtonStyle.Link)
          .setURL(`${config.appUrl}/api/auth/discord`)
      );
      await i.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(BRAND.yellow)
            .setTitle("🔗 Účet nie je prepojený")
            .setDescription(
              "Najprv sa na webe prihlás cez Discord — potom uvidím tvoje kredity."
            )
            .setFooter({ text: BRAND.footer }),
        ],
        components: [row],
        ephemeral: true,
      });
      return;
    }
    await i.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(BRAND.color)
          .setTitle("⚡ Tvoje kredity")
          .setDescription(`Máš **${user.credits}** kreditov.`)
          .setFooter({ text: BRAND.footer }),
      ],
      ephemeral: true,
    });
  },
};

// /prepojit — návod / link na prepojenie Discord účtu
export const prepojit: Command = {
  data: new SlashCommandBuilder()
    .setName("prepojit")
    .setDescription("Prepoj svoj Discord účet s XSkinny AI (kvôli kreditom)."),
  async execute(i) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Prihlásiť sa cez Discord")
        .setStyle(ButtonStyle.Link)
        .setURL(`${config.appUrl}/api/auth/discord`)
    );
    await i.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(BRAND.discord)
          .setTitle("🔗 Prepojenie účtu")
          .setDescription(
            "Klikni na tlačidlo, prihlás sa cez Discord a tvoj účet sa prepojí. Potom môžeš cez `/kredity` vidieť zostatok."
          )
          .setFooter({ text: BRAND.footer }),
      ],
      components: [row],
      ephemeral: true,
    });
  },
};

// /pravidla
export const pravidla: Command = {
  data: new SlashCommandBuilder()
    .setName("pravidla")
    .setDescription("Zobrazí pravidlá servera."),
  async execute(i) {
    await i.reply({ embeds: [rulesEmbed()], ephemeral: true });
  },
};

// /cennik
export const cennik: Command = {
  data: new SlashCommandBuilder()
    .setName("cennik")
    .setDescription("Zobrazí cenník XSkinny AI."),
  async execute(i) {
    await i.reply({ embeds: [pricingEmbed()], ephemeral: true });
  },
};

// /rank
export const rank: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Zobrazí tvoj level a XP."),
  async execute(i) {
    if (!i.guild) {
      await i.reply({ content: "Len na serveri.", ephemeral: true });
      return;
    }
    const r = await getRank(i.guild.id, i.user.id);
    if (!r) {
      await i.reply({
        content: "Ešte nemáš žiadne XP — napíš pár správ. 💬",
        ephemeral: true,
      });
      return;
    }
    const nextXp = Math.ceil(xpForLevel(levelFromXp(r.xp) + 1));
    await i.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(BRAND.yellow)
          .setTitle(`📊 Rank — ${i.user.username}`)
          .addFields(
            { name: "Level", value: `${r.level}`, inline: true },
            { name: "XP", value: `${r.xp} / ${nextXp}`, inline: true },
            { name: "Poradie", value: `#${r.rank}`, inline: true },
            { name: "Správy", value: `${r.messages}`, inline: true }
          )
          .setFooter({ text: BRAND.footer }),
      ],
    });
  },
};

// /leaderboard
export const leaderboard: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Rebríček najaktívnejších členov."),
  async execute(i) {
    if (!i.guild) {
      await i.reply({ content: "Len na serveri.", ephemeral: true });
      return;
    }
    const top = await getLeaderboard(i.guild.id, 10);
    if (top.length === 0) {
      await i.reply({ content: "Rebríček je zatiaľ prázdny. 💬", ephemeral: true });
      return;
    }
    const medals = ["🥇", "🥈", "🥉"];
    const lines = top.map((u, idx) => {
      const medal = medals[idx] ?? `**${idx + 1}.**`;
      return `${medal} <@${u.discordId}> — level **${u.level}** (${u.xp} XP)`;
    });
    await i.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(BRAND.color)
          .setTitle("🏆 Leaderboard")
          .setDescription(lines.join("\n"))
          .setFooter({ text: BRAND.footer }),
      ],
    });
  },
};

export const miscCommands: Command[] = [
  status,
  kredity,
  prepojit,
  pravidla,
  cennik,
  rank,
  leaderboard,
];
