import { Message, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";

type Catch = {
    marketCap: number | null;
    publicKey: string | null;
};

function parseMarketCap(marketCap: string | null): number | null {
    if (!marketCap) return null;

    const multipliers: { [key: string]: number } = { 'K': 1e3, 'M': 1e6, 'B': 1e9 };
    const match = marketCap.match(/([\d,.]+)([KMB]?)/);

    if (!match) return null;

    let number = parseFloat(match[1].replace(/,/g, ''));
    let multiplier = multipliers[match[2]] || 1;

    return number * multiplier;
}

export const recapCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("recap")
        .setDescription("Recap")
        .addStringOption(option =>
            option
                .setName("time")
                .setDescription("Time")
                .setRequired(true)
                .addChoices(
                    { name: "6h", value: "6" },
                    { name: "12h", value: "12" },
                    { name: "24h", value: "24" }
                )
        ),
    execute: async (interaction) => {
        const _time = interaction.options.getString("time");
        if (!_time) return;

        const time = parseInt(_time);
        const startTime = Date.now() - time * 60 * 60 * 1000;

        let messageStorage: Message[] = [];
        let lastMessageId: string | undefined;

        while (true) {
            const fetchedMessages = await interaction.channel?.messages.fetch({
                limit: 100,
                ...(lastMessageId ? { before: lastMessageId } : {}),
            });

            if (!fetchedMessages || fetchedMessages.size === 0) break;

            const messagesArray = Array.from(fetchedMessages.values());
            messageStorage.push(...messagesArray);

            if (messagesArray[messagesArray.length - 1].createdTimestamp < startTime) break;

            lastMessageId = messagesArray[messagesArray.length - 1].id;
        }

        messageStorage = messageStorage.filter(message => message.createdTimestamp > startTime);

        const catches: Catch[] = [];

        for (const message of messageStorage) {
            const description = message.embeds?.[0]?.description;
            if (!description) continue;

            const mcMatch = description.match(/\*\*MC\*\*:\s*\$?([\d,.\dKMB]+)/);
            const marketCap = mcMatch ? parseMarketCap(mcMatch[1]) : null;

            const dxMatch = description.match(/\[DS\]\(<https?:\/\/dexscreener\.com\/solana\/([\w\d]+)\>/);
            const publicKey = dxMatch ? dxMatch[1] : null;

            catches.push({ marketCap, publicKey });
        }

        console.log(catches);
    }
};
