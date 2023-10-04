import { Checkbox } from "@/app/components/ui/checkbox";
import { Input, InputRange } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Locale from "../../../locales";
import { ALL_MODELS, ModalConfigValidator, ModelConfig } from "../../../store";
import { Card, CardContent } from "../../ui/card";
import ConfigItem from "./config-item";

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  return (
    <Card>
      <CardContent className="divide-y p-5">
        <ConfigItem title={Locale.Settings.Model}>
          <Select
            value={props.modelConfig.model}
            onValueChange={(value) => {
              props.updateConfig(
                (config) => (config.model = ModalConfigValidator.model(value)),
              );
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {ALL_MODELS.map((v) => (
                <SelectItem value={v.name} key={v.name} disabled={!v.available}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ConfigItem>

        <ConfigItem
          title={Locale.Settings.Temperature.Title}
          subTitle={Locale.Settings.Temperature.SubTitle}
        >
          <InputRange
            value={props.modelConfig.temperature?.toFixed(1)}
            min="0"
            max="1" // lets limit it to 0-1
            step="0.1"
            onChange={(e) => {
              props.updateConfig(
                (config) =>
                  (config.temperature = ModalConfigValidator.temperature(
                    e.currentTarget.valueAsNumber,
                  )),
              );
            }}
          ></InputRange>
        </ConfigItem>
        <ConfigItem
          title={Locale.Settings.TopP.Title}
          subTitle={Locale.Settings.TopP.SubTitle}
        >
          <InputRange
            value={(props.modelConfig.topP ?? 1).toFixed(1)}
            min="0"
            max="1"
            step="0.1"
            onChange={(e) => {
              props.updateConfig(
                (config) =>
                  (config.topP = ModalConfigValidator.topP(
                    e.currentTarget.valueAsNumber,
                  )),
              );
            }}
          ></InputRange>
        </ConfigItem>
        <ConfigItem
          title={Locale.Settings.MaxTokens.Title}
          subTitle={Locale.Settings.MaxTokens.SubTitle}
        >
          <Input
            type="number"
            min={100}
            max={100000}
            value={props.modelConfig.maxTokens}
            onChange={(e) =>
              props.updateConfig(
                (config) =>
                  (config.maxTokens = ModalConfigValidator.maxTokens(
                    e.currentTarget.valueAsNumber,
                  )),
              )
            }
          />
        </ConfigItem>
        <ConfigItem
          title={Locale.Settings.PresencePenalty.Title}
          subTitle={Locale.Settings.PresencePenalty.SubTitle}
        >
          <InputRange
            value={props.modelConfig.presence_penalty?.toFixed(1)}
            min="-2"
            max="2"
            step="0.1"
            onChange={(e) => {
              props.updateConfig(
                (config) =>
                  (config.presence_penalty =
                    ModalConfigValidator.presence_penalty(
                      e.currentTarget.valueAsNumber,
                    )),
              );
            }}
          ></InputRange>
        </ConfigItem>

        <ConfigItem
          title={Locale.Settings.FrequencyPenalty.Title}
          subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
        >
          <InputRange
            value={props.modelConfig.frequency_penalty?.toFixed(1)}
            min="-2"
            max="2"
            step="0.1"
            onChange={(e) => {
              props.updateConfig(
                (config) =>
                  (config.frequency_penalty =
                    ModalConfigValidator.frequency_penalty(
                      e.currentTarget.valueAsNumber,
                    )),
              );
            }}
          ></InputRange>
        </ConfigItem>

        <ConfigItem
          title={Locale.Settings.InputTemplate.Title}
          subTitle={Locale.Settings.InputTemplate.SubTitle}
        >
          <Input
            type="text"
            value={props.modelConfig.template}
            onChange={(e) =>
              props.updateConfig(
                (config) => (config.template = e.currentTarget.value),
              )
            }
          ></Input>
        </ConfigItem>

        <ConfigItem
          title={Locale.Settings.HistoryCount.Title}
          subTitle={Locale.Settings.HistoryCount.SubTitle}
        >
          <InputRange
            title={props.modelConfig.historyMessageCount.toString()}
            value={props.modelConfig.historyMessageCount}
            min="0"
            max="64"
            step="1"
            onChange={(e) =>
              props.updateConfig(
                (config) =>
                  (config.historyMessageCount = e.target.valueAsNumber),
              )
            }
          ></InputRange>
        </ConfigItem>

        <ConfigItem
          title={Locale.Settings.CompressThreshold.Title}
          subTitle={Locale.Settings.CompressThreshold.SubTitle}
        >
          <Input
            type="number"
            min={500}
            max={4000}
            value={props.modelConfig.compressMessageLengthThreshold}
            onChange={(e) =>
              props.updateConfig(
                (config) =>
                  (config.compressMessageLengthThreshold =
                    e.currentTarget.valueAsNumber),
              )
            }
          ></Input>
        </ConfigItem>
        <ConfigItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
          <Checkbox
            checked={props.modelConfig.sendMemory}
            onCheckedChange={(checked) =>
              props.updateConfig(
                (config) => (config.sendMemory = Boolean(checked)),
              )
            }
          />
        </ConfigItem>
      </CardContent>
    </Card>
  );
}
