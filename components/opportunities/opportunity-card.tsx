// =============================================================================
// Opportunity Card Component
// =============================================================================

import Link from "next/link";
import { cn, formatDate, formatRelativeTime, formatCurrency, truncate } from "@/lib/utils";
import { categoryColors } from "@/components/ui/theme";
import { Badge } from "@/components/ui/badge";
import { MatchBadge } from "@/components/opportunities/match-badge";
import { OpportunityImage } from "@/components/opportunities/opportunity-image";
import type { OpportunityListItem } from "@/lib/query";

export interface OpportunityCardProps {
  opportunity: OpportunityListItem;
  variant?: "default" | "compact" | "featured";
  showTags?: boolean;
  className?: string;
}

export function OpportunityCard({
  opportunity,
  variant = "default",
  showTags = true,
  className,
}: OpportunityCardProps) {
  const {
    slug,
    title,
    company,
    shortDescription,
    primaryCategory,
    locationCity,
    locationCountry,
    isRemote,
    deadline,
    compensationMin,
    compensationMax,
    compensationCurrency,
    skillsRequired,
    coverImage, 
    matchScore,
  } = opportunity;

  const categoryStyle = categoryColors[primaryCategory] || categoryColors.OTHER;
  const isExpiringSoon = !!deadline && new Date(deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const location = [locationCity, locationCountry].filter(Boolean).join(", ") || (isRemote ? "Remote" : "");

  const compensation =
    compensationMin && compensationMax
      ? `${formatCurrency(compensationMin, compensationCurrency)} - ${formatCurrency(compensationMax, compensationCurrency)}`
      : compensationMin
      ? `From ${formatCurrency(compensationMin, compensationCurrency)}`
      : null;

  if (variant === "compact") {
    return (
      <Link
        href={`/opportunities/${slug}`}
        className={cn(
          "block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
          "hover:border-blue-300 hover:shadow-md transition-all duration-200",
          className
        )}
      >
        <div className="flex">
          <div className="w-24 min-w-[6rem] self-stretch">
             <OpportunityImage 
               src={coverImage}
               alt={title}
               category={primaryCategory}
               categoryStyle={categoryStyle}
               isExpiringSoon={isExpiringSoon}
             />
          </div>
          <div className="p-4 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex flex-col min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
                <div className="flex items-center gap-2 mt-1">
                   {matchScore && <MatchBadge score={matchScore} />}
                </div>
              </div>
              <Badge variant="category" category={primaryCategory} className="flex-shrink-0">
                {primaryCategory.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{company}</p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/opportunities/${slug}`}
        className={cn(
          "group block relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700",
          "hover:shadow-xl hover:border-blue-400 transition-all duration-300",
          "transform hover:-translate-y-1",
          className
        )}
      >
        {/* Cover Image Background for Featured */}
        <div className="absolute inset-0 z-0">
          <OpportunityImage 
            src={coverImage}
            alt={title}
            category={primaryCategory}
            categoryStyle={categoryStyle}
            isExpiringSoon={isExpiringSoon}
            overlay={true}
          />
        </div>

        <div className="relative z-10 p-6 flex flex-col h-full">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
               {matchScore && <MatchBadge score={matchScore} />}
               <Badge variant="category" category={primaryCategory}>
                 {primaryCategory.replace("_", " ")}
               </Badge>
            </div>
            {isExpiringSoon && (
              <Badge variant="warning">Expiring Soon</Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-3">{company}</p>
          
          {shortDescription && (
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-4 flex-1">
              {truncate(shortDescription, 120)}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-auto">
            {location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatRelativeTime(deadline)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/opportunities/${slug}`}
      className={cn(
        "group block bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800/50 overflow-hidden",
        "shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none",
        "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
        "hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-500 ease-out",
        "transform hover:-translate-y-2",
        className
      )}
    >
      {/* Cover Image Section */}
      <div className="h-56 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
         <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
           <OpportunityImage 
              src={coverImage}
              alt={title}
              category={primaryCategory}
              categoryStyle={categoryStyle}
              isExpiringSoon={isExpiringSoon}
           />
         </div>
         
         {/* Refined Overlays */}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
         <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
         
         {/* Top Badges */}
         <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            {matchScore && <MatchBadge score={matchScore} className="shadow-lg backdrop-blur-md bg-white/95 dark:bg-gray-950/90" />}
            <Badge className="bg-white/95 dark:bg-gray-950/90 text-gray-900 dark:text-gray-100 hover:bg-white backdrop-blur-md border-0 shadow-lg font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full">
              {primaryCategory.replace("_", " ")}
            </Badge>
         </div>
         
         {isExpiringSoon && (
            <div className="absolute top-4 left-4 z-10">
               <div className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                 <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                 Expiring
               </div>
            </div>
         )}

         {/* Bottom Info on Image */}
         <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-2xl">
                  <div className="h-full w-full rounded-lg bg-white dark:bg-gray-950 flex items-center justify-center overflow-hidden">
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {company.charAt(0).toUpperCase()}
                    </span>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-white/90 truncate max-w-[120px]">{company}</span>
                  {location && (
                    <span className="text-[10px] font-medium text-white/70 flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {truncate(location, 20)}
                    </span>
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight min-h-[3.5rem]">
          {title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {compensation && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
              {compensation}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-500/20">
            {isRemote ? "Remote" : "Hybrid"}
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800/50">
           <div className="flex flex-col gap-0.5">
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Deadline</span>
             <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
               {deadline ? formatDate(deadline) : "Open indefinitely"}
             </span>
           </div>
           
           <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
             <svg 
               className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-white transition-colors duration-300" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
             >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
           </div>
        </div>
      </div>
    </Link>
  );
}
