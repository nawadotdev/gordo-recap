import { BaseInteraction, Client, Events, MessageFlags } from "discord.js";
import { Event } from "../types";
import { commands, components } from "../interactions";
import { logger } from "../lib";

export const interactionCreate : Event = {
    event: Events.InteractionCreate,
    execute: async (client: Client, interaction: BaseInteraction) => {

        if(interaction.isChatInputCommand()){
            const command = commands.get(interaction.commandName);

            if(!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing ${interaction.commandName}`);
                logger.error(error);
                if(interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }
        }else if(interaction.isMessageComponent()){
            const component = components.get(interaction.customId);

            if(!component) {
                logger.error(`No component matching ${interaction.customId} was found.`);
                return;
            }

            try {
                await component.execute(interaction);
            } catch (error) {
                logger.error(`Error executing ${interaction.customId}`);
                logger.error(error);
            }

        }
    }
    
}