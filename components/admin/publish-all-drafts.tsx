// =============================================================================
// Publish All Drafts Component
// Batch action to activate all draft opportunities
// =============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBatchPublish } from "@/lib/query/admin-mutations";
import { Loader2, Rocket } from "lucide-react";

interface PublishAllDraftsProps {
  draftCount: number;
}

export function PublishAllDrafts({ draftCount }: PublishAllDraftsProps) {
  const router = useRouter();
  const [isDone, setIsDone] = useState(false);
  
  const { mutate: publishAll, isPending } = useBatchPublish();

  const handlePublishAll = () => {
    if (confirm(`Are you sure you want to publish all ${draftCount} drafts?`)) {
      publishAll(undefined, {
        onSuccess: () => {
          setIsDone(true);
          router.refresh();
          // Reset status after a delay
          setTimeout(() => setIsDone(false), 3000);
        }
      });
    }
  };

  if (draftCount === 0 && !isDone) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePublishAll}
      disabled={isPending || draftCount === 0 || isDone}
      className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isDone ? (
        <Rocket className="h-4 w-4 mr-2" />
      ) : (
        <Rocket className="h-4 w-4 mr-2" />
      )}
      {isDone ? "Published All!" : `Publish All Drafts (${draftCount})`}
    </Button>
  );
}
