// =============================================================================
// Badge Component
// =============================================================================

import { cn } from "@/lib/utils";
import { categoryColors } from "@/components/ui/theme";

export type BadgeVariant = "default" | "secondary" | "category" | "success" | "warning" | "error" | "info" | "outline";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  category?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300",
  secondary: "bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-600 dark:text-gray-200",
  category: "", // Dynamic based on category prop
  success: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  error: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  outline: "bg-transparent text-gray-700 border-gray-300 dark:text-gray-300 dark:border-gray-600",
};

export function Badge({ children, variant = "default", category, className }: BadgeProps) {
  let styles = variantStyles[variant];
  
  if (variant === "category" && category) {
    const catStyle = categoryColors[category] || categoryColors.OTHER;
    styles = `${catStyle.bg} ${catStyle.text} ${catStyle.border}`;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles,
        className
      )}
    >
      {children}
    </span>
  );
}
