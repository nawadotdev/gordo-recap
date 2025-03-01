import { Events, Message } from "discord.js";
import { Event } from "../types";
import { Call } from "../Models/Call.model";

const monitorChannel = ["1342684468191957012", "1342563621498257538", "1344854970960183336"]

export const messageCreate: Event = {
    event: Events.MessageCreate,
    execute: async (client, message: Message) => {

        if (!monitorChannel.includes(message.channel.id)) return;

        const description = message.embeds?.[0]?.description;
        if (!description) return;

        const mcMatch = description.match(/\*\*MC\*\*:\s*\$?([\d,.\dKMB]+)/);
        const marketCap = mcMatch ? parseMarketCap(mcMatch[1]) : null;

        const dxMatch = description.match(/\[DS\]\(<https?:\/\/dexscreener\.com\/solana\/([\w\d]+)\>/);
        const publicKey = dxMatch ? dxMatch[1] : null;

        const tokenMatch = description.match(/‼️ 🟢 MULTI BUY \*\*(\w+)\*\*/);
        const tokenSymbol = tokenMatch ? tokenMatch[1] : null;

        if (publicKey && marketCap && tokenSymbol) {
            await Call.create({
                publicKey,
                marketCap,
                symbol: tokenSymbol,
                calledAt: message.createdTimestamp,
                channelId: message.channel.id
            })
        } else {
            console.log(`${publicKey}: ${tokenSymbol} @ ${marketCap}`)
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