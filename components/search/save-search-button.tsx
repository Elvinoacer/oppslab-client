"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSaveSearch } from "@/lib/query/user-mutations";
import { toast } from "sonner";
import { Loader2, BellPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveSearchButtonProps {
  query: string;
  filters: Record<string, any>;
  className?: string;
}

export function SaveSearchButton({ query, filters, className }: SaveSearchButtonProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(query || "My Search");
  const [isOpen, setIsOpen] = useState(false);
  
  const saveMutation = useSaveSearch();

  const handleSave = async () => {
    if (!session) {
      toast.error("Please log in to save searches");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        name,
        query,
        filters,
      });
      toast.success("Search saved successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save search:", error);
      toast.error("Failed to save search");
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <BellPlus className="w-4 h-4 mr-2" />
          Save Search
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Give your search a name to easily find it later in your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
