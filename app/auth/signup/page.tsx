import { SocialSignIn } from "@/components/auth/social-signin";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Compass, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 px-4 py-8">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400 blur-[120px] dark:bg-indigo-900" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400 blur-[120px] dark:bg-blue-900" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition-transform group-hover:scale-110">
              <Compass className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              OppsLab
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            Create an account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join thousands discovering their next opportunity
          </p>
        </div>

        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 ring-1 ring-gray-200 dark:ring-gray-800">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-xl font-bold">Start your journey</CardTitle>
            <CardDescription>
              Sign up with your preferred social account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <SocialSignIn />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-gray-500">
                  Instant access with OAuth
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
            <p className="text-center text-sm text-gray-400">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-blue-600">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-blue-600">
                Privacy Policy
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="ghost" asChild className="gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Homepage
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="fixed bottom-4 left-4 text-[10px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest pointer-events-none">
        Auth.js v5 Secure Protocol
      </div>
    </div>
  );
}
