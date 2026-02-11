// =============================================================================
// Homepage
// =============================================================================

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { HeroFact } from "@/components/marketing/hero-fact";
import { RecommendedSection } from "@/components/opportunities/recommended-section";
import { GoalBanner } from "@/components/marketing/goal-banner";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

async function getHomeData() {
  try {
    const [totalActive, recentlyAdded, categoryCounts, featuredOpportunities] = await Promise.all([
      prisma.opportunity.count({ where: { status: "ACTIVE" } }),
      prisma.opportunity.count({
        where: {
          status: "ACTIVE",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.opportunity.groupBy({
        by: ["primaryCategory"],
        where: { status: "ACTIVE" },
        _count: true,
        orderBy: { _count: { primaryCategory: "desc" } },
        take: 6,
      }),
      prisma.opportunity.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
    ]);

    // Serialize dates for client components
    const serializedFeatured = featuredOpportunities.map(opp => ({
      ...opp,
      createdAt: opp.createdAt.toISOString(),
      updatedAt: opp.updatedAt.toISOString(),
      deadline: opp.deadline ? opp.deadline.toISOString() : undefined,
      publishedAt: opp.publishedAt ? opp.publishedAt.toISOString() : undefined,
      expiresAt: opp.expiresAt ? opp.expiresAt.toISOString() : undefined,
      startDate: opp.startDate ? opp.startDate.toISOString() : undefined,
      endDate: opp.endDate ? opp.endDate.toISOString() : undefined,
      lastViewedAt: opp.lastViewedAt ? opp.lastViewedAt.toISOString() : undefined,
      deletedAt: opp.deletedAt ? opp.deletedAt.toISOString() : undefined,
    }));

    return { totalActive, recentlyAdded, categoryCounts, featuredOpportunities: serializedFeatured };
  } catch (error) {
    console.error("Error loading home data:", error);
    return { totalActive: 0, recentlyAdded: 0, categoryCounts: [], featuredOpportunities: [] };
  }
}

export default async function HomePage() {
  const { totalActive, recentlyAdded, featuredOpportunities } = await getHomeData();

  const categories = [
    { name: "Scholarships", slug: "scholarships", icon: "🎓", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { name: "Grants", slug: "grants", icon: "💰", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    { name: "Internships", slug: "internships", icon: "💼", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    { name: "Fellowships", slug: "fellowships", icon: "🏆", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
    { name: "Competitions", slug: "competitions", icon: "🏅", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    { name: "Jobs", slug: "jobs", icon: "👔", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { name: "Tasks", slug: "tasks", icon: "⚡", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent dark:from-blue-900/20"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-100 dark:text-gray-800" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <HeroFact />
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Over {recentlyAdded} new opportunities added this week
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Next Big Thing</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              The smartest way to discover scholarships, internships, grants, and career-launching opportunities. Curated daily, powered by AI.
            </p>

            <div className="max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700">
                <SearchBar size="lg" placeholder="Try 'Remote software engineer' or 'Design grants'..." />
              </div>
            </div>

            {/* Quick Stats/Trusted By */}
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                Verified Opportunities
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                Updated Daily
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                AI-Powered Match
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goal Capture */}
      <GoalBanner />

      {/* Categories Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Categories</h2>
            <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
              View all <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative flex flex-col items-center p-6 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 w-[calc(50%-1rem)] sm:w-48 lg:w-40 xl:w-48"
              >
                <div className={`w-14 h-14 flex items-center justify-center text-2xl rounded-2xl mb-4 transition-transform group-hover:scale-110 duration-300 ${category.color} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <RecommendedSection />

      {/* Featured Opportunities Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fresh Opportunities</h2>
              <p className="text-gray-500 dark:text-gray-400">The latest jobs, scholarships and grants added to our platform.</p>
            </div>
            <Link href="/opportunities" className="hidden sm:flex px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Browse All
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
             {/* @ts-ignore - types mismatch for OpportunityListItem vs Opportunity but structure matches for display */}
            {featuredOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp as any} />
            ))}
          </div>
          
          <div className="sm:hidden text-center">
             <Link href="/opportunities" className="inline-block px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Browse All Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative p-10 md:p-16 lg:p-20 text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                Stop Searching. Start Applying.
              </h2>
              <p className="text-blue-100 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of students and professionals finding their dream opportunities every day. 
                Get personalized alerts tailored to your goals.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 h-14 text-lg"
                >
                  Get Started for Free
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg backdrop-blur-sm"
                >
                  View Success Stories
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer minimal include */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} OppsLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

