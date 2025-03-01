import { Events } from "discord.js";
import { Event } from "../types";
import { logger } from "../lib";
import {fetchGuildApplicationCommands, registerGuildApplicationCommands} from "../utils";
import { commands } from "../interactions";

export const clientReady: Event = {
    event: Events.ClientReady,
    execute: async (client) => {
        logger.info(`Logged in as ${client.user?.tag}`);
        // try{
        //     const guildIds = await fetchGuildApplicationCommands(client, commands);
        //     if(guildIds.length > 0) {
        //         logger.info(`Updating guild application commands`);
        //         try{
        //             await registerGuildApplicationCommands(client, commands, guildIds);
        //             logger.info(`Guild application commands updated`);
        //         }catch(error){
        //             logger.error(`Error updating guild application commands: ${error}`);
        //         }
        //     }else{
        //         logger.info(`No guild application commands to update`);
        //     }
        // }catch(error){
        //     logger.error(`Error fetching guild application commands: ${error}`);
        // }
        const guildIds = await client.guilds.fetch();
        try{
            await registerGuildApplicationCommands(client, commands, guildIds.map(guild => guild.id));
            logger.info(`Guild application commands updated`);
        }catch(error){
            logger.error(`Error registering guild application commands: ${error}`);
        }
    }
}