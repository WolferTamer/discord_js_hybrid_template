import {
  ChatInputCommandInteraction,
  Collection,
  Interaction,
  InteractionType,
  Message,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import BaseClient from "../client.js";
import BaseModule from "./BaseModule.js";
import Command from "./Command.js";
import { Context } from "./Context.js";
import Config from "../config.js";

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

    //TODO: Implement listeners
    client.addListener(
      "interactionCreate",
      async (interaction: Interaction) => {
        if (
          interaction.type !== InteractionType.ApplicationCommand ||
          !(interaction instanceof ChatInputCommandInteraction)
        )
          return;
        const context = new Context(interaction, {});
        const command = this.collection.get(interaction.commandName);
        if (!command) {
          throw Error("Command does not exist");
        }
        await command.execute(context, {});
      },
    );

    client.addListener("messageCreate", async (message: Message) => {
      if (!message.content.startsWith(":")) return;
      const args = message.content.split(" ");
      const commandId = args[0].substring(1);
      const command = this.collection.get(commandId);
      if (!command) return;
      const context = new Context(message, {});
      await command.execute(context, {});
    });
  }

  //TODO: Implement a parsing function that will use command data to create an object containing all the options information
  //private parseInteractionArgs(interaction: ChatInputCommandInteraction) {}

  //TODO: Implement a parsing function that will use command data to create an object containing all the options information from the message
  /*private parseMessageArgs(
    message: Message,
    options: ApplicationCommandOptionData[],
  ) {}*/

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
        console.error(e);
      }
    }
  }

  async loadAndRegisterAll(): Promise<void> {
    const files = this.getFiles();
    const promises: Promise<void>[] = [];
    for (const file of files) {
      try {
        promises.push(this.load(file));
      } catch (e) {
        console.error(e);
      }
    }
    await Promise.all(promises);
    this.registerCommands();
  }

  registerCommands(): void {
    const comms: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    for (const comm of this.collection.values()) {
      comms.push(comm.data.toJSON());
    }
    const rest = new REST().setToken(Config.TOKEN);

    (async () => {
      try {
        console.log(
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
        console.error(error);
      }
    })();
  }
}
