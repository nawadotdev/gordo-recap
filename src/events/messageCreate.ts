import { Events, Message, WebhookClient } from "discord.js";
import { Event } from "../types";
import { Call } from "../Models/Call.model";
import { subscriptionUtils } from "../utils/Subscriptions/sub";
import { logger } from "../lib";
import { webhookMessageOptions } from "../constants/bot";

const channel5m = "1342684468191957012"
const channel2h = "1342563621498257538"
const channelDegen = "1344854970960183336"

const monitorChannel = [channel5m, channel2h, channelDegen]

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
            if (process.argv[2] === "dev") {
                logger.debug(`${publicKey}: ${tokenSymbol} @ ${marketCap}`)
            }
            if (process.argv[2] !== "dev") {
                await Call.create({
                    publicKey,
                    marketCap,
                    symbol: tokenSymbol,
                    calledAt: message.createdTimestamp,
                    channelId: message.channel.id
                })
            }
            if (message.channel.id === channel5m || message.channel.id === channelDegen) {
                const subscriptions = subscriptionUtils.getSubscriptions();
                if (message.channel.id === channel5m) {
                    await Promise.allSettled(subscriptions.map(async (subscription) => {
                        if (subscription.channel5m) {
                            const webhook = new WebhookClient({ url: subscription.channel5m })
                            await webhook.send({
                                content: `\`\`\`${publicKey}\`\`\`\n${tokenSymbol} @ ${marketCap}`,
                                ...webhookMessageOptions
                            })
                        }
                    }))
                } else if (message.channelId == channelDegen) {
                    await Promise.allSettled(subscriptions.map(async (subscription) => {
                        if (subscription.channelDegen) {
                            const webhook = new WebhookClient({ url: subscription.channelDegen })
                            await webhook.send({
                                content: `\`\`\`${publicKey}\`\`\`\n${tokenSymbol} @ ${marketCap}`,
                                ...webhookMessageOptions
                            })
                        }
                    }))
                }

            }
        } else {
            logger.info(`No match found`)
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