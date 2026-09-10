import { guildRepository } from "../db/guildRepository";
import BaseClient from "../client";

export default interface GuildData {
  prefix: string;
}

export function loadGuildData(client: BaseClient) {
  guildRepository.getAll().then((guildInfo) => {
    for (const g of guildInfo) {
      client.guildData.set(g.discordId, { prefix: g.prefix });
    }
  });
}
