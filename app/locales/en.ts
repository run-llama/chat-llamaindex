import { SubmitKey } from "../store/config";

const en = {
  Chat: {
    SubTitle: (count: number) => `${count} messages`,
    Actions: {
      ChatList: "Go To Chat List",
      Copy: "Copy",
      Stop: "Stop",
      Retry: "Retry",
      Pin: "Pin",
      PinToastContent: "Pinned 1 messages to contextual prompts",
      PinToastAction: "View",
      Delete: "Delete",
    },
    Commands: {
      new: "Start a new chat",
      newm: "Start a new chat with bot",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Clear Context",
      del: "Delete Chat",
    },
    InputActions: {
      Stop: "Stop generating",
      ToBottom: "To Latest",
      Clear: "Clear Context",
      Settings: "Settings",
    },
    Typing: "Typing…",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} to send`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter to wrap";
      }
      inputHints += ", enter URLs to add a PDF or HTML document to the context";
      return inputHints;
    },
    Send: "Send",
    IsContext: "Contextual Prompt",
    LoadingURL: "Loading content...",
  },
  Upload: {
    Invalid: (acceptTypes: string) =>
      `Invalid file type. Please select a file with one of these formats: ${acceptTypes}`,
    SizeExceeded: (limitSize: number) =>
      `File size exceeded. Limit is ${limitSize} MB`,
    ParseDataURLFailed: "Unable to read file: Please check if it's encrypted.",
    UnknownFileType: "TEXT FILE",
  },
  Export: {
    Image: {
      Modal: "Long press or right click to save image",
    },
  },
  Memory: {
    Title: "Memory Prompt",
    EmptyContent: "Nothing yet.",
    Send: "Send Memory",
  },
  Home: {
    LinkedIn: "Contact",
    Logout: "Logout",
    Settings: "Settings",
  },
  Settings: {
    Title: "Settings",
    SubTitle: "All Settings",
    Danger: {
      Reset: {
        Title: "Reset All Settings",
        SubTitle: "Reset all setting items to default",
        Action: "Reset",
        Confirm: "Confirm to reset all settings to default?",
      },
      Clear: {
        Title: "Clear All Data",
        SubTitle: "Clear all messages and settings",
        Action: "Clear",
        Confirm: "Confirm to clear all messages and settings?",
      },
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Font Size",
      SubTitle: "Adjust font size of chat content",
    },

    InputTemplate: {
      Title: "Input Template",
      SubTitle: "Newest message will be filled to this template",
    },

    SendKey: "Send Key",
    Theme: "Theme",

    HistoryCount: {
      Title: "Attached Messages Count",
      SubTitle: "Number of sent messages attached per request",
    },
    CompressThreshold: {
      Title: "History Compression Threshold",
      SubTitle:
        "Will compress if uncompressed messages length exceeds the value",
    },
    Token: {
      Title: "API Key",
      SubTitle: "Enter your API key from OpenAI here",
      Placeholder: "OpenAI API Key",
    },
    Model: "Model",
    Temperature: {
      Title: "Temperature",
      SubTitle: "A larger value makes the more random output",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Do not alter this value together with temperature",
    },
    MaxTokens: {
      Title: "Max Tokens",
      SubTitle: "Maximum length of input tokens and generated tokens",
    },
    PresencePenalty: {
      Title: "Presence Penalty",
      SubTitle:
        "A larger value increases the likelihood to talk about new topics",
    },
    FrequencyPenalty: {
      Title: "Frequency Penalty",
      SubTitle:
        "A larger value decreasing the likelihood to repeat the same line",
    },
    Backup: {
      Download: {
        Title: "Backup Bots",
        SutTitle: "Download the state of your bots to a JSON file",
      },
      Upload: {
        Title: "Restore Bots",
        SutTitle: "Upload the state of your bots from a JSON file",
        Success: "Successfully restored the bots from the JSON file",
        Failed: (e: string) => `Error importing the JSON file: ${e}`,
      },
    },
  },
  Store: {
    DefaultBotName: "New Bot",
    DefaultTopic: "New Conversation",
    BotHello: "Hello! How can I assist you today?",
    Error: "Something went wrong, please try again later.",
    Prompt: {
      History: (content: string) =>
        "This is a summary of the chat history as a recap: " + content,
      Topic:
        "Please generate a four to five word title summarizing our conversation without any lead-in, punctuation, quotation marks, periods, symbols, or additional text. Remove enclosing quotation marks.",
      Summarize:
        "Summarize the discussion briefly in 200 words or less to use as a prompt for future context.",
    },
  },
  Copy: {
    Success: "Copied to clipboard",
    Failed: "Copy failed, please grant permission to access clipboard",
  },
  Context: {
    Toast: (x: any) => `With ${x} contextual prompts`,
    Edit: "Current Chat Settings",
    Add: "Add a Prompt",
    Clear: "Context Cleared",
    Revert: "Revert",
    Title: "Context Prompt Settings",
  },
  Share: {
    Title: "Share Bot",
    Url: {
      Title: "URL",
      Hint: "Use the URL to share your bot. The URL will be valid for 30 days.",
      Error: "Oops, something went wrong. Please try again later.",
    },
    ShowToken: {
      Title: "Use API Key",
      SubTitle:
        "Provide an OpenAI API key for your shared bot. The users of the bot don't need a key. You'll pay for them.",
    },
    Token: {
      Title: "API Key",
      SubTitle: "OpenAI API key used by this shared bot.",
      Placeholder: "OpenAI API Key",
      Error:
        "Oops, there was an error setting the API key. Please try again later.",
    },
  },
  Deploy: {
    Config: {
      Title: "Deploy Bot To Telegram",
      Start: "Start Bot",
      Stop: "Stop Bot",
      Token: {
        Title: "Telegram Bot token",
        Hint: "Enter your Telegram Bot token, get it from",
        Placeholder: "Telegram Bot token",
      },
    },
  },
  Bot: {
    Name: "Bot",
    Page: {
      Search: (count: number) => `Search Bot - ${count} bots`,
      Create: "Create bot",
    },
    Item: {
      Edit: "Edit",
      Delete: "Delete",
      DeleteConfirm: "Confirm to delete?",
      Deploy: "Telegram",
      Share: "Share",
    },
    EditModal: {
      Title: `Edit Bot`,
      Clone: "Clone",
    },
    Config: {
      Avatar: "Bot Avatar",
      Name: "Bot Name",
      HideContext: {
        Title: "Hide Context Prompts",
        SubTitle: "Do not show in-context prompts in chat",
      },
      BotHello: {
        Title: "Welcome Message",
        SubTitle: "Welcome message sent when starting a new chat",
      },
      Title: "Bot Settings",
    },
  },

  Welcome: {
    Title: "Unc",
    SubTitle: "The open and secure ChatGPT platform",
    Quote:
      "“This tool has saved me countless hours of work and helped me apply AI features to my work faster than ever before.”",
    LoginLinkedinTitle: "Login with LinkedIn",
  },

  UI: {
    Confirm: "Confirm",
    Cancel: "Cancel",
    Close: "Close",
    Create: "Create",
    Edit: "Edit",
  },

  URLCommand: {
    Code: "Detected access code from url, confirm to apply? ",
    Settings: "Detected settings from url, confirm to apply?",
  },
};

export type LocaleType = typeof en;

export default en;
