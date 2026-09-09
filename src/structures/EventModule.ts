import { Collection } from "discord.js";
import BaseModule from "./BaseModule.js";
import Event from "./Event.js";
import BaseClient from "../client.js";

export default class EventModule extends BaseModule<string, Event<unknown>> {
  collection = new Collection<string, Event<unknown>>();
  constructor(client: BaseClient) {
    super(client, "events");
  }
  async load(filename: string) {
    const event: Event<unknown> = (await import(filename)).default;
    if (this.collection.has(event.id)) throw new Error("Event already exists");
    event.filename = filename;
    this.collection.set(event.id, event);

    this.client.on(event.id, event.execute);
  }
}
