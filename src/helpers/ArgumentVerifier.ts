import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
} from "discord.js";
import { OptionType } from "../types.js";

/**
 * Class that verifies the arguments of a given command.
 */
export default class ArgumentVerifier {
  private options: APIApplicationCommandOption[];
  private args: string[];
  constructor(options: APIApplicationCommandOption[], args: string[]) {
    this.options = options;
    this.args = args;
  }

  /**
   * Parses through the given options and arguments and returns the resulting object or throws an error if any are invalid.
   * @returns {{ [keyof: string]: OptionType }}
   */
  public parse(): { [keyof: string]: OptionType } {
    const results: { [keyof: string]: OptionType } = {};
    let index = 0;
    for (const opt of this.options) {
      switch (opt.type) {
        case ApplicationCommandOptionType.Integer:
          results[opt.name] = this.verifyInteger(opt, index);
          break;
        case ApplicationCommandOptionType.Number:
          results[opt.name] = this.verifyNum(opt, index);
          break;
        case ApplicationCommandOptionType.String:
          if (this.verifyString(opt, index) === "") break;
          results[opt.name] = this.verifyString(opt, index) === "";
          break;
        case ApplicationCommandOptionType.Boolean:
          results[opt.name] = this.verifyBoolean(opt, index);
          break;
      }
      index++;
    }
    return results;
  }

  /**
   * Makes sure the provided number matches the required parameters.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {number}
   */
  private verifyNum(
    option: APIApplicationCommandOption,
    index: number,
  ): number {
    if (option.type === ApplicationCommandOptionType.Number) {
      if (option.required && index >= this.args.length)
        throw Error(`${option.name} is required.`);
      const val = +this.args[index];
      if (option.max_value && val > option.max_value)
        throw Error(`${option.name} must be less than ${option.max_value}.`);
      if (option.min_value && val < option.min_value)
        throw Error(`${option.name} must be greater than ${option.min_value}.`);
      if (option.choices && !option.choices.find((v) => v.value == val))
        throw Error(`${option.name} must be one of the given choices.`);
      return val;
    }
    return -1;
  }

  /**
   * Makes sure the provided string matches the required parameters. Empty string if the number is not required.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {string}
   */
  private verifyString(
    option: APIApplicationCommandOption,
    index: number,
  ): string {
    if (option.type === ApplicationCommandOptionType.String) {
      if (index >= this.args.length) {
        if (option.required) {
          throw Error(`${option.name} is required.`);
        } else {
          return "";
        }
      }

      let val = this.args[index];
      if (val.startsWith('"')) {
        let ind = index + 1;
        while (ind < this.args.length) {
          val += this.args[ind];
          if (val.endsWith('"')) {
            break;
          }
          ind++;
        }
      }
      if (option.max_length && val.length > option.max_length)
        throw Error(
          `${option.name} must be shorter than ${option.max_length} characters.`,
        );
      if (option.min_length && val.length < option.min_length)
        throw Error(`${option.name} must be longer than ${option.min_length}.`);
      if (option.choices && !option.choices.find((v) => v.value === val))
        throw Error(`${option.name} must be one of the given choices.`);
      return val;
    }
    return "";
  }

  /**
   * Makes sure the provided boolean matches the required parameters.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {bolean}
   */
  private verifyBoolean(
    option: APIApplicationCommandOption,
    index: number,
  ): boolean {
    if (option.type === ApplicationCommandOptionType.Boolean) {
      if (option.required && index >= this.args.length)
        throw Error(`${option.name} is required.`);
      const val = this.args[index].toLowerCase();
      switch (val) {
        case "y":
        case "t":
        case "yes":
        case "true":
          return true;
        case "f":
        case "n":
        case "no":
        case "false":
          return false;
      }
      throw Error(`${option.name} must be yes/no or true/false.`);
    }
    return false;
  }

  /**
   * Makes sure the provided integer matches the required parameters.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {number}
   */
  private verifyInteger(
    option: APIApplicationCommandOption,
    index: number,
  ): number {
    if (option.type === ApplicationCommandOptionType.Integer) {
      if (option.required && index >= this.args.length)
        throw Error(`${option.name} is required.`);
      const val = +this.args[index];
      if (val % 1 != 0) throw Error(`${option.name} must be an integer.`);
      if (option.max_value && val > option.max_value)
        throw Error(`${option.name} must be less than ${option.max_value}.`);
      if (option.min_value && val < option.min_value)
        throw Error(`${option.name} must be greater than ${option.min_value}.`);
      if (option.choices && !option.choices.find((v) => v.value == val))
        throw Error(`${option.name} must be one of the given choices.`);
      return val;
    }
    return -1;
  }
}
