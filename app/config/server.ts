declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY?: string;
      BASE_URL?: string;
      VERCEL?: "1";
      DISABLE_GPT4?: string; // allow user to use gpt-4 or not
      BUILD_MODE?: "standalone" | "export";
      BUILD_APP?: string; // is building desktop app
      LINKEDIN_CLIENT_ID?: string;
      LINKEDIN_CLIENT_SECRET?: string;
      SLACK_WEBHOOK_URL?: string;
    }
  }
}

export const getServerSideConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  return {
    apiKey: process.env.OPENAI_API_KEY,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    baseUrl: process.env.BASE_URL,
    isVercel: !!process.env.VERCEL,
    disableGPT4: !!process.env.DISABLE_GPT4,
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  };
};
