// =============================================================================
// Search Page
// =============================================================================

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/lib/query";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveSearchButton } from "@/components/search/save-search-button";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const mode = searchParams.get("mode") as "hybrid" | "text" | "semantic" | undefined;

  const { data, isLoading, error } = useSearch(
    { query, searchMode: mode || "hybrid" },
    { enabled: query.length > 0 }
  );

  const results = data?.results || [];
  const meta = data?.meta;

  if (!query) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Search Opportunities
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Enter a search term to find scholarships, internships, jobs, and more.
          Try &quot;remote software internship&quot; or &quot;fully funded scholarship&quot;.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Search failed. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-gray-600 dark:text-gray-400">
            {meta && (
              <>
                Found <span className="font-medium">{meta.totalCount}</span> results
                {meta.processingTimeMs && (
                  <span className="text-sm ml-2">
                    ({meta.processingTimeMs}ms)
                  </span>
                )}
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {meta?.searchMode || "hybrid"} mode
            </Badge>
          </div>
        </div>
        
        <SaveSearchButton 
          query={query} 
          filters={{ searchMode: mode || "hybrid" }} 
        />
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((result) => (
            <div key={result.id} className="relative">
              <OpportunityCard opportunity={result as any} />
              {result.relevanceScore && (
                <div className="absolute top-3 right-3 text-xs bg-gray-900/60 text-white px-2 py-0.5 rounded">
                  {(result.relevanceScore * 100).toFixed(0)}% match
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No results for &quot;{query}&quot;
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Try different keywords or check out all opportunities
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/opportunities"}>
            Browse All
          </Button>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Search Opportunities
          </h1>
          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<div className="h-14 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />}>
               <SearchHeader />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}

function SearchHeader() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  return (
    <SearchBar
      initialQuery={query}
      size="lg"
      placeholder="Search by title, skills, company, location..."
    />
  );
}

