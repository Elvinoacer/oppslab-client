// =============================================================================
// Opportunities List Page
// =============================================================================

"use client";

import { Suspense, useState, useCallback, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOpportunities } from "@/lib/query";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, ChevronDown, Check, Sparkles, X, Target } from "lucide-react";
import type { OpportunityFilters, OpportunityCategory } from "@/lib/query";
import { cn } from "@/lib/utils";

const GOAL_LABELS: Record<string, string> = {
  unskilled: "Quick Money & Tasks",
  student: "Student Opportunities",
  professional: "Professional Roles",
  entrepreneur: "Entrepreneur Resources",
};

const categoryGroups = [
  {
    name: "Academic & Career",
    categories: ["SCHOLARSHIP", "GRANT", "FELLOWSHIP", "INTERNSHIP", "FULL_TIME", "PART_TIME", "COMPETITION", "PROGRAM", "APPRENTICESHIP", "VOLUNTEER", "RESEARCH"]
  },
  {
    name: "Service & Gigs",
    categories: ["FREELANCE", "CONTRACT", "TUTORING", "CONSULTING", "VIRTUAL_ASSISTANT", "TRANSCRIPTION", "TRANSLATION", "GIG", "COACHING", "AI_TRAINING"]
  },
  {
    name: "Content & Media",
    categories: ["CONTENT_MONETIZATION", "SPONSORSHIP", "NEWSLETTER", "COURSE", "PODCASTING", "AFFILIATE", "AMBASSADOR", "MEMBERSHIP"]
  },
  {
    name: "Assets & Finance",
    categories: ["WEBSITE_FLIPPING", "DOMAIN_FLIPPING", "REAL_ESTATE_DIGITAL", "TRADING_CRYPTO", "TRADING_STOCK", "INVESTMENT"]
  },
  {
    name: "Micro-tasks",
    categories: ["USER_TESTING", "DATA_LABELING", "BUG_BOUNTY", "MYSTERY_SHOPPING", "SIDE_HUSTLE", "SURVEY"]
  },
  {
    name: "Digital Products",
    categories: ["DROPSHIPPING", "PRINT_ON_DEMAND", "DIGITAL_PRODUCT", "RESELLING", "HANDMADE"]
  },
  {
    name: "Other",
    categories: ["OTHER"]
  }
];

