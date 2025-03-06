import { recapCommand } from "./recap";
import { SlashCommand } from "../../types";
import { Collection } from "discord.js";
import { checkCommand } from "./check";

export const commands = new Collection<string, SlashCommand>();

export const adminCommands = new Collection<string, SlashCommand>();

commands.set(recapCommand.command.name, recapCommand);

adminCommands.set(checkCommand.command.name, checkCommand);