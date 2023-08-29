import { ShareResponse } from "@/app/api/share/route";
import ConfigItem from "@/app/components/bot/bot-settings/config-item";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Bot, Share } from "@/app/store/bot";
import { copyToClipboard } from "@/app/utils";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import Locale from "../../../locales";
import { Button } from "../../ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useBot } from "../use-bot";
import { useToast } from "@/app/components/ui/use-toast";
import { LoadingThreeDot } from "@/app/components/ui/loading";

async function share(bot: Bot): Promise<ShareResponse> {
  const res = await fetch("/api/share", {
    method: "POST",
    body: JSON.stringify({ bot: bot }),
  });
  const json = await res.json();
  console.log("[Share]", json);
  if (!res.ok) {
    throw new Error(json.msg);
  }
  return json;
}

async function patch(share: Share): Promise<void> {
  if (!share.id) {
    throw new Error("Can't patch without share id being set.");
  }
  const res = await fetch(`/api/share/${share.id}`, {
    method: "PATCH",
    body: JSON.stringify({ shareToken: share.token }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.msg);
  }
}

export default function ShareBotDialogContent() {
  const { toast } = useToast();
  const { bot, updateBot } = useBot();
  const [showToken, setShowToken] = useState(bot.share?.token ? true : false);
  const [token, setToken] = useState(bot.share?.token || "");

  const shareMutation = useMutation(share, {
    onSuccess: (data) => {
      updateBot((bot) => {
        bot.share = { ...bot.share, id: data.key };
      });
    },
  });
  const patchMutation = useMutation(patch);

  const onClose = () => {
    const newToken = showToken ? token : undefined;
    if (bot.share && newToken !== bot.share.token) {
      // token got changed, update it locally
      const newShare = { ...bot.share!, token: newToken };
      updateBot((bot) => {
        bot.share = newShare;
      });
      // and on the server side if a key was generated
      if (shareMutation.data) {
        setTimeout(() => {
          patchMutation.mutate(newShare, {
            onError: () => {
              toast({
                title: Locale.Share.Token.Error,
                variant: "destructive",
              });
            },
          });
        }, 0);
      }
    }
  };

  // FIXME: check dependency warning
  useEffect(() => {
    shareMutation.mutate(bot);
    return () => {
      onClose();
    };
  }, []);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{Locale.Share.Title}</DialogTitle>
      </DialogHeader>
      <div>
        {!shareMutation.error && (
          <Card>
            <CardContent className="divide-y pt-6">
              <ConfigItem title={Locale.Share.Url.Title}>
                {shareMutation.data ? (
                  <div className="flex flex-1 gap-4">
                    <Input
                      className="max-w-full flex-1"
                      type="text"
                      value={shareMutation.data.url}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(shareMutation.data.url, toast)
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <LoadingThreeDot />
                )}
              </ConfigItem>
              {bot.share && (
                <>
                  <ConfigItem
                    title={Locale.Share.ShowToken.Title}
                    subTitle={Locale.Share.ShowToken.SubTitle}
                  >
                    <input
                      type="checkbox"
                      checked={showToken}
                      onChange={(e) => setShowToken(!showToken)}
                    ></input>
                  </ConfigItem>
                  {showToken && (
                    <ConfigItem
                      title={Locale.Share.Token.Title}
                      subTitle={Locale.Share.Token.SubTitle}
                    >
                      <Input
                        value={token}
                        type="password"
                        placeholder={Locale.Settings.Token.Placeholder}
                        onChange={(e) => {
                          setToken(e.currentTarget.value);
                        }}
                      />
                    </ConfigItem>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <DialogFooter>
        <div>
          {shareMutation.error ? (
            <span className="text-destructive">{Locale.Share.Url.Error}</span>
          ) : (
            <div>{Locale.Share.Url.Hint}</div>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
