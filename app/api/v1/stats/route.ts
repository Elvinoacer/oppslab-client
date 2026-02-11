// =============================================================================
// GET /api/v1/stats - Platform statistics
// =============================================================================

import { prisma } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Execute queries in parallel
    const [
      totalActive,
      expiringSoon,
      recentlyAdded,
      totalCategories,
      categoryCounts,
      industryCounts,
      locationCounts,
      topCompanies,
    ] = await Promise.all([
      // Total active opportunities
      prisma.opportunity.count({
        where: { status: "ACTIVE", deletedAt: null },
      }),

      // Expiring within 7 days
      prisma.opportunity.count({
        where: {
          status: { in: ["ACTIVE", "EXPIRING_SOON"] },
          deletedAt: null,
          deadline: { gte: now, lte: sevenDaysFromNow },
        },
      }),

      // Added in last 30 days
      prisma.opportunity.count({
        where: {
          status: "ACTIVE",
          deletedAt: null,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Total active categories
      prisma.category.count({
        where: { isActive: true },
      }),

      // Opportunities by category
      prisma.opportunity.groupBy({
        by: ["primaryCategory"],
        where: { status: "ACTIVE", deletedAt: null },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Opportunities by industry
      prisma.opportunity.groupBy({
        by: ["industry"],
        where: { status: "ACTIVE", deletedAt: null, industry: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Opportunities by country
      prisma.opportunity.groupBy({
        by: ["locationCountry"],
        where: { status: "ACTIVE", deletedAt: null, locationCountry: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Top companies by opportunity count
      prisma.opportunity.groupBy({
        by: ["company"],
        where: { status: "ACTIVE", deletedAt: null },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    // Format the stats
    const stats = {
      overview: {
        totalActive,
        expiringSoon,
        recentlyAdded,
        totalCategories,
      },
      topCategories: categoryCounts.map((c) => ({
        category: c.primaryCategory,
        count: c._count.id,
      })),
      topIndustries: industryCounts
        .filter((i) => i.industry !== null)
        .map((i) => ({
          industry: i.industry,
          count: i._count.id,
        })),
      topLocations: locationCounts
        .filter((l) => l.locationCountry !== null)
        .map((l) => ({
          country: l.locationCountry,
          count: l._count.id,
        })),
      topCompanies: topCompanies.map((c) => ({
        company: c.company,
        count: c._count.id,
      })),
      generatedAt: now.toISOString(),
    };

    return jsonResponse(successResponse(stats), StatusCodes.OK, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch statistics"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
