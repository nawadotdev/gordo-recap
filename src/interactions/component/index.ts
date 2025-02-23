import { Collection } from "discord.js";
import { Component } from "../../types";
import { pingButton } from "./ping";

export const components = new Collection<string, Component>();

components.set(pingButton.customId, pingButton);