import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { subscriptionService } from "../../services/subscriptions";
import { subscriptionUtils } from "../../utils/Subscriptions/sub";
import { discordService } from "../../services/discord";


export const setCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("set")
        .setDescription("Set the webhook for the monitoring channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option
            .setName("monitor")
            .setDescription("The monitor to set the webhook for")
            .setRequired(true)
            .addChoices(
                { name: "5m", value: "channel5m" },
                //{ name: "2h", value: "1342563621498257538" },
                { name: "degen", value: "channelDegen" }
            )
        )
        .addStringOption(option => option
            .setName("webhook")
            .setDescription("The webhook url to set")
            .setRequired(true)
        ),
    execute: async (interaction) => {

        const monitor = interaction.options.getString("monitor");
        const webhook = interaction.options.getString("webhook");

        if(!monitor || !webhook){
            await interaction.reply({ content: "Please provide a monitor and a webhook url", flags: MessageFlags.Ephemeral });
            return;
        }

        if(!subscriptionUtils.isSubscribed(interaction.guildId!)){
            await interaction.reply({ content: "You are not subscribed to the bot", flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try{
            await discordService.sendWebhookMessage(webhook, { content: "Hello world!" });
        }catch(error){
            await interaction.editReply({ content: "Failed to send webhook message" });
            return;
        }

        const subscription = subscriptionUtils.getSubscription(interaction.guildId!);

        if(!subscription){
            await interaction.editReply({ content: "Subscription not found" });
            return;
        }


        if(monitor === "channel5m"){
            subscription.channel5m = webhook;
        }else if(monitor === "channelDegen"){
            subscription.channelDegen = webhook;
        }

        await subscriptionService.updateSubscription(subscription.guildId, subscription);

        await interaction.editReply({ content: "Webhook set" });

    }

}