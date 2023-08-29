import { ModelConfig } from "../store";
import { type Bot } from "../store/bot";

export type BuiltinBot = Omit<
  Bot,
  "id" | "modelConfig" | "deployment" | "share" | "botHello"
> & {
  builtin: Boolean;
  modelConfig: Partial<ModelConfig>;
};
