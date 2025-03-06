import { Snowflake } from "discord.js";

export interface IGuild {
    _id: string;
    guildId: string | Snowflake;
    channel5m?: string | Snowflake;
    channelDegen?: string | Snowflake;
}