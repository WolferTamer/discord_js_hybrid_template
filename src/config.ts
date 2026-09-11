/**
 * Class that represents all the environment variables and validates the required ones.
 */
export default class Config {
  /** TOKEN represents the secret provided by discord for the bot. */
  public static TOKEN: string;
  /** CLIENT_ID represents the id provided by discord for the bot. */
  public static CLIENT_ID: string;
  /** GUILD is the optional ID of the server in which to register slash commands so that you can test them faster. */
  public static GUILD: string | undefined;

  public static validateConfig = () => {
    if (!process.env.TOKEN) {
      throw Error("Invalid TOKEN");
    }
    if (!process.env.CLIENT_ID) {
      throw Error("Invalid CLIENT_ID");
    }
    Config.TOKEN = process.env.TOKEN;
    Config.CLIENT_ID = process.env.CLIENT_ID;
    Config.GUILD = process.env.GUILD;
  };
}
