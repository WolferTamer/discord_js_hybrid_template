import { ApplicationCommandOptionData } from "discord.js";
import BaseComponent from "./BaseComponent.js";
import { Context } from "./Context.js";

/** Representation of a Command. */
export default class Command extends BaseComponent {
  public readonly options: ApplicationCommandOptionData[];
  constructor(
    id: string,
    execute: (context: Context) => void,
    options: ApplicationCommandOptionData[],
  ) {
    super(id, execute);
    this.options = options;
  }
}
