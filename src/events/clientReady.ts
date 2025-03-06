import { Collection, Events } from "discord.js";
import { Event } from "../types";
import { logger } from "../lib";
import { registerGuildApplicationCommands} from "../utils";
import { adminCommands, commands } from "../interactions";
import { registerApplicationCommands } from "../utils/Commands/registerApplicationCommands";
import { permittedGuilds } from "../constants/guilds";
import { subscriptionService } from "../services/subscriptions";
import { subscriptionUtils } from "../utils/Subscriptions/sub";

export const clientReady: Event = {
    event: Events.ClientReady,
    execute: async (client) => {
        logger.info(`Logged in as ${client.user?.tag}`);

        const subs = await subscriptionService.getSubscriptions()
        subs.forEach(async (sub) => {
            subscriptionUtils.addSubscription(sub.guildId, sub);
        })

        if(process.argv[2] === "delete-guild-application-commands"){
            const guilds = await client.guilds.fetch();
            try{
                logger.info(`Deleting guild application commands`);
                await registerGuildApplicationCommands(client, new Collection(), guilds.map(guild => guild.id));
                logger.info(`Guild application commands deleted`);
            }catch(error){
                logger.error(`Error deleting guild application commands: ${error}`);
            }
        }
        if(process.argv[2] === "register-guild-application-commands"){
            try{
                logger.info(`Updating guild application commands`);
                await registerGuildApplicationCommands(client, adminCommands, permittedGuilds);
                logger.info(`Guild application commands updated`);
            }catch(error){
                logger.error(`Error registering guild application commands: ${error}`);
            }
        }
        if(process.argv[2] === "register-application-commands"){
            try{        
                logger.info(`Updating application commands`);
                await registerApplicationCommands(client, commands);
                logger.info(`Application commands updated`);
            }catch(error){
                logger.error(`Error registering application commands: ${error}`);
            }
        }
    }
}