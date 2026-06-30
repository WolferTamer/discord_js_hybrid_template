import { ApplicationCommandOptionData, SlashCommandBuilder } from "discord.js";
import BaseComponent from "./BaseComponent.js";
import { Context } from "./Context.js";

/** Representation of a Command. */
export default class Command extends BaseComponent {
  public readonly data: SlashCommandBuilder;
  constructor(
    id: string,
    execute: (context: Context) => Promise<void>,
    options: SlashCommandBuilder,
  ) {
    super(id, execute);
    this.data = options;
  }
}
