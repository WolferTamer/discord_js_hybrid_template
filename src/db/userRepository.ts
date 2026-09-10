import { handleDbErrors } from "../errors"
import {db} from "../prisma/db"

export const userRepository = {
  async findByDiscordId(discordId: string) {
    return handleDbErrors(() => db.orm.users.where({discordId}).first())
  },
  async create(discordId: string, username: string, displayName?: string) {
    return handleDbErrors(() => db.orm.users.create({discordId, username, displayName: displayName ?? null}))
  }
}