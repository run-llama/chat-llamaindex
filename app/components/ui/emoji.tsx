import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";
import BotIcon from "../../icons/bot.svg";
import { DEFAULT_BOT_AVATAR } from "@/app/bots/bot.data";

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/${style}/64/${unified}.png`;
}

export function EmojiAvatarPicker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return (
    <Emoji
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  );
}

export function BotAvatar(props: { avatar: string }) {
  const { avatar } = props;
  if (avatar === DEFAULT_BOT_AVATAR) return <BotIcon width={18} height={18} />;
  return <EmojiAvatar avatar={avatar} />;
}
