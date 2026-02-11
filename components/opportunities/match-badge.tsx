
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface MatchBadgeProps {
  score: number;
  className?: string;
}

export function MatchBadge({ score, className }: MatchBadgeProps) {
  if (!score || score < 50) return null;

  let colorClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  if (score >= 80) {
    colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
  } else if (score >= 60) {
    colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"; // Should check legibility
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
      colorClass,
      className
    )}>
      <Sparkles className="w-3 h-3" />
      {score}% Match
    </div>
  );
}
