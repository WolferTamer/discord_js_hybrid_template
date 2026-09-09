import {db} from "../prisma/db"

export const guildRepository = {
  async findByDiscordId(discordId: string) {
    return db.orm.guilds.where({discordId}).first()
  },
  async create(discordId: string, name: string) {
    return db.orm.guilds.create({discordId, name, defaultChannel: null})
  }
}