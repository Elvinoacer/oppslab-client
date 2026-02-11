"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OpportunityImageProps {
  src?: string | null;
  alt: string;
  category: string;
  categoryStyle: { bg: string; text: string };
  isExpiringSoon?: boolean;
  className?: string;
  overlay?: boolean;
}

export function OpportunityImage({
  src,
  alt,
  category,
  categoryStyle,
  isExpiringSoon,
  className,
  overlay = false,
}: OpportunityImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If src changes, reset error state
  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]);

  const hasImage = src && !error;

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      {hasImage ? (
        overlay ? (
          // Overlay Mode: Force COVER to fill background
          <img
            src={src!}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              loaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
              "opacity-20 group-hover:opacity-30 transition-opacity"
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        ) : (
          // Default Mode: Smart Blur + Contain
          <>
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={src!}
                alt=""
                aria-hidden="true"
                className={cn(
                  "w-full h-full object-cover blur-xl opacity-60 scale-110 transition-transform duration-700",
                  loaded ? "opacity-60" : "opacity-0"
                )}
              />
            </div>
            <img
              src={src!}
              alt={alt}
              className={cn(
                "relative w-full h-full object-contain z-10 transition-all duration-700 drop-shadow-sm",
                loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        )
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${categoryStyle.bg} to-white dark:to-gray-800 opacity-50`} />
      )}

      {overlay && hasImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80" />
      )}

      {/* Badges - Only rendered if not overlay mode, OR if overlay mode but managed by parent. 
          Actually here we want to handle the internal badges if it's the default view 
          But the Card component handles badges externally for 'compact' and 'featured' usually?
          Let's stick to just rendering the image/background here, and let parent render badges ON TOP if needed. 
          BUT for the 'default' variant, the badges were INSIDE the image container. 
      */}
    </div>
  );
}
