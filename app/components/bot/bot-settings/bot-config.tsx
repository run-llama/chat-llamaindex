import { useBot } from "@/app/components/bot/use-bot";
import Locale from "../../../locales";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import ConfigItem from "./config-item";

export default function BotConfig() {
  const { bot, updateBot } = useBot();
  return (
    <>
      <div className="font-semibold mb-2">{Locale.Bot.Config.Title}</div>
      <Card>
        <CardContent className="divide-y p-5">
          <ConfigItem title={Locale.Bot.Config.Name}>
            <Input
              type="text"
              value={bot.name}
              onInput={(e) =>
                updateBot((bot) => {
                  bot.name = e.currentTarget.value;
                })
              }
            />
          </ConfigItem>
        </CardContent>
      </Card>
    </>
  );
}
