import { Collection, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { Call } from "../../Models/Call.model";
import { getOhlcv, getSupply } from "../../services";
import { recapCooldown } from "../../utils/Cooldown/recap";

const permittedGuilds = [
    "1175938266718031962",
    "1344749364051968001"
]

export const recapCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("recap")
        .setDescription("Recap of the last calls")
        .addStringOption(option =>
            option
                .setName("channel")
                .setDescription("Channel")
                .setRequired(true)
                .addChoices(
                    { name: "5m", value: "1342684468191957012" },
                    { name: "2h", value: "1342563621498257538" },
                    { name: "degen", value: "1344854970960183336" }
                )
        )
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

        let guild = interaction.guild;

        if (!guild) {
            await interaction.reply({ content: `This command can only be used in a server`, flags: MessageFlags.Ephemeral});
            return;
        }

        if (recapCooldown.isOnCooldown(guild.id) && permittedGuilds.includes(guild.id)) {
            await interaction.reply({ content: `Server is on cooldown. Please wait ${recapCooldown.isOnCooldown(guild.id)} minutes before using the command again. (Server based cooldown)`, flags: MessageFlags.Ephemeral });
            return;
        }

        recapCooldown.addCooldown(guild.id);

        await interaction.deferReply()

        const _time = interaction.options.getString("time");
        if (!_time) return;

        const _channel = interaction.options.getString("channel");
        if (!_channel) return;


        const time = parseInt(_time);
        const startTime = Date.now() - time * 60 * 60 * 1000;

        const calls = await Call.find({
            calledAt: { $gte: startTime },
            channelId: _channel
        });


        if (calls.length === 0) {
            await interaction.editReply({ content: `No calls found for the last ${time} hours` });
            return;
        }

        await interaction.editReply({ content: `Creating recap for the last ${time} hours: ${calls.length} calls` });

        const uniqueAddresses = new Set<string>();
        for (const call of calls) {
            uniqueAddresses.add(call.publicKey);
        }

        const recap: any[] = [];

        for (const address of uniqueAddresses) {
            console.log("Processing", address)
            const firstCall = await Call.findOne({ publicKey: address, channelId: _channel, calledAt: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 } }).sort({ calledAt: 1 });
            if (!firstCall) {
                console.log("No first call found for", address)
                continue;
            }
            const aMinuteBeforeFirstCall = firstCall.calledAt - 60 * 1000;
            const now = Date.now();
            const minutesBetween = Math.floor((now - aMinuteBeforeFirstCall) / (60 * 1000));
            let ohlcv: any;
            try {
                ohlcv = await getOhlcv(address, minutesBetween+5, 1, firstCall.calledAt)
            } catch (err) {
                console.log("Error getting ohlcv for", address, minutesBetween, err)
                continue;
            }

            if (!ohlcv) {
                console.log("No ohlcv found for", address)
                continue;
            }

            let point = 0
            for (let i = 0; i < ohlcv.data.length; i++) {
                if (ohlcv.data[i].timestamp > firstCall.calledAt) {
                    point = i
                    break
                }
            }

            const filteredOhlcv = ohlcv.data.slice(point > 0 ? point-1 : 0)

            let highestUsdc = 0
            let highestUsdcTimestamp = 0
            for (let i = 0; i < filteredOhlcv.length; i++) {
                if (filteredOhlcv[i].highUsdc > highestUsdc) {
                    highestUsdc = filteredOhlcv[i].highUsdc
                    highestUsdcTimestamp = filteredOhlcv[i].timestamp
                }
            }


            const supply = await getSupply(address)
            if (!supply) {
                console.log("No supply found for", address)
                continue;
            }

            const ath = highestUsdc * supply

            const pumpAmount = ath / firstCall.marketCap

            const recapItem = {
                symbol: firstCall.symbol,
                address,
                pumpAmount: pumpAmount.toFixed(2),
                emoji: pumpAmount > 10 ? "🚀" : pumpAmount > 5 ? "💰" : pumpAmount > 2 ? "💸" : pumpAmount > 1 ? "💵" : "💵",
                ath: ath,
                firstCall: firstCall.calledAt,
                firstCallMarketCap: firstCall.marketCap,
                athTimestamp: highestUsdcTimestamp // can be used
            }

            recap.push(recapItem)


        }
        const sortedRecaps = recap.sort((a, b) => b.pumpAmount - a.pumpAmount)

        const strings = []

        let embedStr = ""
        for (let i = 0; i < sortedRecaps.length; i++) {
            const item = sortedRecaps[i]
            embedStr += `${item.emoji} [${item.symbol}](https://dexscreener.com/solana/${item.address}) - **${item.pumpAmount}x** (${formatMarketCap(item.ath)}) | Called <t:${Math.floor(item.firstCall / 1000)}:R> @ ${formatMarketCap(item.firstCallMarketCap)}\n`

            if (embedStr.length > 3000 || i === sortedRecaps.length - 1) {
                strings.push(embedStr)
                embedStr = ""
            }

        }

        const numberOfCalls = recap.length
        const averagePump = recap.reduce((acc, item) => acc + Number(item.pumpAmount), 0) / numberOfCalls


        for (let i = 0; i < strings.length; i++) {
            if (i === 0) {
                const embed = new EmbedBuilder()
                    .setTitle(`Recap ${time}h`)
                    .setDescription(`🖥️ <#${_channel}>\n⏰ ${time}h\n🪙 ${recap.length} tokens\n💰 Avg. Profit: ${averagePump.toFixed(2)}x\n\n${strings[i]}`)
                    .setFooter({ text: `Powered by @nawadotdev` })
                    .setColor(averagePump > 5 ? "Green" : averagePump > 2 ? "Yellow" : "Red")

                await interaction.editReply({ embeds: [embed] })
            } else {
                const embed = new EmbedBuilder()
                    .setDescription(`${strings[i]}`)
                    .setFooter({ text: `Powered by @nawadotdev` })
                    .setColor(averagePump > 5 ? "Green" : averagePump > 2 ? "Yellow" : "Red")

                await interaction.followUp({ embeds: [embed] })
            }

        }

    }
}


function formatMarketCap(value: number | null): string | null {
    if (value === null) return null;
    if (value < 1e3) return value.toFixed(2);

    const suffixes = [
        { suffix: 'B', value: 1e9 },
        { suffix: 'M', value: 1e6 },
        { suffix: 'K', value: 1e3 },
    ];

    for (const { suffix, value: threshold } of suffixes) {
        if (value >= threshold) {
            return (value / threshold).toFixed(2).replace(/\.00$/, '') + suffix;
        }
    }

    return value.toString();
}