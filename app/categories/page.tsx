// =============================================================================
// Categories Page
// Fully dynamic - fetches categories from the database
// =============================================================================

import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { getCategoryCoverImage } from "@/lib/images";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  // Fetch all active categories from the database
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { 
          opportunities: {
            where: { opportunity: { status: "ACTIVE" } }
          }
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Browse by Category
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Explore opportunities organized by type. Find scholarships, internships,
            jobs, grants, and more tailored to your interests.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No categories found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const count = category._count.opportunities;
              // Use imageUrl from DB if available, otherwise fall back to generated one
              const imageUrl = category.imageUrl || getCategoryCoverImage(category.slug, category.slug);
              // Use hex color from DB or fallback to blue
              const themeColor = category.color || "#3b82f6";

              return (
                <Link
                  key={category.id}
                  href={`/opportunities?category=${category.slug}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 overflow-hidden isolate"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={imageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                    />
                    {/* Color Tint Overlay - using hex color from DB */}
                    <div 
                      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity mix-blend-overlay" 
                      style={{ backgroundColor: themeColor }}
                    />
                    {/* Legibility Gradient - Bottom up fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl shadow-sm">{category.icon || "📂"}</span>
                      <Badge variant="default" className="bg-gray-900/5 dark:bg-white/10 text-gray-900 dark:text-white border-0 backdrop-blur-sm">
                        {count} active
                      </Badge>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h2>

                    {category.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                      Browse category
                      <svg
                        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
