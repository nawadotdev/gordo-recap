import { Collection, Snowflake } from "discord.js";

const recapCooldownSet = new Collection<Snowflake, number>();

const COOLDOWN_TIME = 10 * 60 * 1000; //10 mins

const isOnCooldown = (userId: Snowflake): number => {
    const cooldown = recapCooldownSet.get(userId);
    if (!cooldown) return 0;
    const now = Date.now();
    return Math.floor((cooldown - now) / (60 * 1000));
}

const addCooldown = (userId: Snowflake): void => {
    const now = Date.now();
    recapCooldownSet.set(userId, now + COOLDOWN_TIME);
}

const removeCooldown = (userId: Snowflake): void => {
    recapCooldownSet.delete(userId);
}

const resetCooldown = (userId: Snowflake): void => {
    recapCooldownSet.set(userId, Date.now() + COOLDOWN_TIME);
}

export const recapCooldown = {
    isOnCooldown,
    addCooldown,
    removeCooldown,
    resetCooldown
}