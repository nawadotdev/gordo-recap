import { Snowflake } from "discord.js"
import Guild from "../Models/Guild.model"
import { logger } from "../lib";
import { subscriptionUtils } from "../utils/Subscriptions/sub";
import { IGuild } from "../types/Models/Guild";

const addSubscription = async (guildId: Snowflake): Promise<void> => {

    try{
        if(await Guild.exists({guildId})){
            logger.info(`Guild ${guildId} already exists`);
            throw new Error(`Guild ${guildId} already exists`);
        }

        const guild = await Guild.create({guildId});
        subscriptionUtils.addSubscription(guildId, guild);
        
    }catch(error){
        logger.error(`Error adding subscription: ${error}`);
        throw new Error(`Error adding subscription: ${error}`);
    }

}

const removeSubscription = async (guildId: Snowflake): Promise<void> => {

    try{
        await Guild.deleteOne({guildId});
        subscriptionUtils.removeSubscription(guildId);
    }catch(error){
        logger.error(`Error removing subscription: ${error}`);
        throw new Error(`Error removing subscription: ${error}`);
    }
}

const getSubscriptions = async (): Promise<IGuild[]> => {
    try{
        const guilds = await Guild.find();
        return guilds;
    }catch(error){
        logger.error(`Error getting subscriptions: ${error}`);
        throw new Error(`Error getting subscriptions: ${error}`);
    }

}

const updateSubscription = async (guildId: Snowflake, guild: IGuild): Promise<void> => {
    try{
        await Guild.updateOne({guildId}, {$set: guild});
        subscriptionUtils.addSubscription(guildId, guild);
    }catch(error){
        logger.error(`Error updating subscription: ${error}`);
        throw new Error(`Error updating subscription: ${error}`);
    }
}

export const subscriptionService = {
    addSubscription,
    removeSubscription,
    getSubscriptions,
    updateSubscription
}

