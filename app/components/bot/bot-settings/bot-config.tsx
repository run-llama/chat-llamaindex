import { useBot } from "@/app/components/bot/use-bot";
import Locale from "../../../locales";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import ConfigItem from "./config-item";
import { AVAILABLE_DATASOURCES } from "@/app/store/bot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

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
          <ConfigItem title={Locale.Bot.Config.Datasource}>
            <Select
              value={bot.datasource}
              onValueChange={(value) => {
                updateBot((bot) => {
                  bot.datasource = value;
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_DATASOURCES.map((datasource) => (
                  <SelectItem value={datasource} key={datasource}>
                    {datasource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ConfigItem>
        </CardContent>
      </Card>
    </>
  );
}
