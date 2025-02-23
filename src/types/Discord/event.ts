import { ClientEvents, Client } from "discord.js"

export type Event<K extends keyof ClientEvents = any> = {
    event: K,
    once?: boolean,
    execute: (client: Client, ...args: ClientEvents[K]) => void
}