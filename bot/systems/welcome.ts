import { GuildMember, ChannelType, TextChannel } from "discord.js";
import { welcomeEmbed } from "../embeds";

// Zavolá sa pri príchode nového člena (guildMemberAdd)
export async function handleMemberJoin(member: GuildMember) {
  // 1) privítacia správa
  const channel = member.guild.channels.cache.find(
    (c) =>
      c.type === ChannelType.GuildText && /vitaj|welcome|vstup/i.test(c.name)
  ) as TextChannel | undefined;

  if (channel && channel.isSendable()) {
    await channel
      .send({
        content: `${member}`,
        embeds: [welcomeEmbed(member.user.username, member.guild.memberCount)],
      })
      .catch(() => {});
  }

  // 2) auto-rola "✅ Člen"
  const role = member.guild.roles.cache.find((r) => /člen|member/i.test(r.name));
  if (role) {
    await member.roles.add(role).catch(() => {});
  }
}
