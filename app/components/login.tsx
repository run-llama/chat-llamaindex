import { Linkedin } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { GITHUB_URL } from "../constant";
import Locale from "../locales";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "../lib/utils";

export default function LoginPage() {
  return (
    <div className="container relative hidden flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href={GITHUB_URL}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8",
        )}
      >
        Contact
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          {Locale.Welcome.Title}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">{Locale.Welcome.Quote}</p>
            <footer className="text-sm">Marcus Schmitt</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight mx-10">
              {Locale.Welcome.SubTitle}
            </h1>
            <div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => signIn("linkedin")}
              >
                <Linkedin className="mr-2 h-4 w-4 text-[#0a66c2]" />
                {Locale.Welcome.LoginLinkedinTitle}
              </Button>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking login, you agree to our{" "}
              <Link
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
