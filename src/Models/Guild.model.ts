import { Schema, model } from "mongoose";
import { IGuild } from "../types/Models/Guild";

const GuildSchema = new Schema<IGuild>({
    guildId: { type: String, required: true, unique: true },
    channel5m: { type: String, required: false },
    channelDegen: { type: String, required: false },
});

const Guild = model<IGuild>("Guild", GuildSchema);

export default Guild;