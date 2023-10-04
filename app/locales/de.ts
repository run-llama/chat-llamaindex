import { SubmitKey } from "../store/config";
import type { LocaleType } from "./index";

const de: LocaleType = {
  Chat: {
    SubTitle: (count: number) => `${count} Nachrichten`,
    Actions: {
      ChatList: "Zur Chat-Liste gehen",
      Copy: "Kopieren",
      Stop: "Stop",
      Retry: "Wiederholen",
      Delete: "Löschen",
      Pin: "Pin",
      PinToastContent: "Eine Nachricht zum Kontext hinzugefügt",
      PinToastAction: "Anzeigen",
    },
    Commands: {
      new: "Start a new chat",
      newm: "Start a new chat with bot",
      next: "Next Chat",
      prev: "Previous Chat",
      clear: "Kontext löschen",
      del: "Delete Chat",
    },
    InputActions: {
      Stop: "Stop",
      ToBottom: "Zum Ende springen",
      Clear: "Kontext löschen",
      Settings: "Einstellungen",
    },
    Typing: "Tippen...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} um zu Senden`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Umschalt + Eingabe für Zeilenumbruch";
      }
      inputHints += ", URLs fügen PDF- oder HTML-Dokumente zum Kontext hinzu";
      return inputHints;
    },
    Send: "Senden",
    IsContext: "Kontext-Prompt",
    LoadingURL: "Lade URL...",
  },
  Upload: {
    Invalid: (acceptTypes: string) =>
      `Unbekannter Datei-Typ. Bitte wählen Sie eine Datei mit einem unterstützten Format (${acceptTypes}) aus`,
    SizeExceeded: (limitSize: number) =>
      `Datei ist zu groß. Das Limit beträgt ${limitSize} MB`,
    ParseDataURLFailed:
      "Datei kann nicht gelesen werden: Bitte überprüfen, ob sie verschlüsselt ist.",
    UnknownFileType: "TEXT FILE",
  },
  Export: {
    Image: {
      Modal: "Lange drücken oder Rechtsklick, um das Bild zu speichern",
    },
  },
  Memory: {
    Title: "Gedächtnis-Prompt",
    EmptyContent: "Noch nichts.",
    Send: "Gedächtnis senden",
  },
  Home: {
    LinkedIn: "Kontaktieren",
    Logout: "Abmelden",
    Settings: "Einstellungen",
  },
  Settings: {
    Title: "Einstellungen",
    SubTitle: "Alle Einstellungen",
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
      Title: "Schriftgröße",
      SubTitle: "Schriftgröße des Chat-Inhalts anpassen",
    },
    InputTemplate: {
      Title: "Input Template",
      SubTitle: "Newest message will be filled to this template",
    },
    SendKey: "Senden-Taste",
    Theme: "Theme",
    HistoryCount: {
      Title: "Anzahl der angehängten Nachrichten",
      SubTitle: "Anzahl der pro Anfrage angehängten gesendeten Nachrichten",
    },
    CompressThreshold: {
      Title: "Schwellenwert für Verlaufskomprimierung",
      SubTitle:
        "Komprimierung, wenn die Länge der unkomprimierten Nachrichten den Wert überschreitet",
    },
    Token: {
      Title: "API-Schlüssel",
      SubTitle: "Verwenden Sie hier Ihren OpenAI API-Schlüssel",
      Placeholder: "OpenAI API-Schlüssel",
    },
    Model: "Modell",
    Temperature: {
      Title: "Temperature", //Temperatur
      SubTitle: "Ein größerer Wert führt zu zufälligeren Antworten",
    },
    TopP: {
      Title: "Top P",
      SubTitle: "Diesen Wert nicht zusammen mit der Temperature ändern",
    },
    MaxTokens: {
      Title: "Max Tokens", //Maximale Token
      SubTitle: "Maximale Anzahl der Anfrage- plus Antwort-Token",
    },
    PresencePenalty: {
      Title: "Presence Penalty", //Anwesenheitsstrafe
      SubTitle:
        "Ein größerer Wert erhöht die Wahrscheinlichkeit, dass über neue Themen gesprochen wird",
    },
    FrequencyPenalty: {
      Title: "Frequency Penalty", // HäufigkeitStrafe
      SubTitle:
        "Ein größerer Wert verringert die Wahrscheinlichkeit, dass dieselbe Zeile wiederholt wird",
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
    DefaultBotName: "Neuer Bot",
    DefaultTopic: "Neues Gespräch",
    BotHello: "Hallo! Wie kann ich Ihnen heute helfen?",
    Error:
      "Etwas ist schief gelaufen, bitte versuchen Sie es später noch einmal.",
    Prompt: {
      History: (content: string) =>
        "Dies ist eine Zusammenfassung des Chatverlaufs zwischen der KI und dem Benutzer als Rückblick: " +
        content,
      Topic:
        "Bitte erstellen Sie einen vier- bis fünfwörtigen Titel, der unser Gespräch zusammenfasst, ohne Einleitung, Zeichensetzung, Anführungszeichen, Punkte, Symbole oder zusätzlichen Text. Entfernen Sie Anführungszeichen.",
      Summarize:
        "Fassen Sie unsere Diskussion kurz in 200 Wörtern oder weniger zusammen, um sie als Pronpt für zukünftige Gespräche zu verwenden.",
    },
  },
  Copy: {
    Success: "In die Zwischenablage kopiert",
    Failed:
      "Kopieren fehlgeschlagen, bitte geben Sie die Berechtigung zum Zugriff auf die Zwischenablage frei",
  },
  Context: {
    Toast: (x: any) => `Mit ${x} Kontext-Prompts`,
    Edit: "Kontext- und Gedächtnis-Prompts",
    Add: "Hinzufügen",
    Clear: "Kontext gelöscht",
    Revert: "Rückgängig",
    Title: "Einstellungen Kontext-Prompt",
  },
  Share: {
    Title: "Bot teilen",
    Url: {
      Title: "URL",
      Hint: "Mit dieser URL können Sie Ihren Bot teilen. Die URL ist 30 Tage gültig.",
      Error: "Oops, something went wrong. Please try again later.",
    },
    ShowToken: {
      Title: "API-Schlüssel",
      SubTitle:
        "API-Schüssel der für Ihren Bot verwendet wird. Bot-Benutzer benötigen dann keinen Schlüssel. Sie bezahlen für deren Benutzung.",
    },
    Token: {
      Title: "API-Schlüssel",
      SubTitle: "OpenAI API-Schlüssel für diesen Bot.",
      Placeholder: "OpenAI API-Schlüssel",
      Error:
        "Oops, there was an error setting the API key. Please try again later.",
    },
  },
  Deploy: {
    Config: {
      Title: "Bot in Telegram deployen",
      Start: "Bot starten",
      Stop: "Bot stoppen",
      Token: {
        Title: "Telegram Bot-Token",
        Hint: "Bot-Token für das Deployen in Telegram. Sie können einen hier erstellen",
        Placeholder: "Telegram Bot-Token",
      },
    },
  },
  Bot: {
    Name: "Bot",
    Page: {
      Search: (count: number) => `Bots suchen - ${count} Bots`,
      Create: "Neuer Bot",
    },
    Item: {
      Edit: "Editieren",
      Delete: "Löschen",
      DeleteConfirm: "Löschen bestätigen?",
      Deploy: "Telegram",
      Share: "Teilen",
    },
    EditModal: {
      Title: `Bot editieren`,
      Clone: "Kopie erstellen",
    },
    Config: {
      Avatar: "Bot-Avatar",
      Name: "Bot-Name",
      HideContext: {
        Title: "Kontext-Prompts verstecken",
        SubTitle: "Kontext-Prompts nicht im Chat anzeigen",
      },
      BotHello: {
        Title: "Willkommens-Nachricht",
        SubTitle:
          "Nachricht, die beim Starten eines neuen Chats angezeigt wird",
      },
      Title: "Einstellungen Bot",
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
    Confirm: "Bestätigen",
    Cancel: "Abbrechen",
    Close: "Schließen",
    Create: "Erstellen",
    Edit: "Editieren",
  },
  URLCommand: {
    Code: "Detected access code from url, confirm to apply? ",
    Settings: "Detected settings from url, confirm to apply?",
  },
};

export default de;
