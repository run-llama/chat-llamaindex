import "./styles/globals.css";
import "./styles/lib/markdown.css";
import "./styles/lib/highlight.css";

import Locale from "./locales";
import { Viewport, type Metadata } from "next";
import { Toaster } from "@/app/components/ui/toaster";
import { ThemeProvider } from "@/app/components/layout/theme-provider";

export const metadata: Metadata = {
  title: Locale.Welcome.Title,
  description: Locale.Welcome.SubTitle,
  appleWebApp: {
    title: Locale.Welcome.Title,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest"></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
