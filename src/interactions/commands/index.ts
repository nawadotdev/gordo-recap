import { recapCommand } from "./recap";
import { SlashCommand } from "../../types";
import { Collection } from "discord.js";
import { checkCommand } from "./check";

export const commands = new Collection<string, SlashCommand>();

commands.set(recapCommand.command.name, recapCommand);
commands.set(checkCommand.command.name, checkCommand);