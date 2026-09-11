import { Events, Guild } from "discord.js";
import Event from "../structures/Event";
import { guildRepository } from "../db/guildRepository";

/**
 * Is called upon joining a guild and creates a new DB entry.
 */
export default new Event(
  Events.GuildCreate,
  async (ctx: Guild) => {
    const guildInfo = await guildRepository.findByDiscordIdOrCreate(
      ctx.id,
      ctx.name,
    );
    if (ctx.systemChannel) {
      ctx.systemChannel.send("I have joined the server! " + guildInfo._id);
    }
  },
  Events.GuildCreate,
);
