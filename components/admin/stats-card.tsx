// =============================================================================
// Stats Card Component
// Used in admin dashboard
// =============================================================================

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  idx?: number; // For styling variations if needed
  className?: string;
}

export function StatsCard({ title, value, description, className }: StatsCardProps) {
  return (
    <div className={cn("p-6 bg-white rounded-lg border shadow-sm", className)}>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {description && (
        <div className="text-xs text-gray-400 mt-1">{description}</div>
      )}
    </div>
  );
}
