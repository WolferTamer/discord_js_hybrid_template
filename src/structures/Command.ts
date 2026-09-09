import { SlashCommandOptionsOnlyBuilder } from "discord.js";
import BaseComponent from "./BaseComponent.js";
import { Context } from "./Context.js";

/** Representation of a Command. */
export default class Command extends BaseComponent<Context> {
  public readonly data: SlashCommandOptionsOnlyBuilder;
  constructor(
    id: string,
    execute: (context: Context) => Promise<void>,
    options: SlashCommandOptionsOnlyBuilder,
  ) {
    super(id, execute);
    this.data = options;
  }
}
