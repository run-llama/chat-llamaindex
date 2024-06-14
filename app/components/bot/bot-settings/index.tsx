import { useBot } from "@/app/components/bot/use-bot";
import BotConfig from "./bot-config";
import { ModelConfigList } from "./model-config";
import { LLMConfig } from "@/app/store/bot";

export default function BotSettings(props: { extraConfigs?: JSX.Element }) {
  const { bot, updateBot } = useBot();
  const updateConfig = (updater: (config: LLMConfig) => void) => {
    if (bot.readOnly) return;
    const config = { ...bot.modelConfig };
    updater(config);
    updateBot((bot) => {
      bot.modelConfig = config;
    });
  };
  return (
    <div className="space-y-5 pb-5">
      {/* TODO: Handle context prompts later */}
      {/* <ContextPrompts
        context={bot.context}
        updateContext={(updater) => {
          const context = bot.context.slice();
          updater(context);
          updateBot((bot) => (bot.context = context));
        }}
      />
      <Separator /> */}
      <BotConfig />
      <ModelConfigList
        modelConfig={{ ...bot.modelConfig }}
        updateConfig={updateConfig}
      />
    </div>
  );
}
