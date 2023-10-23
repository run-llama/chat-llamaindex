const en = {
  Chat: {
    SubTitle: (count: number) => `${count} messages`,
    Actions: {
      ChatList: "Go To Chat List",
      Copy: "Copy",
      Delete: "Delete",
    },
    InputActions: {
      Stop: "Stop generating",
      Clear: "Clear Context",
    },
    Typing: "Typing…",
    Input:
      "Enter to send, Shift + Enter to wrap, enter URLs to add a PDF or HTML document to the context",
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
      Clear: {
        Title: "Clear All Data",
        SubTitle: "Clear all messages and settings",
        Action: "Clear",
        Confirm: "Confirm to clear all data?",
      },
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
    BotHello: "Hello! How can I assist you today?",
  },
  Copy: {
    Success: "Copied to clipboard",
    Failed: "Copy failed, please grant permission to access clipboard",
  },
  Context: {
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
};

export type LocaleType = typeof en;

export default en;
