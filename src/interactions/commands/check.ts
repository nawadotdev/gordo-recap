import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { Call } from "../../Models/Call.model";

export const checkCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("check")
        .setDescription("Check a message to see if it's a call")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Message")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName("add")
                .setDescription("Add the call to the database")
                .setRequired(false)
        ),
    execute: async (interaction) => {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const messageId = interaction.options.getString("message");
        if (!messageId) return;

        const message = await interaction.channel?.messages.fetch(messageId);
        if (!message) return;

        const add = interaction.options.getBoolean("add");

        
        const description = message.embeds?.[0]?.description;
        if (!description) return;
        
        const mcMatch = description.match(/\*\*MC\*\*:\s*\$?([\d,.\dKMB]+)/);
        const marketCap = mcMatch ? parseMarketCap(mcMatch[1]) : null;

        const dxMatch = description.match(/\[DS\]\(<https?:\/\/dexscreener\.com\/solana\/([\w\d]+)\>/);
        const publicKey = dxMatch ? dxMatch[1] : null;

        const tokenMatch = description.match(/‼️ 🟢 MULTI BUY \*\*(.+?)\*\*/);
        const tokenSymbol = tokenMatch ? tokenMatch[1] : null;

        if (publicKey && marketCap && tokenSymbol) {
            await interaction.editReply({ content: `Token: ${tokenSymbol}\nMarket Cap: ${marketCap}\nPublic Key: ${publicKey}` });
            if (add) {
                await Call.create({
                    publicKey,
                    marketCap,
                    symbol: tokenSymbol,
                    calledAt: message.createdTimestamp,
                    channelId: interaction.channelId
                })
            }
        } else {
            await interaction.editReply({ content: `Not a call` });
        }




    }
}


function parseMarketCap(marketCap: string | null): number | null {
    if (!marketCap) return null;

    const multipliers: { [key: string]: number } = { 'K': 1e3, 'M': 1e6, 'B': 1e9 };
    const match = marketCap.match(/([\d,.]+)([KMB]?)/);

    if (!match) return null;

    let number = parseFloat(match[1].replace(/,/g, ''));
    let multiplier = multipliers[match[2]] || 1;

    return number * multiplier;
}