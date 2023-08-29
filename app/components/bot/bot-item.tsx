import { cn } from "@/app/lib/utils";
import { Bot } from "../../store/bot";
import BotOptions from "./bot-options";
import { BotItemContextProvider, useBot } from "./use-bot";
import { BotAvatar } from "@/app/components/ui/emoji";

function BotItemUI() {
  const { bot, isActive, ensureSession } = useBot();
  return (
    <div
      className={cn(
        "flex items-center justify-between cursor-pointer mb-2 last:mb-0 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
        isActive && "border-primary",
      )}
      onClick={ensureSession}
    >
      <div className="flex items-center justify-between space-x-2">
        <div className="w-[18px] h-[18px]">
          <BotAvatar avatar={bot.avatar} />
        </div>
        <div className="font-medium">{bot.name}</div>
      </div>
      <BotOptions />
    </div>
  );
}

export default function BotItem(props: { bot: Bot }) {
  return (
    <BotItemContextProvider bot={props.bot}>
      <BotItemUI />
    </BotItemContextProvider>
  );
}
