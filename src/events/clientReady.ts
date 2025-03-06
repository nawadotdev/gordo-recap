import { Collection, Events } from "discord.js";
import { Event } from "../types";
import { logger } from "../lib";
import {fetchGuildApplicationCommands, registerGuildApplicationCommands} from "../utils";
import { commands } from "../interactions";
import { registerApplicationCommands } from "../utils/Commands/registerApplicationCommands";

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
        if(process.argv[2] === "delete-guild-application-commands"){
            const guilds = await client.guilds.fetch();
            try{
                await registerGuildApplicationCommands(client, new Collection(), guilds.map(guild => guild.id));
                logger.info(`Guild application commands deleted`);
            }catch(error){
                logger.error(`Error deleting guild application commands: ${error}`);
            }
        }
        if(process.argv[2] === "register-guild-application-commands"){
        const guildIds = await client.guilds.fetch();
        try{
            await registerGuildApplicationCommands(client, commands, guildIds.map(guild => guild.id));
            logger.info(`Guild application commands updated`);
            }catch(error){
                logger.error(`Error registering guild application commands: ${error}`);
            }
        }
        if(process.argv[2] === "register-application-commands"){
            try{        
                await registerApplicationCommands(client, commands);
                logger.info(`Application commands updated`);
            }catch(error){
                logger.error(`Error registering application commands: ${error}`);
            }
        }
    }
}