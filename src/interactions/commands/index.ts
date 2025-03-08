import { recapCommand } from "./recap";
import { SlashCommand } from "../../types";
import { Collection } from "discord.js";
import { checkCommand } from "./check";
import { manageCommand } from "./manage";
import { setCommand } from "./set";

const commands = new Collection<string, SlashCommand>();

const adminCommands = new Collection<string, SlashCommand>();

commands.set(recapCommand.command.name, recapCommand);
commands.set(setCommand.command.name, setCommand);

adminCommands.set(manageCommand.command.name, manageCommand);
adminCommands.set(checkCommand.command.name, checkCommand);

export { commands, adminCommands };