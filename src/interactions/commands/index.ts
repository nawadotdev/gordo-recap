import { recapCommand } from "./recap";
import { SlashCommand } from "../../types";
import { Collection } from "discord.js";

export const commands = new Collection<string, SlashCommand>();

commands.set(recapCommand.command.name, recapCommand);