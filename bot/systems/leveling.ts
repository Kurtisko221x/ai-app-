import { Message, EmbedBuilder } from "discord.js";
import { prisma } from "../db";
import { BRAND } from "../config";

// XP z celkového XP: level = floor(0.1 * sqrt(xp))  → 100xp=lvl1, 400=2, 900=3...
export function levelFromXp(xp: number): number {
  return Math.floor(0.1 * Math.sqrt(xp));
}
export function xpForLevel(level: number): number {
  return Math.pow(level / 0.1, 2);
}

const cooldown = new Map<string, number>(); // discordId -> timestamp
const COOLDOWN_MS = 60_000;

// Zavolá sa pri každej správe (messageCreate)
export async function handleMessageXp(message: Message) {
  if (message.author.bot || !message.guild) return;
  const key = message.guild.id + ":" + message.author.id;
  const now = Date.now();
  if ((cooldown.get(key) ?? 0) + COOLDOWN_MS > now) return;
  cooldown.set(key, now);

  const gain = 15 + Math.floor(Math.random() * 11); // 15–25 XP

  const existing = await prisma.discordUser.findUnique({
    where: {
      guildId_discordId: {
        guildId: message.guild.id,
        discordId: message.author.id,
      },
    },
  });
  const oldXp = existing?.xp ?? 0;
  const newXp = oldXp + gain;
  const oldLevel = levelFromXp(oldXp);
  const newLevel = levelFromXp(newXp);

  await prisma.discordUser.upsert({
    where: {
      guildId_discordId: {
        guildId: message.guild.id,
        discordId: message.author.id,
      },
    },
    create: {
      guildId: message.guild.id,
      discordId: message.author.id,
      xp: newXp,
      level: newLevel,
      messages: 1,
    },
    update: { xp: newXp, level: newLevel, messages: { increment: 1 } },
  });

  if (newLevel > oldLevel && newLevel > 0) {
    const embed = new EmbedBuilder()
      .setColor(BRAND.yellow)
      .setDescription(
        `🎉 ${message.author} vyleveloval na **level ${newLevel}**! Len tak ďalej!`
      );
    message.channel.isSendable() && message.channel.send({ embeds: [embed] });
  }
}

export async function getRank(guildId: string, discordId: string) {
  const me = await prisma.discordUser.findUnique({
    where: { guildId_discordId: { guildId, discordId } },
  });
  if (!me) return null;
  const higher = await prisma.discordUser.count({
    where: { guildId, xp: { gt: me.xp } },
  });
  return { ...me, rank: higher + 1 };
}

export async function getLeaderboard(guildId: string, limit = 10) {
  return prisma.discordUser.findMany({
    where: { guildId },
    orderBy: { xp: "desc" },
    take: limit,
  });
}
