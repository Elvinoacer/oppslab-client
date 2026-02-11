import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic";

export default function AuthErrorPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Authentication Error</h1>
      <p className="text-muted-foreground">There was a problem signing you in.</p>
      <Button asChild>
        <Link href="/auth/signin">Try Again</Link>
      </Button>
    </div>
  )
}
