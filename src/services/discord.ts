import { MessagePayload, WebhookClient, WebhookMessageCreateOptions } from "discord.js";

const sendWebhookMessage = async (webhookUrl: string, message: WebhookMessageCreateOptions | MessagePayload) => {

    const webhookClient = new WebhookClient({ url: webhookUrl });

    await webhookClient.send(message);

}

export const discordService = {
    sendWebhookMessage
}
