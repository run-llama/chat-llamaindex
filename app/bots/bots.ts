import { BuiltinBot } from ".";

const TEMPLATE = (PERSONA: string) =>
  `I want you to act as a ${PERSONA}. I will provide you with the context needed to solve my problem. Use intelligent, simple, and understandable language. Be concise. It is helpful to explain your thoughts step by step and with bullet points.`;

export const BUILTIN_BOTS: BuiltinBot[] = [
  {
    avatar: "1f5a5-fe0f",
    name: "Red Hat Linux Expert",
    botHello: "Hello! How can I help you with Red Hat Linux?",
    context: [
      {
        role: "system",
        content: TEMPLATE("Red Hat Linux Expert"),
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo-16k",
      temperature: 0.1,
      maxTokens: 8000,
      sendMemory: true,
    },
    readOnly: true,
    datasource: "redhat",
    hideContext: false,
  },

  {
    avatar: "1f454",
    name: "Apple Watch Genius",
    botHello: "Hello! How can I help you with Apple Watches?",
    context: [
      {
        role: "system",
        content: TEMPLATE("Apple Genius specialized in Apple Watches"),
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo-16k",
      temperature: 0.1,
      maxTokens: 8000,
      sendMemory: true,
    },
    readOnly: true,
    datasource: "watchos",
    hideContext: false,
  },
  {
    avatar: "1f4da",
    name: "German Basic Law Expert",
    botHello: "Hello! How can I assist you today?",
    context: [
      {
        role: "system",
        content: TEMPLATE("Lawyer specialized in the basic law of Germany"),
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo-16k",
      temperature: 0.1,
      maxTokens: 8000,
      sendMemory: true,
    },
    readOnly: true,
    datasource: "basic_law_germany",
    hideContext: false,
  },
  {
    avatar: "1f916",
    name: "GPT-3.5-Turbo",
    botHello: "Hello! How can I assist you today?",
    context: [],
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      maxTokens: 6000,
      sendMemory: true,
    },
    readOnly: true,
    hideContext: false,
  },
];
