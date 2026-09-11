import {
  APIApplicationCommandOption,
  ApplicationCommandOptionType,
  MessageMentions,
  Role,
  User,
} from "discord.js";
import { OptionType } from "../types.js";

/**
 * Class that verifies the arguments of a given command.
 */
export default class ArgumentVerifier {
  private options: APIApplicationCommandOption[];
  private args: string[];
  private mentions: MessageMentions | undefined;
  constructor(
    options: APIApplicationCommandOption[],
    args: string[],
    mentions?: MessageMentions,
  ) {
    this.options = options;
    this.args = args;
    this.mentions = mentions;
  }

  /**
   * Parses through the given options and arguments and returns the resulting object or throws an error if any are invalid.
   * @returns {{ [keyof: string]: OptionType }}
   */
  public parse(): { [keyof: string]: OptionType } {
    const results: { [keyof: string]: OptionType } = {};
    let index = 0;
    for (const opt of this.options) {
      if (this.args[index] === "") {
        results[opt.name] = undefined;
        if (opt.required) {
          throw Error(`${opt.name} is required.`);
        }
        continue;
      }
      switch (opt.type) {
        case ApplicationCommandOptionType.Integer:
          results[opt.name] = this.verifyInteger(opt, index);
          break;
        case ApplicationCommandOptionType.Number:
          results[opt.name] = this.verifyNum(opt, index);
          break;
        case ApplicationCommandOptionType.String:
          results[opt.name] = this.verifyString(opt, index);
          break;
        case ApplicationCommandOptionType.Boolean:
          results[opt.name] = this.verifyBoolean(opt, index);
          break;
        case ApplicationCommandOptionType.User:
          results[opt.name] = this.verifyUser(opt, index);
          break;
        case ApplicationCommandOptionType.Role:
          results[opt.name] = this.verifyRole(opt, index);
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
   * @returns {number | undefined}
   */
  private verifyNum(
    option: APIApplicationCommandOption,
    index: number,
  ): number | undefined {
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
    return undefined;
  }

  /**
   * Makes sure the provided string matches the required parameters. Empty string if the number is not required.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {string | undefined}
   */
  private verifyString(
    option: APIApplicationCommandOption,
    index: number,
  ): string | undefined {
    if (option.type === ApplicationCommandOptionType.String) {
      if (index >= this.args.length) {
        if (option.required) {
          throw Error(`${option.name} is required.`);
        } else {
          return undefined;
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
    return undefined;
  }

  /**
   * Makes sure the provided boolean matches the required parameters.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {bolean | undefined}
   */
  private verifyBoolean(
    option: APIApplicationCommandOption,
    index: number,
  ): boolean | undefined {
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
    return undefined;
  }

  /**
   * Makes sure the provided integer matches the required parameters.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {number | undefined}
   */
  private verifyInteger(
    option: APIApplicationCommandOption,
    index: number,
  ): number | undefined {
    if (option.type === ApplicationCommandOptionType.Integer) {
      if (index >= this.args.length) {
        if (option.required) throw Error(`${option.name} is required.`);
        else return undefined;
      }

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
    return undefined;
  }

  /**
   * Makes sure the user is valid and matches the requirements.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {User | undefined}
   */
  private verifyUser(
    option: APIApplicationCommandOption,
    index: number,
  ): User | undefined {
    if (option.type === ApplicationCommandOptionType.User) {
      if (index >= this.args.length) {
        if (option.required) throw Error(`${option.name} is required.`);
        else return undefined;
      }
      const useridRegex = /<@(\d{17,18})>/;
      if (this.mentions) {
        const res = useridRegex.exec(this.args[index]);
        if (res && res.length > 1) {
          const user = this.mentions.parsedUsers.get(res[1]);
          return user;
        } else {
          throw Error(`${option.name} is not a user.`);
        }
      } else {
        throw Error(`${option.name} is not a user.`);
      }
    }
  }

  /**
   * Makes sure the role is valid and matches the requirements.
   * @param {APIApplicationCommandOption} option
   * @param {number} index
   * @returns {Role | undefined}
   */
  private verifyRole(
    option: APIApplicationCommandOption,
    index: number,
  ): Role | undefined {
    if (option.type === ApplicationCommandOptionType.Role) {
      if (index >= this.args.length) {
        if (option.required) throw Error(`${option.name} is required.`);
        else return undefined;
      }
      const roleidRegex = /<@&(\d{18,20})>/;
      if (this.mentions) {
        const res = roleidRegex.exec(this.args[index]);
        if (res && res.length > 1) {
          const role = this.mentions.roles.get(res[1]);
          return role;
        } else {
          throw Error(`${option.name} is not a role.`);
        }
        return undefined;
      } else {
        throw Error(`${option.name} is not a role.`);
      }
    }
  }
}
