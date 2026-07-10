import type {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import * as setup from "./setup";
import { miscCommands } from "./misc";

export type Command = {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (i: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: Command[] = [
  { data: setup.data, execute: setup.execute },
  ...miscCommands,
];

// mapa podľa mena pre rýchly dispatch
export const commandMap = new Map(commands.map((c) => [c.data.name, c]));
