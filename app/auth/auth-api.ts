import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import LinkedInProvider from "next-auth/providers/linkedin";
import BlankAvatar from "@/app/icons/blank_avatar.png";
import { sendSlackMessage } from "../slack/slack";
import { env } from "../env.mjs";

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];
  if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) {
    providers.push(
      LinkedInProvider({
        clientId: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_CLIENT_SECRET,
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
  secret: env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn(message) {
      sendSlackMessage(
        `User signed in: ${message.profile?.name} - ${message.profile?.email}`,
      );
    },
  },
};

export const handlers = NextAuth(options);
