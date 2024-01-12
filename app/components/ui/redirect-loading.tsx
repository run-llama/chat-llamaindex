import React, { useEffect } from "react";
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
    }, 10000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [url]);

  // Define a style object for the message
  const messageStyle = {
    fontSize: "2em", // Adjust the size as needed
    // Add any other styles you want for the message here
  };

  return (
    <div className="w-full h-screen max-h-full flex items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {/* Apply the style to the message */}
      <div style={messageStyle}>{message}</div>
    </div>
  );
}
