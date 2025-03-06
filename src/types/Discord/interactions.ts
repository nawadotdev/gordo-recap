import { ChatInputCommandInteraction, MessageComponentInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export type SlashCommand = {
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

export type Component = {
    customId: string,
    execute: (interaction: MessageComponentInteraction) => Promise<void>
}