"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github, Chrome, Loader2 } from "lucide-react";
import { useState } from "react";

export function SocialSignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-4">
      <Button
        variant="outline"
        onClick={() => handleSignIn("google")}
        disabled={loading !== null}
        className="w-full relative py-6 text-base font-medium transition-all hover:bg-gray-50 hover:border-blue-400 dark:hover:bg-gray-800 dark:hover:border-blue-700"
      >
        {loading === "google" ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Chrome className="mr-2 h-5 w-5 text-red-500" />
        )}
        Continue with Google
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSignIn("github")}
        disabled={loading !== null}
        className="w-full relative py-6 text-base font-medium transition-all hover:bg-gray-50 hover:border-gray-400 dark:hover:bg-gray-800 dark:hover:border-gray-700"
      >
        {loading === "github" ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Github className="mr-2 h-5 w-5" />
        )}
        Continue with GitHub
      </Button>
    </div>
  );
}
