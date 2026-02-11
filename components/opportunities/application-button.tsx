"use client";

import { useState } from "react";
import { useMarkApplied } from "@/lib/query/hooks";
import { Button, ButtonVariant, ButtonSize } from "@/components/ui/button";
import { Check, Loader2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ApplicationButtonProps {
  opportunityId: string;
  isApplied?: boolean;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function ApplicationButton({ 
  opportunityId, 
  isApplied = false, 
  className,
  size = "md",
  variant = "primary"
}: ApplicationButtonProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { mutate, isPending } = useMarkApplied();

  const handleApply = () => {
    mutate(
      { id: opportunityId, status: "APPLIED", feedback },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  if (isApplied) {
    return (
      <Button 
        variant="ghost" 
        size={size} 
        className={cn("text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-default", className)}
        disabled
      >
        <Check className="w-4 h-4 mr-2" />
        Applied
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn(className)}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          I Applied
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark as Applied</DialogTitle>
          <DialogDescription>
            Great job! Marking this as applied will move it to your dashboard and remove it from the main feed so you can focus on new opportunities.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Optional Notes</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add any personal notes about this application (e.g. "Used resume v2", "Referral from John").
            </p>
            <Textarea
              placeholder="Type your notes here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleApply} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
