import { Context } from "./Context.js";

/** Super Class for compnents that are dynamically registered such as events and commands */
export default abstract class BaseComponent {
  public readonly id: string;
  public filename: string | null;
  public readonly execute: (context: Context, options: any) => void;
  constructor(id: string, execute: (context: Context, options: any) => void) {
    this.id = id;
    this.execute = execute;
    this.filename = null;
  }
}
