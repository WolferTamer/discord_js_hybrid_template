import { Collection } from "discord.js";
import BaseClient from "../client.js";
import { join, relative } from "path";
import { existsSync, readdir, readdirSync } from "fs";

/** Super class for modules in which allows files to be automatically imported and registered with the client. */
export default abstract class BaseModule<T, V> {
  public name: string;
  public client: BaseClient;
  public abstract collection: Collection<T, V>;

  constructor(client: BaseClient, name: string) {
    this.client = client;
    this.name = name;
  }

  /**
   * Gets an array of all the files to be imported
   * @returns {string[]}
   */
  getFiles(): string[] {
    const dir = join(this.client.dirname, this.name);
    const thisdir = join(this.client.dirname, "structures");
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir) ?? [];

    const filteredFiles = files.filter(
      (file) => file.endsWith(".ts") || file.endsWith(".js"),
    );
    return filteredFiles.map((file) =>
      relative(thisdir, join(dir, file.replace(".ts", ".js"))).replaceAll(
        "\\",
        "/",
      ),
    );
  }

  /**
   * Abstract function in which individual files must be imported and registered with the client
   * @param {string} filename
   * @returns {void}
   */
  abstract load(filename: string): void;
  /**
   * Loops through all file names and loads them.
   */
  loadAll() {
    const files = this.getFiles();
    for (const file of files) {
      try {
        this.load(file);
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Removes files from the client
   * @param {T} id
   * @returns {void}
   */
  remove(id: T): void {
    if (!this.collection.has(id)) throw Error("No item by that id exists.");
    const item = this.collection.get(id);

    this.collection.delete(id);
  }
}
