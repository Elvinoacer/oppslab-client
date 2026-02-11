"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSaveOpportunity, useUnsaveOpportunity } from "@/lib/query/user-mutations";
import { toast } from "sonner";
import { Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  opportunityId: string;
  initialIsSaved?: boolean;
  savedOpportunityId?: string;
  className?: string;
}

export function SaveButton({ 
  opportunityId, 
  initialIsSaved = false, 
  savedOpportunityId,
  className 
}: SaveButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [savedId, setSavedId] = useState<string | undefined>(savedOpportunityId);

  // Mutations
  const saveMutation = useSaveOpportunity();
  const unsaveMutation = useUnsaveOpportunity();

  const isLoading = saveMutation.isPending || unsaveMutation.isPending;

  const handleToggleSave = async () => {
    if (!session) {
      toast.error("Please log in to save opportunities");
      router.push(`/auth/signin?callbackUrl=/opportunities/${opportunityId}`);
      return;
    }

    try {
      if (isSaved) {
        // Unsave
        if (savedId) {
          await unsaveMutation.mutateAsync(savedId);
          setIsSaved(false);
          setSavedId(undefined);
          toast.success("Removed from saved opportunities");
        }
      } else {
        // Save
        const result = await saveMutation.mutateAsync({ opportunityId });
        setIsSaved(true);
        setSavedId(result.id);
        toast.success("Saved for later");
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
      toast.error(isSaved ? "Failed to remove from saved" : "Failed to save opportunity");
    }
  };

  return (
    <Button 
      variant={isSaved ? "secondary" : "outline"} 
      className={className}
      onClick={handleToggleSave}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="w-4 h-4 mr-2 text-primary" />
      ) : (
        <Bookmark className="w-4 h-4 mr-2" />
      )}
      {isLoading ? "Processing..." : isSaved ? "Saved" : "Save for Later"}
    </Button>
  );
}
