import { SlashCommandOptionsOnlyBuilder } from "discord.js";
import BaseComponent from "./BaseComponent.js";
import { Context } from "./Context.js";
import { OptionType } from "../types.js";

/** Representation of a Command. */
export default class Command extends BaseComponent {
  public readonly data: SlashCommandOptionsOnlyBuilder;
  public readonly verifier?: (options: {
    [key: string]: OptionType;
  }) => boolean;
  constructor(
    id: string,
    execute: (context: Context) => Promise<void>,
    options: SlashCommandOptionsOnlyBuilder,
    verifier?: (options: { [key: string]: OptionType }) => boolean,
  ) {
    super(id, execute);
    this.data = options;
    this.verifier = verifier;
  }
}
