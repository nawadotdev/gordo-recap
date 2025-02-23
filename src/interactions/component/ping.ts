
import { MessageFlags } from "discord.js";
import { Component } from "../../types";

export const pingButton : Component = {
    customId: "ping",
    execute: async (interaction) => {   

        await interaction.reply({
            content: "Pong!",
            flags: MessageFlags.Ephemeral,
        })

    }
}