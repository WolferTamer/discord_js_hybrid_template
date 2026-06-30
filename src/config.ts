export default class Config {
  public static TOKEN: string;
  public static CLIENT_ID: string;
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
