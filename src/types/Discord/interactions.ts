import { ChatInputCommandInteraction, MessageComponentInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export type SlashCommand = {
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export type Component = {
    customId: string,
    execute: (interaction: MessageComponentInteraction) => Promise<void>
}