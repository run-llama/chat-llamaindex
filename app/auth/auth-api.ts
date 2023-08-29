import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import LinkedInProvider from "next-auth/providers/linkedin";
import { getServerSideConfig } from "../config/server";
import BlankAvatar from "@/app/icons/blank_avatar.png";
import { sendSlackMessage } from "../slack/slack";

const configureIdentityProvider = () => {
  const serverConfig = getServerSideConfig();
  const providers: Array<Provider> = [];
  if (serverConfig.linkedinClientId && serverConfig.linkedinClientSecret) {
    providers.push(
      LinkedInProvider({
        clientId: serverConfig.linkedinClientId,
        clientSecret: serverConfig.linkedinClientSecret,
        authorization: {
          params: { scope: "openid profile email" },
        },
        issuer: "https://www.linkedin.com",
        jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
        profile(profile, tokens) {
          const defaultImage = BlankAvatar.src;
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture ?? defaultImage,
          };
        },
      }),
    );
  }

  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn(message) {
      const serverConfig = getServerSideConfig();
      if (!serverConfig.slackWebhookUrl) return;
      sendSlackMessage(
        `User signed in: ${message.profile?.name} - ${message.profile?.email}`,
      );
    },
  },
};

export const handlers = NextAuth(options);
