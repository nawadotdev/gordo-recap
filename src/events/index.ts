import { Collection, Client } from 'discord.js';
import { Event } from '../types';
import { clientReady } from './clientReady';
import { logger } from '../lib';
import { interactionCreate } from './interactionCreate';
import { messageCreate } from './messageCreate';

const events = new Collection<string, Event>();

const eventList = [clientReady, interactionCreate, messageCreate];

for (const event of eventList) {
    logger.debug(`Loading event: ${event.event}`);
    events.set(event.event, event);
}

export const registerEvents = (client: Client) => {
    events.forEach((event) => {
        const execute = (...args: any[]) => event.execute(client, ...args);
        if (event.once) {
            client.once(event.event, execute);
        } else {
            client.on(event.event, execute);
        }
        logger.debug(`Registered event: ${event.event}`);
    });
};

export default events;
