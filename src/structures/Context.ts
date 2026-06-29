/*
  Context is what handles the Hybrid Command elements of the interaction.
*/

import {
  Channel,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  Guild,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
  Message,
  MessageCreateOptions,
  MessageEditOptions,
  MessageReplyOptions,
  PartialGroupDMChannel,
  SendableChannels,
  User,
} from "discord.js";
import { UniversalMessageOptions } from "../types.js";

/**Class that acts as a dynamic context that can handle both messages and command interactions. Interface between the command logic and message sending. */
export class Context {
  context: ChatInputCommandInteraction | Message;
  isInteraction: boolean;
  interaction: ChatInputCommandInteraction | null;
  message: Message | null;
  id: string;
  channelId: string;
  channel: SendableChannels;
  client: Client;
  author: User;
  guild: Guild | null;
  response: Message | null;
  args: object;
  /**
   * Creates the context object using either a message or interaction and the parsed arguments/options for the command.
   * This class should not use the Command object itself.
   * @constructor
   * @param {ChatInputCommandInteraction|Message} context
   * @param {object} args - The arguments provided in the command execution. structure of {argumentKey: argumentValue}
   */
  constructor(context: ChatInputCommandInteraction | Message, args: object) {
    this.context = context;
    this.isInteraction = context instanceof ChatInputCommandInteraction;
    this.interaction = this.isInteraction
      ? (context as ChatInputCommandInteraction)
      : null;
    this.message = this.isInteraction ? null : (context as Message);
    this.id = context.id;
    this.author = context instanceof Message ? context.author : context.user;
    this.channelId = context.channelId;
    if (!context.channel || !context.channel.isSendable())
      throw Error("Unable to send messages in this channel.");

    this.channel = context.channel;
    this.client = context.client;
    this.guild = context.guild;
    this.response = null;
    this.args = args;
  }

  /**
   * Replies to the interaction or sends a message
   * @param {UniversalMessageOptions} options
   * @returns {Promise<Message>}
   */
  async reply(options: UniversalMessageOptions): Promise<Message> {
    const normalizedOptions = this.normalizeOptions(options);

    if (this.isInteraction) {
      if (this.interaction!.replied) {
        this.response = await this.interaction!.followUp(
          normalizedOptions.interactionReply,
        );
        return this.response;
      }

      if (this.interaction!.deferred) {
        this.response = await this.interaction!.editReply(
          normalizedOptions.interactionEdit,
        );
        return this.response;
      }

      this.response = await (
        await this.interaction!.reply(normalizedOptions.interactionReply)
      ).fetch();
      return this.response;
    } else {
      if (this.message!.channel instanceof PartialGroupDMChannel)
        throw Error("Bad channel type");
      this.response = await this.channel.send(normalizedOptions.messageCreate);
      return this.response;
    }
  }

  /**
   * Edits the existing response to the interaction
   * @param {UniversalMessageOptions} options
   * @returns {Promise<Message>}
   */
  async editMessage(options: UniversalMessageOptions): Promise<Message> {
    const response = this.normalizeOptions(options);
    if (!this.response) throw Error("Response not yet created.");
    if (this.isInteraction) {
      this.response = await this.interaction!.editReply(
        response.interactionEdit,
      );
      return this.response;
    } else {
      this.response = await this.response.edit(response.messageEdit);
      return this.response;
    }
  }

  /**
   * Defers the true response by sending a message
   * @param {UniversalMessageOptions} options
   * @returns {Promise<Message>}
   */
  async defer(options: UniversalMessageOptions): Promise<Message> {
    const response = this.normalizeOptions(options);
    if (this.isInteraction) {
      await this.interaction!.deferReply();
      this.response = await this.interaction!.editReply(
        response.interactionEdit,
      );
      return this.response;
    } else {
      this.response = await this.channel.send(response.messageCreate);
      return this.response;
    }
  }

  /**
   * Creates objects for each type of message response/editing.
   * @param {UniversalMessageOptions} options
   * @returns {{messageCreate: MessageCreateOptions, interactionReply: InteractionReplyOptions, messageReply: MessageReplyOptions, messageEdit: MessageEditOptions, interactionEdit: InteractionEditReplyOptions}}
   */
  private normalizeOptions(options: UniversalMessageOptions): {
    messageCreate: MessageCreateOptions;
    interactionReply: InteractionReplyOptions;
    messageReply: MessageReplyOptions;
    messageEdit: MessageEditOptions;
    interactionEdit: InteractionEditReplyOptions;
  } {
    return {
      messageCreate: {
        allowedMentions: options.allowedMentions,
        components: options.components,
        content: options.content,
        embeds: options.embeds,
        files: options.files,
        flags: options.flags,
      } as MessageCreateOptions,
      interactionReply: {
        allowedMentions: options.allowedMentions,
        components: options.components,
        content: options.content,
        embeds: options.embeds,
        files: options.files,
        flags: options.flags,
      } as InteractionReplyOptions,
      messageReply: {
        allowedMentions: options.allowedMentions,
        components: options.components,
        content: options.content,
        embeds: options.embeds,
        files: options.files,
        flags: options.flags,
      } as MessageReplyOptions,
      messageEdit: {
        allowedMentions: options.allowedMentions,
        components: options.components,
        content: options.content,
        embeds: options.embeds,
        files: options.files,
        flags: options.flags,
      } as MessageEditOptions,
      interactionEdit: {
        allowedMentions: options.allowedMentions,
        components: options.components,
        content: options.content,
        embeds: options.embeds,
        files: options.files,
        flags: options.flags,
      } as InteractionEditReplyOptions,
    };
  }
}
