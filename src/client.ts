import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import Config from "./config.js";
import CommandModule from "./structures/CommandModule.js";
import EventModule from "./structures/EventModule.js";
import { existsSync } from "fs";
import GuildData from "./structures/GuildData.js";
import { guildRepository } from "./db/guildRepository.js";
import signale, { Signale } from "signale";

/*
  Extension of the Discord.JS Client class. Serves to store collections of commands, events. etc...
*/

export default class BaseClient extends Client {
  /* The commands and events modules hold all of the defined events and manage their execution. */
  public commands: CommandModule;
  public events: EventModule;
  /* guildData holds information on guilds that is accessed regularly enough that avoiding a DB call is necessary. E.G. prefixes */
  public guildData: Collection<string, GuildData>;
  /* The directory in which code is held. */
  public readonly dirname: string;
  public logger: Signale;
  constructor(registerCommands: boolean = false) {
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
    this.guildData = new Collection<string, GuildData>();
    this.dirname = existsSync("./src") ? "./src" : "./";
    if (registerCommands) {
      this.commands.loadAndRegisterAll();
    } else {
      this.commands.loadAll();
    }
    this.events.loadAll();
    this.logger = signale;
  }

  /**
   * Fetches the information about the provided guild either from guildData or the DB
   * @param {string} discordId The ID of the guild to fetch the data for.
   * @returns {Promise<GuildData | undefined>}
   */
  async getGuildData(discordId: string): Promise<GuildData | undefined> {
    const data = this.guildData.get(discordId);
    if (data) return data;

    try {
      const dbData = await guildRepository.findByDiscordId(discordId);
      if (dbData) {
        this.guildData.set(discordId, { prefix: dbData.prefix });
        return { prefix: dbData.prefix };
      }
    } catch (e) {
      this.logger.warn(
        `Guild information failed to load data for ${discordId}: ${e}`,
      );
    }
    return undefined;
  }

  async start() {
    try {
      await super.login(Config.TOKEN);
    } catch (e) {
      this.logger.error("Failure during client startup");
      this.logger.error(e);
      process.exit(-1);
    }
  }
}
