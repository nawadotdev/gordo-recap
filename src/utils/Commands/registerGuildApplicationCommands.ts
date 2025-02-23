import { Client, ClientApplication, Collection, REST, Routes, Snowflake } from "discord.js";
import { SlashCommand } from "../../types";
import "dotenv/config";

export async function registerGuildApplicationCommands(
    client: Client,
    commands: Collection<string, SlashCommand>,
    guildIds: Snowflake[]
): Promise<void> {

    const token = process.env.DISCORD_TOKEN;

    if (!token) {
        throw new Error("No token found");
    }

    if (!client.application || !client.application.id) {
        throw new Error("Client application is not available or has no ID");
    }
    
    const rest = new REST().setToken(token)

    const guilds = guildIds.length > 0 ? guildIds : (client.guilds.cache.map(g => g.id));
    
    await Promise.all(
        guilds.map(async (guild) => {
            await rest.put(
                Routes.applicationGuildCommands((client.application as ClientApplication).id, guild),
                {
                    body: commands.map(c => c.command.toJSON())
                }
            )
        })
    )
    
}