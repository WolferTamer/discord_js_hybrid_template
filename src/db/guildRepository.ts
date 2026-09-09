import { handleDbErrors } from "../errors";
import { db } from "../prisma/db";

export const guildRepository = {
  async findByDiscordId(discordId: string) {
    return handleDbErrors(() => db.orm.guilds.where({ discordId }).first());
  },
  async findByDiscordIdOrCreate(discordId: string, name: string) {
    return handleDbErrors(async () => {
      const guild = await db.orm.guilds.where({ discordId }).first();
      if (guild != null) {
        return guild;
      }
      const newGuild = await db.orm.guilds.create({
        discordId,
        name,
        defaultChannel: null,
        prefix: ":",
      });
      return newGuild;
    });
  },
  async create(discordId: string, name: string) {
    return handleDbErrors(() =>
      db.orm.guilds.create({
        discordId,
        name,
        defaultChannel: null,
        prefix: ":",
      }),
    );
  },
};
