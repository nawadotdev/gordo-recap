import { Guild, MessageFlags, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types";
import { permissionCheck } from "../../utils/Commands/permittionCheck";
import { subscriptionService } from "../../services/subscriptions";
import { subscriptionUtils } from "../../utils/Subscriptions/sub";

export const manageCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("manage")
        .setDescription("Manage the subscriptions")
        .addSubcommand(subcommand => subcommand
            .setName("add")
            .setDescription("Permit a guild to use the bot")
            .addStringOption(option => option
                .setName("guild")
                .setDescription("The guild to add the subscription to")
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("remove")
            .setDescription("Remove a guild from the bot")
            .addStringOption(option => option
                .setName("guild")
                .setDescription("The guild to remove from the bot")
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("list")
            .setDescription("List all the guilds that are using the bot")
        ),
    execute: async (interaction) => {

        if (!permissionCheck(interaction)) {
            await interaction.reply({ content: `You are not permitted to use this command`, flags: MessageFlags.Ephemeral });
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "add") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let guildId = interaction.options.getString("guild");

            if (!guildId) {
                await interaction.reply({ content: `You did not provide a guild`, flags: MessageFlags.Ephemeral });
                return;
            }

            let guild: Guild | null = null;

            if (subscriptionUtils.isSubscribed(guildId)) {
                await interaction.editReply({ content: `The guild ${guildId} is already subscribed to the bot` });
                return;
            }

            try {
                guild = await interaction.client.guilds.fetch(guildId);
            } catch (error) {
                await interaction.editReply({ content: `The bot does not have access to the guild ${guildId}` });
                return;
            }
            try {
                await subscriptionService.addSubscription(guildId);
            } catch (error) {
                await interaction.editReply({ content: `The guild ${guild?.name} is already subscribed to the bot` });
                return;
            }

            await interaction.editReply({ content: `The guild ${guild?.name} has been added to the bot` });
        } else if (subcommand === "remove") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let guildId = interaction.options.getString("guild");

            if (!guildId) {
                await interaction.reply({ content: `You did not provide a guild`, flags: MessageFlags.Ephemeral });
                return;
            }

            if(!subscriptionUtils.isSubscribed(guildId)){
                await interaction.editReply({ content: `The guild ${guildId} is not subscribed to the bot`});
                return;
            }

            await subscriptionService.removeSubscription(guildId);
            await interaction.editReply({ content: `The guild ${guildId} has been removed from the bot`});
        }else if(subcommand === "list"){
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const guilds = await subscriptionService.getSubscriptions();
            await interaction.editReply({ content: `The guilds that are subscribed to the bot are:\n${guilds.map(guild => guild.guildId).join("\n")}`});
        }
    }

}