import { Collection, Snowflake } from "discord.js";
import { IGuild } from "../../types/Models/Guild";

const subscriptionSet = new Collection<Snowflake, IGuild>();

const addSubscription = (guildId: Snowflake, guild: IGuild) => {
    subscriptionSet.set(guildId, guild);
}

const removeSubscription = (guildId: Snowflake) => {
    subscriptionSet.delete(guildId);
}

const getSubscriptions = () => {
    return subscriptionSet;
}

const isSubscribed = (guildId: Snowflake) => {
    return subscriptionSet.has(guildId);
}

const getSubscription = (guildId: Snowflake) => {
    return subscriptionSet.get(guildId);
}

export const subscriptionUtils = {
    addSubscription,
    removeSubscription,
    getSubscriptions,
    isSubscribed,
    getSubscription
}