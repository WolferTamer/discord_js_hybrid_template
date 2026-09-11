import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Collection,
  Guild,
  Interaction,
  InteractionType,
  Message,
  MessageFlags,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  TextChannel,
  User,
} from "discord.js";
import BaseClient from "../client.js";
import BaseModule from "./BaseModule.js";
import Command from "./Command.js";
import { Context } from "./Context.js";
import Config from "../config.js";
import ArgumentVerifier from "../helpers/ArgumentVerifier.js";
import { OptionType } from "../types.js";
import { userRepository } from "../db/userRepository.js";
import { IncludedRow, NoIncludes } from "@prisma/orm-mongo/orm";
import { Contract } from "../prisma/contract.js";
import { guildRepository } from "../db/guildRepository.js";
import { BaseError } from "../errors/index.js";

/**Class that handles the tracking and executing of commands. */
export default class CommandModule extends BaseModule<string, Command> {
  collection = new Collection<string, Command>();
  /**
   * Constructs the CommandModule and adds listeners for command events.
   * @constructor
   * @param {BaseClient} client
   */
  constructor(client: BaseClient) {
    super(client, "commands");

    client.addListener(
      "interactionCreate",
      async (interaction: Interaction) => {
        if (
          interaction.type !== InteractionType.ApplicationCommand ||
          !(interaction instanceof ChatInputCommandInteraction)
        )
          return;
        const command = this.collection.get(interaction.commandName);
        if (!command) return;
        const args = this.parseInteractionArgs(interaction, command);
        try {
          const userData = await this.fetchAuthorData(interaction.user);
          const guildData = interaction.guild
            ? await this.fetchGuildData(interaction.guild)
            : null;

          const context = new Context(interaction, args, userData, guildData);
          if (!command) {
            throw Error("Command does not exist");
          }
          await command.execute(context);
        } catch (e) {
          if (e instanceof BaseError) {
            interaction.reply({
              content:
                "We encountered an error retrieving your data. Please try again.",
              flags: MessageFlags.Ephemeral,
            });
          } else {
            interaction.reply({
              content: "We encountered an error. Please try again.",
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      },
    );

    client.addListener("messageCreate", async (message: Message) => {
      const prefix = await this.getGuildPrefix(message.guildId);
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.split(" ");
      const commandId = args[0].substring(1);
      const command = this.collection.get(commandId);
      if (!command) return;
      const parsedArgs = this.parseMessageArgs(message, command);
      if (parsedArgs.error) {
        (message.channel as TextChannel).send(
          `Unable to parse your command. ${parsedArgs.error}`,
        );
      } else {
        try {
          const userData = await this.fetchAuthorData(message.author);
          const guildData = message.guild
            ? await this.fetchGuildData(message.guild)
            : null;
          const context = new Context(
            message,
            parsedArgs as { [keyof: string]: OptionType },
            userData,
            guildData,
          );
          await command.execute(context);
        } catch (e) {
          if (e instanceof BaseError) {
            message.reply({
              content:
                "We encountered an error retrieving your data. Please try again.",
            });
          } else {
            message.reply({
              content: "We encountered an error. Please try again.",
            });
          }
        }
      }
    });
  }

  /**
   * Gets the assigned prefix for the server or the default value
   * @param {string|null} discordid
   * @returns {string}
   */
  private async getGuildPrefix(discordid: string | null): Promise<string> {
    if (!discordid) return ":";
    const guildData = await this.client.getGuildData(discordid);
    if (!guildData) return ":";
    return guildData.prefix;
  }

  /**
   * Parses through the options provided for a function and returns them in the form of an object.
   * @param {ChatInputCommandInteraction} interaction
   * @param {Command} command
   * @returns {{ [key: string]: OptionType }}
   */
  private parseInteractionArgs(
    interaction: ChatInputCommandInteraction,
    command: Command,
  ): { [key: string]: OptionType } {
    const commandData = command.data.toJSON();
    const options = commandData.options;
    const args: { [key: string]: OptionType } = {};
    if (!options) return {};
    for (const opt of options) {
      const val = this.getValueFromOption(interaction, opt);
      if (val) args[opt.name] = val;
    }
    return args;
  }

  /**
   * Switch statement to get the value of a given option
   * @param {ChatInputCommandInteraction} interaction
   * @param {APIApplicationCommandOption} opt
   * @returns {OptionType | null}
   */
  private getValueFromOption(
    interaction: ChatInputCommandInteraction,
    opt: APIApplicationCommandOption,
  ): OptionType | null {
    switch (opt.type) {
      case ApplicationCommandOptionType.Attachment:
        return interaction.options.getAttachment(opt.name, opt.required);
      case ApplicationCommandOptionType.Channel:
        return interaction.options.getChannel(opt.name, opt.required);
      case ApplicationCommandOptionType.Boolean:
        return interaction.options.getBoolean(opt.name, opt.required);
      case ApplicationCommandOptionType.Integer:
        return interaction.options.getInteger(opt.name, opt.required);
      case ApplicationCommandOptionType.Mentionable:
        return interaction.options.getMentionable(opt.name, opt.required);
      case ApplicationCommandOptionType.Number:
        return interaction.options.getNumber(opt.name, opt.required);
      case ApplicationCommandOptionType.Role:
        return interaction.options.getRole(opt.name, opt.required);
      case ApplicationCommandOptionType.String:
        return interaction.options.getString(opt.name, opt.required);
      case ApplicationCommandOptionType.Subcommand:
        return interaction.options.getSubcommand();
      case ApplicationCommandOptionType.SubcommandGroup:
        return interaction.options.getSubcommandGroup();
      case ApplicationCommandOptionType.User:
        return interaction.options.getUser(opt.name, opt.required);
    }
  }

  /**
   * Description
   * @param {Message} message
   * @param {Command} command
   * @returns {{[key: string]: OptionType} | {error: unknown}}
   */
  private parseMessageArgs(
    message: Message,
    command: Command,
  ): { [key: string]: OptionType } | { error: unknown } {
    const messageArgs = message.content.split(" ").toSpliced(0, 1);
    const options = command.data.toJSON().options;
    if (!options) return {};
    const verifier = new ArgumentVerifier(
      options,
      messageArgs,
      message.mentions,
    );
    try {
      const res = verifier.parse();
      return res;
    } catch (e) {
      return { error: e };
    }
  }

  /**
   * Imports the provided file as a Command object and adds it to the collection.
   * @param {string} filename:string
   * @returns {Promise<void>}
   */
  async load(filename: string): Promise<void> {
    const command: Command = (await import(filename)).default;
    if (this.collection.has(command.id))
      throw new Error("Command already exists");
    command.filename = filename;
    this.collection.set(command.id, command);
  }

  loadAll(): void {
    const files = this.getFiles();
    for (const file of files) {
      try {
        this.load(file);
      } catch (e) {
        this.client.logger.error(e);
      }
    }
  }

  /**
   * Async function that registers all the commands as they are loaded.
   */
  async loadAndRegisterAll(): Promise<void> {
    const files = this.getFiles();
    const promises: Promise<void>[] = [];
    for (const file of files) {
      try {
        promises.push(this.load(file));
      } catch (e) {
        this.client.logger.error(e);
      }
    }
    await Promise.all(promises);
    this.registerCommands();
  }

  /**
   * Registers all the command that were added to the collection.
   */
  registerCommands(): void {
    const comms: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    for (const comm of this.collection.values()) {
      comms.push(comm.data.toJSON());
    }
    const rest = new REST().setToken(Config.TOKEN);

    (async () => {
      try {
        this.client.logger.info(
          `Started refreshing ${comms.length} application (/) commands.`,
        );

        // The put method is used to fully refresh all commands in the guild with the current set
        if (Config.GUILD) {
          await rest.put(
            Routes.applicationGuildCommands(Config.CLIENT_ID, Config.GUILD),
            { body: comms },
          );
        }
        await rest.put(Routes.applicationCommands(Config.CLIENT_ID), {
          body: comms,
        });

        /*console.log(
          `Successfully reloaded ${data.length} application (/) commands.`,
        );*/
      } catch (error) {
        // And of course, make sure you catch and log any errors!
        this.client.logger.error(error);
      }
    })();
  }

  /**
   * Fetches the user information from the database or creates a new entry.
   * @param {User} user
   * @returns {IncludedRow<Contract, "User", NoIncludes> }
   */
  async fetchAuthorData(
    user: User,
  ): Promise<IncludedRow<Contract, "User", NoIncludes>> {
    const userData = await userRepository.findByDiscordId(user.id);
    if (userData) {
      return userData;
    }
    const newUser = await userRepository.create(
      user.id,
      user.tag,
      user.displayName,
    );
    return newUser;
  }
  /**
   * Fetches the guild information from the database or creates a new entry.
   * @param {Guild} guild
   * @returns {IncludedRow<Contract, "Guild", NoIncludes> }
   */
  async fetchGuildData(
    guild: Guild,
  ): Promise<IncludedRow<Contract, "Guild", NoIncludes>> {
    const guildData = await guildRepository.findByDiscordId(guild.id);
    if (guildData) {
      return guildData;
    }
    const newGuild = await guildRepository.create(guild.id, guild.name);
    return newGuild;
  }
}
