import ConfigItem from "@/app/components/bot/bot-settings/config-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input, InputRange } from "@/app/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import Typography from "@/app/components/ui/typography";
import { useToast } from "@/app/components/ui/use-toast";
import { ArchiveRestore, HardDriveDownload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClientConfig } from "../config/client";
import { FileName, Path } from "../constant";
import Locale from "../locales";
import {
  SubmitKey,
  Theme,
  useAccessStore,
  useAppConfig,
  useChatStore,
} from "../store";
import { useBotStore } from "../store/bot";
import { downloadAs, readFromFile } from "../utils";
import { ErrorBoundary } from "./layout/error";
import { BotAvatar, EmojiAvatarPicker } from "./ui/emoji";
import { cn } from "@/app/lib/utils";

function SettingHeader() {
  const navigate = useNavigate();
  return (
    <div className="relative flex justify-between items-center px-5 py-3.5">
      <div>
        <Typography.H4>{Locale.Settings.Title}</Typography.H4>
        <div className="text-sm text-muted-foreground">
          {Locale.Settings.SubTitle}
        </div>
      </div>
      <Button variant="outline" size="icon" onClick={() => navigate(Path.Home)}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

function CommonSettings() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;
  const clientConfig = getClientConfig();
  const accessStore = useAccessStore();
  return (
    <>
      <Card>
        <CardContent className="divide-y p-5">
          <ConfigItem title={Locale.Settings.Avatar}>
            <Popover open={showEmojiPicker}>
              <PopoverTrigger onClick={() => setShowEmojiPicker(true)}>
                <BotAvatar avatar={config.avatar} />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-fit">
                <EmojiAvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig((config) => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </ConfigItem>

          <ConfigItem title={Locale.Settings.SendKey}>
            <Select
              value={config.submitKey}
              onValueChange={(value) => {
                updateConfig(
                  (config) => (config.submitKey = value as SubmitKey),
                );
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select key" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SubmitKey).map((v) => (
                  <SelectItem value={v} key={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ConfigItem>

          <ConfigItem title={Locale.Settings.Theme}>
            <Select
              value={config.theme}
              onValueChange={(value) => {
                updateConfig((config) => (config.theme = value as Theme));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Theme).map((v) => (
                  <SelectItem value={v} key={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ConfigItem>

          <ConfigItem
            title={Locale.Settings.FontSize.Title}
            subTitle={Locale.Settings.FontSize.SubTitle}
          >
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min="12"
              max="18"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.fontSize = Number.parseInt(e.currentTarget.value)),
                )
              }
            ></InputRange>
          </ConfigItem>
        </CardContent>
      </Card>

      {!clientConfig.hasServerApiKey && (
        <Card>
          <CardContent className="divide-y p-5">
            <ConfigItem
              title={Locale.Settings.Token.Title}
              subTitle={Locale.Settings.Token.SubTitle}
            >
              <Input
                value={accessStore.token}
                type="password"
                placeholder={Locale.Settings.Token.Placeholder}
                onChange={(e) => {
                  accessStore.updateToken(e.currentTarget.value);
                }}
              />
            </ConfigItem>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function DangerItems() {
  const chatStore = useChatStore();
  const appConfig = useAppConfig();

  return (
    <Card>
      <CardContent className="divide-y p-5">
        <ConfigItem
          title={Locale.Settings.Danger.Reset.Title}
          subTitle={Locale.Settings.Danger.Reset.SubTitle}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                {Locale.Settings.Danger.Reset.Action}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {Locale.Settings.Danger.Reset.Confirm}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(buttonVariants({ variant: "destructive" }))}
                  onClick={() => {
                    appConfig.reset();
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ConfigItem>
        <ConfigItem
          title={Locale.Settings.Danger.Clear.Title}
          subTitle={Locale.Settings.Danger.Clear.SubTitle}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                {Locale.Settings.Danger.Clear.Action}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {Locale.Settings.Danger.Clear.Confirm}
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(buttonVariants({ variant: "destructive" }))}
                  onClick={() => {
                    chatStore.clearAllData();
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ConfigItem>
      </CardContent>
    </Card>
  );
}

function BackupItems() {
  const botStore = useBotStore();
  const { toast } = useToast();

  const backupBots = () => {
    downloadAs(JSON.stringify(botStore.backup()), FileName.Bots);
  };

  const restoreBots = async () => {
    try {
      const content = await readFromFile();
      const importBots = JSON.parse(content);
      botStore.restore(importBots);
      toast({
        title: Locale.Settings.Backup.Upload.Success,
        variant: "success",
      });
    } catch (err) {
      console.error("[Restore] ", err);
      toast({
        title: Locale.Settings.Backup.Upload.Failed((err as Error).message),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="divide-y p-5">
        <ConfigItem
          title={Locale.Settings.Backup.Download.Title}
          subTitle={Locale.Settings.Backup.Download.SutTitle}
        >
          <Button variant="outline" size="icon" onClick={backupBots}>
            <HardDriveDownload className="w-5 h-5" />
          </Button>
        </ConfigItem>
        <ConfigItem
          title={Locale.Settings.Backup.Upload.Title}
          subTitle={Locale.Settings.Backup.Upload.SutTitle}
        >
          <Button variant="outline" size="icon" onClick={restoreBots}>
            <ArchiveRestore className="w-5 h-5" />
          </Button>
        </ConfigItem>
      </CardContent>
    </Card>
  );
}

export function Settings() {
  const navigate = useNavigate();
  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ErrorBoundary>
      <SettingHeader />
      <Separator />
      <div className="space-y-5 p-5">
        <CommonSettings />
        <BackupItems />
        <DangerItems />
      </div>
    </ErrorBoundary>
  );
}
