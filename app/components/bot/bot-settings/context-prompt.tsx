import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowDownLeftSquare, PlusCircle, XCircle } from "lucide-react";
import Locale from "../../../locales";
import { Message as ChatMessage } from "ai";
import { v4 as uuidv4 } from "uuid";
import { MESSAGE_ROLES } from "@/app/store/bot";

function ContextPromptItem(props: {
  index: number;
  prompt: ChatMessage;
  update: (prompt: ChatMessage) => void;
  remove: () => void;
  insert: () => void;
}) {
  const handleUpdatePrompt = async (input: string) => {
    props.update({
      ...props.prompt,
      content: input,
    });
  };

  return (
    <>
      <div className="flex justify-center gap-2 w-full group items-start py-2">
        <div className="flex gap-2 items-center">
          <Select
            value={props.prompt.role}
            onValueChange={(value) =>
              props.update({
                ...props.prompt,
                role: value as any,
              })
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={props.prompt.content}
          className={
            "flex-1 max-w-full text-left min-h-0 ring-inset focus-visible:ring-offset-0"
          }
          rows={4}
          onBlur={() => {
            // If the selection is not removed when the user loses focus, some
            // extensions like "Translate" will always display a floating bar
            window?.getSelection()?.removeAllRanges();
          }}
          onInput={(e) => handleUpdatePrompt(e.currentTarget.value)}
        />
        <div className="flex flex-col space-y-2">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => props.remove()}
            className="h-8 w-8"
          >
            <XCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => props.insert()}
            className="h-8 w-8"
          >
            <ArrowDownLeftSquare className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function ContextPrompts(props: {
  context: ChatMessage[];
  updateContext: (updater: (context: ChatMessage[]) => void) => void;
}) {
  const context = props.context;

  const addContextPrompt = (prompt: ChatMessage, i: number) => {
    props.updateContext((context) => context.splice(i, 0, prompt));
  };

  const createNewPrompt = (index = props.context.length) => {
    addContextPrompt(
      {
        role: "user",
        content: "",
        id: uuidv4(),
      },
      index,
    );
  };

  const removeContextPrompt = (i: number) => {
    props.updateContext((context) => context.splice(i, 1));
  };

  const updateContextPrompt = (i: number, prompt: ChatMessage) => {
    props.updateContext((context) => (context[i] = prompt));
  };

  return (
    <>
      <div className="mb-5">
        <div className="font-semibold mb-2 flex items-center justify-between">
          <span>{Locale.Context.Title}</span>
          <Button variant="secondary" onClick={() => createNewPrompt()}>
            <PlusCircle className="mr-2 h-4 w-4" /> {Locale.Context.Add}
          </Button>
        </div>
        {context.map((c, i) => (
          <div key={i} className="p-2">
            <ContextPromptItem
              index={i}
              prompt={c}
              update={(prompt) => updateContextPrompt(i, prompt)}
              remove={() => removeContextPrompt(i)}
              insert={() => createNewPrompt(i + 1)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
