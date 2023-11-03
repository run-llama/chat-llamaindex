import { Button } from "@/app/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/app/components/ui/hover-card";
import { Loading } from "@/app/components/ui/loading";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from "@/app/components/ui/use-toast";
import { useScrollToBottom } from "@/app/hooks/useScroll";
import { useSubmitHandler } from "@/app/hooks/useSubmit";
import { cn } from "@/app/lib/utils";
import { FileWrap } from "@/app/utils/file";
import { isURL } from "@/app/client/fetch/url";
import {
  Clipboard,
  Eraser,
  PauseCircle,
  Send,
  Trash,
  Undo2,
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ChatControllerPool } from "../../client/controller";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  CHAT_PAGE_SIZE,
  DOCUMENT_FILE_SIZE_LIMIT,
  REQUEST_TIMEOUT_MS,
} from "../../constant";
import Locale from "../../locales";
import { ChatMessage, callSession, createMessage } from "../../store";
import { useMobileScreen } from "../../utils/mobile";
import { autoGrowTextArea } from "../../utils/autogrow";
import { copyToClipboard } from "@/app/utils/clipboard";
import { prettyObject } from "../../utils/format";
import { useSidebarContext } from "../home";
import FileUploader from "../ui/file-uploader";
import { Separator } from "../ui/separator";
import Typography from "../ui/typography";
import { ChatAction } from "./chat-action";
import { ClearContextDivider } from "./clear-context-divider";
import { useBotStore } from "@/app/store/bot";

const Markdown = dynamic(
  async () => (await import("../ui/markdown")).Markdown,
  {
    loading: () => <Loading />,
  },
);

function ChatHeader() {
  const isMobileScreen = useMobileScreen();
  const { setShowSidebar } = useSidebarContext();
  const botStore = useBotStore();
  const bot = botStore.currentBot();
  const session = botStore.currentSession();
  const numberOfMessages =
    (bot.botHello?.length ? 1 : 0) + session.messages.length;
  return (
    <div className="relative">
      <div className="absolute top-4 left-5">
        {isMobileScreen && (
          <Button
            size="icon"
            variant="outline"
            title={Locale.Chat.Actions.ChatList}
            onClick={() => setShowSidebar(true)}
          >
            <Undo2 />
          </Button>
        )}
      </div>
      <div className="text-center py-4">
        <Typography.H4>{bot.name}</Typography.H4>
        <div className="text-sm text-muted-foreground">
          {Locale.Chat.SubTitle(numberOfMessages)}
        </div>
      </div>
      <Separator />
    </div>
  );
}

