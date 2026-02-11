"use client";

import { useOpportunities } from "@/lib/query";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function RecommendedSection() {
  const { data: session } = useSession();

  const { data, isLoading, isError } = useOpportunities({
    personalized: true,
    pageSize: 6,
  });

  // Don't render if user is not logged in
  if (!session?.user) return null;

  // Don't render while loading or on error
  if (isLoading) {
    return (
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || !data?.data?.length) return null;

  // Only show opportunities with a meaningful match score (> 0)
  const matched = data.data.filter((opp) => (opp.matchScore ?? 0) > 0);
  if (matched.length === 0) return null;

  return (
    <section className="py-16 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl text-white shadow-lg shadow-violet-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recommended for You
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Based on your skills and profile
              </p>
            </div>
          </div>
          <Link
            href="/opportunities?personalized=true"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            View all matches
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matched.slice(0, 3).map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </div>
    </section>
  );
}
