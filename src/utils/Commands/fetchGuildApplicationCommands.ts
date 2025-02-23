import { Client, ClientApplication, Collection, REST, Routes, SlashCommandBuilder, Snowflake } from "discord.js";
import { SlashCommand } from "../../types";
import "dotenv/config";

export async function fetchGuildApplicationCommands(
    client: Client,
    commands: Collection<string, SlashCommand>,
): Promise<Snowflake[]> {

    const token = process.env.DISCORD_TOKEN;

    if (!token) {
        throw new Error("No token found");
    }

    if (!client.application || !client.application.id) {
        throw new Error("Client application is not available or has no ID");
    }
    
    const rest = new REST().setToken(token)

    const botCommands = commands.map(c => c.command.toJSON()).sort((a, b) => a.name.localeCompare(b.name))

    const guilds : Snowflake[] = client.guilds.cache.map(g => g.id)

    const guildIds : Snowflake[] = []

    await Promise.all(
        guilds.map(async (guild) => {
            const commands : SlashCommandBuilder[] = await rest.get(
                Routes.applicationGuildCommands((client.application as ClientApplication).id, guild)
            ) as SlashCommandBuilder[]

            const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name))

            if(sortedCommands.length !== botCommands.length) {
                return guildIds.push(guild as Snowflake)
            }

            for(let i = 0; i < sortedCommands.length; i++) {
                if(sortedCommands[i].name !== botCommands[i].name || sortedCommands[i].description !== botCommands[i].description) {
                    return guildIds.push(guild as Snowflake)
                }
            }
            
                
        })
    )
    
    return guildIds
}