export function Chat() {
  const { toast } = useToast();
  const botStore = useBotStore();
  const bot = botStore.currentBot();
  const session = botStore.currentSession();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [temporaryURLInput, setTemporaryURLInput] = useState("");
  const { shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();
  const isMobileScreen = useMobileScreen();

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        20,
        Math.max(1 + Number(!isMobileScreen), rows),
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  const onInput = (text: string) => {
    setUserInput(text);
  };

  const showError = (errMsg: string) => {
    toast({
      title: errMsg,
      variant: "destructive",
    });
  };

  const onUserInput = async (input: string | FileWrap) => {
    const inputContent = input instanceof FileWrap ? input.name : input;
    await callSession(
      bot,
      session,
      inputContent,
      {
        onUpdateMessages: (messages) => {
          botStore.updateBotSession((session) => {
            // trigger re-render of messages
            session.messages = messages;
          }, bot.id);
        },
      },
      input instanceof FileWrap ? input : undefined,
    );
  };

  const doSubmitFile = async (fileInput: FileWrap) => {
    await onUserInput(fileInput);
  };

  const doSubmit = (userInput: string) => {
    if (userInput.trim() === "") return;
    if (isURL(userInput)) {
      setTemporaryURLInput(userInput);
    }
    onUserInput(userInput).then(() => {
      setTemporaryURLInput("");
    });
    setUserInput("");
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
  };

  useEffect(() => {
    botStore.updateBotSession((session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || (m.date && new Date(m.date).getTime() < stopTiming)) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });
    }, bot.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (shouldSubmit(e)) {
      if (!isRunning) {
        doSubmit(userInput);
      }
      e.preventDefault();
    }
  };

  const deleteMessage = (msgId?: string) => {
    botStore.updateBotSession(
      (session) =>
        (session.messages = session.messages.filter((m) => m.id !== msgId)),
      bot.id,
    );
  };

  const onDelete = (msgId: string) => {
    deleteMessage(msgId);
  };

  const context: ChatMessage[] = useMemo(() => {
    return bot.hideContext ? [] : bot.context.slice();
  }, [bot.context, bot.hideContext]);

  const getUrlTypePrefix = (type: string) => {
    if (type === "text/html") return "HTML";
    if (type === "application/pdf") return "PDF";
    if (type === "text/plain") return "TXT";
    return Locale.Upload.UnknownFileType;
  };

  // preview messages
  const renderMessages = useMemo(() => {
    const getFrontendMessages = (messages: ChatMessage[]) => {
      return messages.map((message) => {
        if (!message.urlDetail) return message;
        const urlTypePrefix = getUrlTypePrefix(message.urlDetail.type);
        const sizeInKB = Math.round(message.urlDetail.size / 1024);
        return {
          ...message,
          content: `${message.urlDetail.url}\n\`${urlTypePrefix} • ${sizeInKB} KB\``,
        };
      });
    };

    const getUrlPreviewMessage = () => {
      const lastMessage = session.messages[session.messages.length - 1];
      const showPreviewUrl = temporaryURLInput && !lastMessage?.streaming;
      let previewUrlMessage: ChatMessage | undefined;

      if (showPreviewUrl) {
        previewUrlMessage = createMessage({
          role: "user",
          content: `${temporaryURLInput}\n\`${Locale.Chat.LoadingURL}\``,
        });
      }
      return previewUrlMessage;
    };

    return context
      .concat(
        bot.botHello
          ? [
              createMessage({
                role: "assistant",
                content: bot.botHello,
              }),
            ]
          : [],
      )
      .concat(getFrontendMessages(session.messages))
      .concat(getUrlPreviewMessage() || []);
  }, [session.messages, bot.botHello, temporaryURLInput, context]);

  const [msgRenderIndex, _setMsgRenderIndex] = useState(
    Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
  );
  function setMsgRenderIndex(newIndex: number) {
    newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
    newIndex = Math.max(0, newIndex);
    _setMsgRenderIndex(newIndex);
  }

  const messages = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      renderMessages.length,
    );
    return renderMessages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, renderMessages]);

  const onChatBodyScroll = (e: HTMLElement) => {
    const bottomHeight = e.scrollTop + e.clientHeight;
    const edgeThreshold = e.clientHeight;

    const isTouchTopEdge = e.scrollTop <= edgeThreshold;
    const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
    const isHitBottom = bottomHeight >= e.scrollHeight - 10;

    const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
    const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

    if (isTouchTopEdge && !isTouchBottomEdge) {
      setMsgRenderIndex(prevPageMsgIndex);
    } else if (isTouchBottomEdge) {
      setMsgRenderIndex(nextPageMsgIndex);
    }

    setAutoScroll(isHitBottom);
  };

  function scrollToBottom() {
    setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
    scrollDomToBottom();
  }

  // clear context index = context length + index in messages
  const clearContextIndex =
    (session.clearContextIndex ?? -1) >= 0
      ? session.clearContextIndex! +
        context.length +
        (bot.botHello ? 1 : 0) -
        msgRenderIndex
      : -1;

  const autoFocus = !isMobileScreen; // wont auto focus on mobile screen

  const clearContext = () => {
    botStore.updateBotSession((session) => {
      if (session.clearContextIndex === session.messages.length) {
        session.clearContextIndex = undefined;
      } else {
        session.clearContextIndex = session.messages.length;
      }
    }, bot.id);
  };
  const stop = () => ChatControllerPool.stop(bot.id);
  const isRunning = ChatControllerPool.isRunning(bot.id);

  return (
    <div className="flex flex-col relative h-full" key={bot.id}>
      <ChatHeader />
      <ScrollArea
        className="flex-1 overflow-auto overflow-x-hidden relative overscroll-none pb-10 p-5"
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onMouseDown={() => inputRef.current?.blur()}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <div className="space-y-5">
          {messages.map((message, i) => {
            const isUser = message.role === "user";
            const isMemory = message.role === "memory";
            const isContext = i < context.length;
            const showActions =
              i > 0 && !(message.content.length === 0) && !isContext;
            const showTyping = message.streaming;
            const shouldShowClearContextDivider = i === clearContextIndex - 1;

            return (
              <div className="space-y-5" key={i}>
                <div
                  className={
                    isUser
                      ? "flex flex-row-reverse"
                      : "flex flex-row last:animate-[slide-in_ease_0.3s]"
                  }
                >
                  <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                      <div
                        className={cn(
                          "max-w-[80%] flex flex-col items-start",
                          isUser && "items-end",
                        )}
                      >
                        {showTyping && (
                          <div
                            className={
                              "text-xs text-[#aaa] leading-normal my-1"
                            }
                          >
                            {Locale.Chat.Typing}
                          </div>
                        )}
                        <div
                          className={cn(
                            "box-border max-w-full text-sm select-text relative break-words rounded-lg px-3 py-2",
                            isUser
                              ? "ml-auto bg-primary text-primary-foreground"
                              : isMemory
                              ? "italic text-secondary-foreground"
                              : "bg-muted",
                          )}
                        >
                          <Markdown
                            content={message.content}
                            loading={
                              message.streaming &&
                              message.content.length === 0 &&
                              !isUser
                            }
                            onDoubleClickCapture={() => {
                              if (!isMobileScreen) return;
                              setUserInput(message.content);
                            }}
                            parentRef={scrollRef}
                            defaultShow={i >= messages.length - 6}
                          />
                        </div>

                        <div className="text-xs text-muted-foreground opacity-80 whitespace-nowrap text-right w-full box-border pointer-events-none z-[1]">
                          {isContext
                            ? Locale.Chat.IsContext
                            : message.date?.toLocaleString()}
                        </div>
                      </div>
                    </HoverCardTrigger>
                    {showActions && (
                      <HoverCardContent
                        side="top"
                        align={isUser ? "end" : "start"}
                        className="py-1 px-0 w-fit"
                      >
                        <div className="flex items-center divide-x">
                          {!message.streaming && (
                            <>
                              {message.id && (
                                <ChatAction
                                  text={Locale.Chat.Actions.Delete}
                                  icon={<Trash className="w-4 h-4" />}
                                  onClick={() => onDelete(message.id!)}
                                />
                              )}
                              <ChatAction
                                text={Locale.Chat.Actions.Copy}
                                icon={<Clipboard className="w-4 h-4" />}
                                onClick={() =>
                                  copyToClipboard(message.content, toast)
                                }
                              />
                            </>
                          )}
                        </div>
                      </HoverCardContent>
                    )}
                  </HoverCard>
                </div>
                {shouldShowClearContextDivider && (
                  <ClearContextDivider botId={bot.id} />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <Separator />
      <div className="relative w-full box-border flex-col pt-2.5 p-5 space-y-2">
        <div className="flex justify-between items-center">
          <ChatAction
            text={Locale.Chat.InputActions.Clear}
            icon={<Eraser className="w-4 h-4" />}
            onClick={clearContext}
            showTitle
            buttonVariant="outline"
          />
          {isRunning && (
            <ChatAction
              onClick={stop}
              text={Locale.Chat.InputActions.Stop}
              icon={<PauseCircle className="w-4 h-4" />}
              showTitle
              buttonVariant="outline"
            />
          )}
        </div>
        <div className="flex flex-1 items-end">
          <Textarea
            className="ring-inset focus-visible:ring-offset-0 pr-28 md:pr-40 min-h-[56px]"
            ref={inputRef}
            placeholder={
              isMobileScreen ? Locale.Chat.InputMobile : Locale.Chat.Input
            }
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={scrollToBottom}
            onClick={scrollToBottom}
            rows={inputRows}
            autoFocus={autoFocus}
          />
          <div className="my-2 flex items-center gap-2.5 absolute right-[35px]">
            <FileUploader
              config={{
                inputId: "document-uploader",
                allowedExtensions: ALLOWED_DOCUMENT_EXTENSIONS,
                fileSizeLimit: DOCUMENT_FILE_SIZE_LIMIT,
                disabled: isRunning,
              }}
              onUpload={doSubmitFile}
              onError={showError}
            />
            {isMobileScreen ? (
              <Button
                size="icon"
                onClick={() => doSubmit(userInput)}
                disabled={isRunning}
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => doSubmit(userInput)} disabled={isRunning}>
                <Send className="h-4 w-4 mr-2" />
                {Locale.Chat.Send}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
