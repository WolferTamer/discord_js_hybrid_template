import { Client, GatewayIntentBits, Partials } from "discord.js";
import Config from "./config.js";
import CommandModule from "./structures/CommandModule.js";
import EventModule from "./structures/EventModule.js";
import { existsSync } from "fs";

/*
  Extension of the Discord.JS Client class. Serves to store collections of commands, events. etc...
*/

export default class BaseClient extends Client {
  public commands: CommandModule;
  public events: EventModule;
  public readonly dirname: string;
  constructor() {
    super({
      intents: [
        ...[
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.DirectMessageReactions,
          GatewayIntentBits.DirectMessageTyping,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
        ],
        ...(process.env.PUBLIC_BOT !== "true" ? [] : []),
      ],
      partials: [Partials.Channel, Partials.Message, Partials.Reaction],
      shards: "auto",
      waitGuildTimeout: 60 * 60 * 1000,
    });
    this.commands = new CommandModule(this);
    this.events = new EventModule(this);
    this.dirname = existsSync("./src") ? "./src" : "./";

    this.commands.loadAll();
    this.events.loadAll();
  }

  async start() {
    try {
      await super.login(Config.TOKEN);
    } catch (e) {
      console.error("Failure during client startup");
      console.error(e);
      process.exit(-1);
    }
  }
}
