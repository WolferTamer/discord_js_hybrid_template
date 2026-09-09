/** Super Class for compnents that are dynamically registered such as events and commands */
export default abstract class BaseComponent<T> {
  public readonly id: string;
  public filename: string | null;
  public readonly execute: (context: T) => Promise<void>;
  constructor(id: string, execute: (context: T) => Promise<void>) {
    this.id = id;
    this.execute = execute;
    this.filename = null;
  }
}
