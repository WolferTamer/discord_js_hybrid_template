import { guildRepository } from "../db/guildRepository";
import BaseClient from "../client";

/**
 * Contains all the information about a guild that may be needed before fetching it from the DB
 */
export default interface GuildData {
  prefix: string;
}

/**
 * Populates the client's guildData member
 * @param client
 */
export function loadGuildData(client: BaseClient) {
  guildRepository.getAll().then((guildInfo) => {
    for (const g of guildInfo) {
      client.guildData.set(g.discordId, { prefix: g.prefix });
    }
  });
}
