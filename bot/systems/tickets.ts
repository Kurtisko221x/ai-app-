import {
  ButtonInteraction,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { BRAND } from "../config";

export const TICKET_CREATE_ID = "xs_ticket_create";
export const TICKET_CLOSE_ID = "xs_ticket_close";

export function ticketPanelEmbed() {
  return new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle("🎫 Podpora")
    .setDescription(
      "Máš problém, otázku alebo nahlásenie? Klikni na tlačidlo nižšie a otvorí sa ti súkromný kanál so staffom."
    )
    .setFooter({ text: BRAND.footer });
}

export function ticketPanelRow() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(TICKET_CREATE_ID)
      .setLabel("Otvoriť ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary)
  );
}

function findStaffRoleId(guild: ButtonInteraction["guild"]): string | null {
  if (!guild) return null;
  const named = guild.roles.cache.find((r) =>
    /staff|moder|admin/i.test(r.name)
  );
  if (named) return named.id;
  const perm = guild.roles.cache.find((r) =>
    r.permissions.has(PermissionFlagsBits.ManageChannels)
  );
  return perm?.id ?? null;
}

export async function handleTicketButton(interaction: ButtonInteraction) {
  if (interaction.customId === TICKET_CREATE_ID) return createTicket(interaction);
  if (interaction.customId === TICKET_CLOSE_ID) return closeTicket(interaction);
}

async function createTicket(interaction: ButtonInteraction) {
  const guild = interaction.guild;
  if (!guild) return;
  await interaction.deferReply({ ephemeral: true });

  // už má otvorený ticket?
  const existing = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.topic === interaction.user.id
  ) as TextChannel | undefined;
  if (existing) {
    await interaction.editReply(`Už máš otvorený ticket: ${existing}`);
    return;
  }

  const staffRoleId = findStaffRoleId(guild);
  const category = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && /podpora|ticket/i.test(c.name)
  );

  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];
  if (staffRoleId) {
    overwrites.push({
      id: staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`.slice(0, 90),
    type: ChannelType.GuildText,
    parent: category?.id,
    topic: interaction.user.id,
    permissionOverwrites: overwrites,
  });

  const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(TICKET_CLOSE_ID)
      .setLabel("Zatvoriť ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );

  const embed = new EmbedBuilder()
    .setColor(BRAND.color)
    .setTitle("🎫 Ticket otvorený")
    .setDescription(
      `Ahoj ${interaction.user}! Popíš svoj problém a staff sa ti čoskoro ozve. Po vyriešení klikni na „Zatvoriť ticket".`
    )
    .setFooter({ text: BRAND.footer });

  await channel.send({
    content: staffRoleId ? `<@&${staffRoleId}>` : "",
    embeds: [embed],
    components: [closeRow],
  });
  await interaction.editReply(`Ticket vytvorený: ${channel}`);
}

async function closeTicket(interaction: ButtonInteraction) {
  const channel = interaction.channel;
  if (!channel || channel.type !== ChannelType.GuildText) return;
  await interaction.reply({
    content: "🔒 Ticket sa zatvára o 5 sekúnd…",
  });
  setTimeout(() => {
    (channel as TextChannel).delete().catch(() => {});
  }, 5000);
}
