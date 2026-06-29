import {
  ActionRowData,
  APIActionRowComponent,
  APIComponentInActionRow,
  APIComponentInMessageActionRow,
  APIEmbed,
  APIMessageTopLevelComponent,
  Attachment,
  AttachmentPayload,
  BitFieldResolvable,
  BufferResolvable,
  JSONEncodable,
  MessageActionRowComponentData,
  MessageFlags,
  MessageFlagsString,
  MessageMentionOptions,
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
