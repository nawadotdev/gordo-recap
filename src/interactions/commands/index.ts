import { pingCommand } from "./ping";
import { SlashCommand } from "../../types";
import { Collection } from "discord.js";

export const commands = new Collection<string, SlashCommand>();

commands.set(pingCommand.command.name, pingCommand);