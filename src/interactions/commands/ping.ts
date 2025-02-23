import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";

export const pingCommand : SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Ping the bot"),
    execute: async (interaction) => {   

        const button = new ButtonBuilder()
            .setCustomId("ping")
            .setLabel("Ping")
            .setStyle(ButtonStyle.Primary)

        await interaction.reply({
            content: "Pong!",
            flags: MessageFlags.Ephemeral,
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)]
        })

    }
}