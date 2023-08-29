import { getClientConfig } from "@/app/config/client";
import { useAccessStore } from "@/app/store";
import { DEFAULT_DEPLOYMENT, Deployment } from "@/app/store/deployment";
import { useWorkerStore } from "@/app/store/workers";
import { Ban, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import Locale from "../../../locales";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { useBot } from "../use-bot";
import { LoadingThreeDot } from "@/app/components/ui/loading";

enum Status {
  Stopped = "STOPPED",
  Starting = "STARTING",
  Stopping = "STOPPING",
  Running = "RUNNING",
  InvalidToken = "INVALID_TOKEN",
  Unknown = "UNKNOWN",
}

export default function DeployBotDialogContent() {
  const { bot, updateBot } = useBot();
  const workerStore = useWorkerStore();
  const [status, setStatus] = useState(Status.Stopped);

  const deployment = bot.deployment || DEFAULT_DEPLOYMENT;
  const worker = deployment.worker_id
    ? workerStore.get(deployment.worker_id)
    : null;

  const updateConfig = (updater: (config: Deployment) => void) => {
    const config = { ...deployment };
    updater(config);
    updateBot((bot) => {
      bot.deployment = config;
    });
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig((config) => (config.token = e.currentTarget.value));
  };

  const startBot = () => {
    const worker = new Worker(
      new URL("../../../workers/telegram.ts", import.meta.url),
    );
    const accessStore = useAccessStore.getState();
    const id = workerStore.create(worker);
    const config = getClientConfig();
    worker.postMessage({
      command: "start",
      data: {
        token: deployment.token,
        openaiToken: accessStore.token,
        bot: bot,
        config,
      },
    });
    updateConfig((config) => (config.worker_id = id));
  };

  const stopBot = () => {
    if (worker) {
      worker.postMessage({ command: "stop" });
      workerStore.delete(deployment.worker_id!);
      updateConfig((config) => (config.worker_id = null));
    }
  };

  const renderStatus = (status: Status | string) => {
    switch (status) {
      case Status.Stopped:
        return "Bot not running.";
      case Status.Starting:
      case Status.Stopping:
        return (
          <div className="text-primary">
            <LoadingThreeDot />
          </div>
        );
      case Status.Running:
        return "Bot running.";
      case Status.InvalidToken:
        status = "Invalid Telegram bot token. Please check.";
      default:
        return <span className="text-destructive">{status}</span>;
    }
  };

  useEffect(() => {
    // set status from worker and setup message callback
    // from worker
    if (worker) {
      worker.onmessage = function (event) {
        // Handle the received message here
        const status: Status = event.data.status;
        if (status === Status.Unknown) {
          setStatus(event.data.error ?? Status.Unknown);
        } else {
          setStatus(status);
        }
      };
      // if worker already exists, ask it of its last status, if we don't receive a message
      // we assume that the worker is already stopped (which is ok as the default status is 'stopped')
      worker.postMessage({ command: "get_status" });
    }
  }, [worker]);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{Locale.Deploy.Config.Title}</DialogTitle>
      </DialogHeader>
      <Separator />
      <Card>
        <CardContent className="flex items-center justify-between p-6 gap-4">
          <div className="w-1/2">
            <div className="font-bold">{Locale.Deploy.Config.Token.Title}</div>
            <div className="text-sm">
              {Locale.Deploy.Config.Token.Hint}&nbsp;
              <a
                href="https://t.me/BotFather"
                target="_blank"
                className="text-primary"
              >
                https://t.me/BotFather
              </a>
            </div>
          </div>
          <Input
            className="flex-1"
            type="text"
            value={bot.deployment?.token}
            placeholder={Locale.Deploy.Config.Token.Placeholder}
            onInput={onChangeInput}
          />
        </CardContent>
      </Card>
      <DialogFooter className="items-center">
        <div>{renderStatus(status)}</div>
        <Button
          disabled={
            status === Status.Running ||
            status === Status.Starting ||
            status === Status.Stopping
          }
          onClick={startBot}
        >
          <Zap className="mr-2 w-4 h-4" />
          {Locale.Deploy.Config.Start}
        </Button>
        <Button
          variant="destructive"
          disabled={status !== Status.Running}
          onClick={stopBot}
        >
          <Ban className="mr-2 w-4 h-4" />
          {Locale.Deploy.Config.Stop}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
