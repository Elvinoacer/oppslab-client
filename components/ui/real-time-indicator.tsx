// =============================================================================
// Real-time Update Indicator Component
// Displays live status and toast notifications for updates
// =============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useSocketEvent } from "@/lib/hooks/use-socket";
import { useToast } from "@/components/ui/use-toast";

export function RealTimeIndicator() {
  const [newCount, setNewCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  // Listen for new opportunities
  useSocketEvent("opportunities", "opportunity.created", (data: any) => {
    console.log("New opportunity created:", data);
    setNewCount((prev) => prev + 1);
    toast({
      title: "New Opportunity!",
      description: `${data.title} at ${data.company}`,
    });
  });

  if (newCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 cursor-pointer hover:bg-blue-700 transition-colors animate-in slide-in-from-bottom-5"
        onClick={() => {
          setNewCount(0);
          router.refresh(); // Refresh server components
          // Or invalidate queries
        }}
      >
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="font-medium">
          {newCount} new opportunit{newCount > 1 ? "ies" : "y"} available
        </span>
        <button 
          className="ml-2 hover:bg-blue-500 rounded-full p-1"
          onClick={(e) => {
            e.stopPropagation();
            setNewCount(0);
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
