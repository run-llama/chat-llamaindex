import "./styles/globals.css";
import "./styles/lib/markdown.css";
import "./styles/lib/highlight.css";
import { getClientConfig } from "./config/client";

import Locale from "./locales";
import { type Metadata } from "next";
import { AuthProviders } from "./auth/providers";
import { Toaster } from "@/app/components/ui/toaster";
import { ThemeProvider } from "@/app/components/layout/theme-provider";

export const metadata: Metadata = {
  title: Locale.Welcome.Title,
  description: Locale.Welcome.SubTitle,
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  appleWebApp: {
    title: Locale.Welcome.Title,
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <link rel="manifest" href="/site.webmanifest"></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProviders>{children}</AuthProviders>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
