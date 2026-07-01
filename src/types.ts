import {
  ActionRowData,
  APIActionRowComponent,
  APIComponentInActionRow,
  APIComponentInMessageActionRow,
  APIEmbed,
  APIInteractionDataResolvedGuildMember,
  APIMessageTopLevelComponent,
  Attachment,
  AttachmentPayload,
  BaseChannel,
  BufferResolvable,
  CommandInteractionOption,
  GuildMember,
  JSONEncodable,
  MessageActionRowComponentData,
  MessageFlags,
  MessageMentionOptions,
  Role,
  TopLevelComponentData,
} from "discord.js";
import Stream from "stream";

export interface ClientConfig {
  token: string;
}

/**
 * Interface that takes in options such that are used by all interaction/message response types
 */
export interface UniversalMessageOptions {
  allowedMentions?: MessageMentionOptions;
  components?: readonly (
    | ActionRowData<
        | JSONEncodable<APIComponentInMessageActionRow>
        | MessageActionRowComponentData
      >
    | APIMessageTopLevelComponent
    | JSONEncodable<APIActionRowComponent<APIComponentInActionRow>>
    | JSONEncodable<APIMessageTopLevelComponent>
    | TopLevelComponentData
  )[];
  content?: string | null;
  embeds?: readonly (APIEmbed | JSONEncodable<APIEmbed>)[];
  files?: readonly (
    | Attachment
    | AttachmentPayload
    | BufferResolvable
    | Stream
  )[];
  flags?: MessageFlags | undefined;
}

/**
 * Contains all the possible types that could be returned by a get option call.
 */
export type OptionType =
  | string
  | boolean
  | undefined
  | number
  | Attachment
  | CommandInteractionOption<"raw">["role"]
  | CommandInteractionOption<"raw">["channel"]
  | BaseChannel
  | Role
  | GuildMember
  | APIInteractionDataResolvedGuildMember
  | CommandInteractionOption<"raw">["user"];
