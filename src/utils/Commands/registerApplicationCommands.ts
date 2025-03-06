import { Client, ClientApplication, Collection, REST, Routes, Snowflake } from "discord.js";
import { SlashCommand } from "../../types";
import "dotenv/config";

export async function registerApplicationCommands(
    client: Client,
    commands: Collection<string, SlashCommand>
): Promise<void> {

    const token = process.env.DISCORD_TOKEN;

    if (!token) {
        throw new Error("No token found");
    }

    if (!client.application || !client.application.id) {
        throw new Error("Client application is not available or has no ID");
    }
    
    const rest = new REST().setToken(token)

    await rest.put(
        Routes.applicationCommands((client.application as ClientApplication).id),
        {
            body: commands.map(c => c.command.toJSON())
        }
    )
    
}