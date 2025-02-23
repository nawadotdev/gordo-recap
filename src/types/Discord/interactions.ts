import { ChatInputCommandInteraction, MessageComponentInteraction, SlashCommandBuilder } from "discord.js";

export type SlashCommand = {
    command: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export type Component = {
    customId: string,
    execute: (interaction: MessageComponentInteraction) => Promise<void>
}