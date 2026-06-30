import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../structures/Command.js";

export default new Command(
  "test_command",
  async (ctx) => {
    await ctx.defer({
      content: "Sorry, I'm waiting",
      flags: MessageFlags.Ephemeral,
    });
    await new Promise((r) => setTimeout(r, 2000));
    const embed = new EmbedBuilder()
      .setTitle("Test Embed!")
      .setDescription("this is a big ol' test.")
      .setFooter({ text: "this may be a footer" });
    const button = new ButtonBuilder()
      .setLabel("Edit Message")
      .setCustomId("edittestmessage")
      .setStyle(ButtonStyle.Primary);

    const actionrow = new ActionRowBuilder().addComponents([button]);
    const response = await ctx.reply({
      embeds: [embed],
      flags: undefined,
    });
    const filter = (i: any) => i.user.id == ctx.author.id;
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000,
      filter,
    });
    await new Promise((r) => setTimeout(r, 2000));
    await ctx.editMessage({
      content: "I got edited!",
      embeds: [],
      components: [actionrow],
      flags: undefined,
    });

    collector.on("collect", async (i) => {
      i.update({ content: "wow!", components: [] });
    });
  },
  new SlashCommandBuilder()
    .setName("test_command")
    .setDescription("test descr"),
);
