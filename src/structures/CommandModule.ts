import {
  ApplicationCommandOptionData,
  ChatInputCommandInteraction,
  Collection,
  Interaction,
  InteractionType,
  Message,
} from "discord.js";
import BaseClient from "../client.js";
import BaseModule from "./BaseModule.js";
import Command from "./Command.js";

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
        if (interaction.type !== InteractionType.ApplicationCommand) return;
      },
    );

    client.addListener("messageCreate", async (message: Message) => {
      if (!message.content.startsWith(":")) return;
    });
  }

  //TODO: Implement a parsing function that will use command data to create an object containing all the options information
  private parseInteractionArgs(interaction: ChatInputCommandInteraction) {}

  //TODO: Implement a parsing function that will use command data to create an object containing all the options information from the message
  private parseMessageArgs(
    message: Message,
    options: ApplicationCommandOptionData[],
  ) {}

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
}