// Helper component for filter sections
function FilterSection({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="py-3 first:pt-0 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {title}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for optimistic UI updates
  const [localCategory, setLocalCategory] = useState<OpportunityCategory | null>(
    (searchParams.get("category") as OpportunityCategory) || null
  );

  // Goal-based filtering
  const goalSegment = searchParams.get("goal");
  const goalCategories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const hasGoal = !!goalSegment && goalCategories.length > 0;

  // Auto-select first goal category if no explicit category is selected
  const effectiveCategory = localCategory || (hasGoal ? goalCategories[0] as OpportunityCategory : null);

  // Sync local state with URL params when they change (e.g. on Clear All)
  useEffect(() => {
    const urlCat = searchParams.get("category") as OpportunityCategory | null;
    if (urlCat) {
      setLocalCategory(urlCat);
    } else if (hasGoal && !localCategory) {
      setLocalCategory(goalCategories[0] as OpportunityCategory);
    } else {
      setLocalCategory(null);
    }
  }, [searchParams]);

  // Helper to update filters without reloading
  const updateFilter = useCallback((key: string, value: string | null) => {
    // Optimistically update local state if it's a category
    if (key === "category") {
      setLocalCategory(value as OpportunityCategory | null);
    }

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Change to page 1 when filtering
      if (key !== "page") {
        params.set("page", "1");
      }
      
      // Use replace with scroll: false for a smoother, non-blocking experience
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }, [searchParams, router]);

  // Build filters from URL
  const filters: OpportunityFilters = {
    category: (effectiveCategory || searchParams.get("category")) as OpportunityCategory | undefined,
    q: searchParams.get("q") || undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: 12,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  };

  const { data, isLoading, error } = useOpportunities(filters);

  const opportunities = data?.data || [];
  const meta = data?.meta;

  const FilterContent = () => (
    <div className={cn("flex flex-col gap-1 transition-opacity duration-300", isPending ? "opacity-70" : "opacity-100")}>
      {categoryGroups.map((group) => (
        <FilterSection key={group.name} title={group.name} defaultOpen={group.categories.includes(localCategory || "")}>
           {group.categories.map((cat) => {
              const isSelected = localCategory === cat;
              return (
                <label
                  key={cat}
                  className={cn(
                    "flex items-center gap-2.5 cursor-pointer text-sm px-2.5 py-2 rounded-lg transition-all duration-200 group/item",
                    isSelected 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold shadow-sm ring-1 ring-blue-100 dark:ring-blue-800/50" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white hover:shadow-sm"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => updateFilter("category", isSelected ? null : cat)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
                    isSelected 
                      ? "bg-blue-600 border-blue-600 shadow-sm" 
                      : "border-gray-300 dark:border-gray-600 group-hover/item:border-blue-400 group-hover/item:bg-blue-50/50"
                  )}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <span className="truncate">
                    {cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              )
           })}
        </FilterSection>
      ))}

      <FilterSection title="Work Mode" defaultOpen={false}>
         {["Remote", "Hybrid", "On-site"].map((mode) => (
            <label key={mode} className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-600 dark:text-gray-400 px-2.5 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all">
               <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-transparent" />
               <span className="truncate">{mode}</span>
            </label>
         ))}
      </FilterSection>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters (Desktop) */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sticky top-24 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h2>
              {(filters.category) && (
                <button 
                  onClick={() => router.push('/opportunities')}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Clear all
                </button>
              )}
           </div>
           <FilterContent />
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1 min-w-0">
        {/* Goal Banner */}
        {hasGoal && (
          <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200/60 dark:border-violet-700/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white shadow-md">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {GOAL_LABELS[goalSegment] || "Personalized Results"}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Showing {goalCategories.length} matching categories •{" "}
                <button
                  onClick={() => {
                    // Cycle through goal categories
                    const currentIdx = goalCategories.indexOf(effectiveCategory || "");
                    const nextIdx = (currentIdx + 1) % goalCategories.length;
                    updateFilter("category", goalCategories[nextIdx]);
                  }}
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Try next category
                </button>
              </p>
            </div>
            <button
              onClick={() => router.push("/opportunities")}
              className="shrink-0 p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
             {/* Mobile Filter Trigger */}
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto max-h-[calc(100vh-100px)]">
                    <FilterContent />
                  </div>
                </SheetContent>
             </Sheet>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {meta ? (
                <>
                  <span className="font-semibold text-gray-900 dark:text-white">{meta.totalCount}</span> results found
                </>
              ) : (
                "Loading..."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
             <select 
               className="text-sm border-gray-200 dark:border-gray-700 rounded-md bg-transparent focus:ring-0 focus:border-blue-500 cursor-pointer"
               value={filters.sortBy}
               onChange={(e) => updateFilter("sortBy", e.target.value)}
             >
               <option value="createdAt">Newest</option>
               <option value="deadline">Deadline</option>
               <option value="viewCount">Popular</option>
             </select>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {filters.category && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Active:</span>
            <Badge variant="category" category={filters.category} className="pl-2 pr-1 py-1">
              {filters.category.replace(/_/g, " ").toLowerCase()}
              <button
                onClick={() => updateFilter("category", null)}
                className="ml-2 p-0.5 hover:bg-black/10 rounded-full"
              >
                <span className="sr-only">Remove</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </Badge>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[450px] bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800/50 p-6 space-y-4 animate-pulse"
              >
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full" />
                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/2" />
                <div className="flex gap-2">
                   <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-20" />
                   <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-16" />
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                   <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg w-24" />
                   <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
               <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Something went wrong</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">We encountered an error while fetching the opportunities. Please try refreshing the page or contact support.</p>
            <Button size="lg" className="rounded-full px-8" onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && opportunities.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && opportunities.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 border border-gray-100 dark:border-gray-700 shadow-inner">
                 <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                No matches found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm mx-auto leading-relaxed">
                We couldn't find any opportunities matching your current filters. Try broader search terms or clear your filters.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 border-gray-200 dark:border-gray-700"
                onClick={() => {
                  router.push("/opportunities");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button
              variant="outline"
              disabled={!meta.hasPrevious}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(meta.page - 1));
                router.push(`?${params.toString()}`);
              }}
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!meta.hasNext}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(meta.page + 1));
                router.push(`?${params.toString()}`);
              }}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Premium Page Header - Compact Version */}
      <div className="relative overflow-hidden bg-gray-900 pt-12 pb-12 lg:pt-16 lg:pb-16">
        {/* Background Patterns & Images */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
          
          {/* Currency Images */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.05] dark:opacity-[0.08] mix-blend-overlay">
            <img 
              src="/images/bg/100-dollar-note.jpg" 
              alt="" 
              className="w-full h-full object-cover object-right-top grayscale brightness-150 rotate-3 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900" />
          </div>
          
          <div className="absolute bottom-0 left-0 w-1/2 h-full opacity-[0.04] dark:opacity-[0.07] mix-blend-soft-light">
            <img 
              src="/images/bg/1000-kes.webp" 
              alt="" 
              className="w-full h-full object-cover object-left-bottom grayscale invert brightness-50 -rotate-3 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900" />
          </div>

          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-end justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-700">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Premium Database</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 leading-tight">
                Discover Your Next <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Great Opportunity</span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                Access a curated collection of high-value freelance projects, scholarships, grants, and remote roles.
              </p>
            </div>

            <div className="w-full max-w-md lg:w-[450px]">
               <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                 <SearchBar placeholder="Search opportunities..." size="lg" />
               </div>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl text-indigo-500 opacity-50" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-4 sm:p-6 backdrop-blur-sm min-h-[500px]">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <div className="text-gray-500 dark:text-gray-400 font-medium">Curating opportunities...</div>
            </div>
          }>
            <OpportunitiesContent />
          </Suspense>
        </div>
      </div>

      {/* Footer Space */}
      <div className="py-20" />
    </div>
  );
}


