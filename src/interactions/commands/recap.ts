import { Collection, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { Call } from "../../Models/Call.model";
import { getOhlcv, getSupply } from "../../services";

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

        await interaction.deferReply({ flags: MessageFlags.Ephemeral})

        const _time = interaction.options.getString("time");
        if (!_time) return;

        const time = parseInt(_time);
        const startTime = Date.now() - time * 60 * 60 * 1000;

        const calls = await Call.find({
            calledAt: { $gte: startTime }
        });

        if(calls.length === 0){
            await interaction.editReply({ content: `No calls found for the last ${time} hours` });
            return;
        }

        await interaction.editReply({ content: `Creating recap for the last ${time} hours: ${calls.length} calls` });

        const uniqueAddresses = new Set<string>();
        for(const call of calls){
            uniqueAddresses.add(call.publicKey);
        }

        const recap: any[] = [];

        for(const address of uniqueAddresses){  
            const firstCall = await Call.findOne({ publicKey: address, calledAt: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 } }).sort({ calledAt: 1 });
            if(!firstCall){
                console.log("No first call found for", address)
                continue;
            }
            const hours = (Date.now() - firstCall.calledAt) / (60 * 60 * 1000);
            let ohlcv: any;
            try{
                ohlcv = await getOhlcv(address, (Math.ceil(hours) + 1)*12, 5)
            }catch(err){
                console.log("Error getting ohlcv for", address, hours, err)
                continue;
            }

            ohlcv.data = ohlcv.data.filter((item: any) => item.timestamp > firstCall.calledAt)

            const filteredOhlcv = ohlcv.data.filter((item: any, index: number) => {
                if(index === 0) return true;
                if(item.highUsdc > ohlcv.data[index - 1].highUsdc * 10) return false;
                return true;
            })

            const highestUsdc = filteredOhlcv.reduce((max: number, current: any) => {
                return Math.max(max, current.highUsdc);
            }, 0);
            
            

            const supply = await getSupply(address)
            if(!supply){
                console.log("No supply found for", address)
                continue;
            }

            const ath = highestUsdc * supply

            const pumpAmount = ath / firstCall.marketCap

            const recapItem = {
                symbol: firstCall.symbol,
                address,
                pumpAmount : pumpAmount.toFixed(2),
                emoji : pumpAmount > 10 ? "🚀" : pumpAmount > 5 ? "💰" : pumpAmount > 2 ? "💸" : pumpAmount > 1 ? "💵" : "💵",
                ath : ath
            }

            recap.push(recapItem)


        }
        const recapString = recap.sort((a, b) => b.pumpAmount - a.pumpAmount).map((item, index) => {
            return `${item.emoji} [${item.symbol}](https://dexscreener.com/solana/${item.address}) - ${item.pumpAmount}x (${formatMarketCap(item.ath)})`
        }).join("\n")

        const embed = new EmbedBuilder()
        .setTitle(`Recap ${time}h`)
        .setDescription(recapString)
        .setFooter({ text: `Powered by @nawadotdev` })

        await interaction.editReply({  embeds: [embed] })
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