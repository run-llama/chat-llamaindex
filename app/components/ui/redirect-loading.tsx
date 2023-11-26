import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface RedirectRedirectLoadingPageProps {
  url: string;
  message: string;
}

export function RedirectLoadingPage({
  url,
  message,
}: RedirectRedirectLoadingPageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = url;
    }, 3000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [url]);

  return (
    <div className="w-full h-screen max-h-full flex items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {message}
    </div>
  );
}
