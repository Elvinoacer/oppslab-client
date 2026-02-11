// =============================================================================
// Opportunity Actions Component
// Quick actions for opportunities (Publish, Edit, etc.)
// =============================================================================

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePublishOpportunity } from "@/lib/query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";

interface OpportunityActionsProps {
  id: string;
  status: string;
}

export function OpportunityActions({ id, status }: OpportunityActionsProps) {
  const router = useRouter();
  const [isOptimisticallyPublished, setIsOptimisticallyPublished] = useState(false);
  
  const { mutate: publish, isPending: isPublishing } = usePublishOpportunity();

  const handlePublish = () => {
    setIsOptimisticallyPublished(true);
    publish(id, {
      onSuccess: () => {
        router.refresh();
      },
      onError: () => {
        setIsOptimisticallyPublished(false);
      }
    });
  };

  // If it was a draft but we've hidden it optimistically, or it's already not a draft
  const showPublish = status === "DRAFT" && !isOptimisticallyPublished;

  return (
    <div className="flex items-center justify-end gap-2">
      {showPublish && (
        <Button
          size="sm"
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isPublishing ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : null}
          Publish
        </Button>
      )}

      {isOptimisticallyPublished && (
        <Badge variant="success" className="animate-in fade-in zoom-in duration-300">
          <Check className="h-3 w-3 mr-1" /> Published
        </Badge>
      )}
      
      <Link href={`/admin/opportunities/${id}`}>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Edit
        </Button>
      </Link>
    </div>
  );
}
