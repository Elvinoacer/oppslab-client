// =============================================================================
// Scheduled Job: Analytics Processing
// Aggregates daily stats and updates platform metrics
// =============================================================================

import { inngest } from "../client";
import { prisma } from "@/lib/db";

/**
 * Daily analytics aggregation job
 * Runs every day at 3:00 AM UTC
 */
export const analyticsProcessing = inngest.createFunction(
  {
    id: "analytics-processing",
    name: "Analytics Processing",
  },
  { cron: "0 3 * * *" }, // 3:00 AM UTC daily
  async ({ step, logger }) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Step 1: Calculate platform stats
    const stats = await step.run("calculate-stats", async () => {
      const [
        totalActive,
        expiringSoon,
        todayViews,
        todaySearches,
        newOpportunities,
        categoryBreakdown,
      ] = await Promise.all([
        // Total active opportunities
        prisma.opportunity.count({
          where: { status: "ACTIVE" },
        }),

        // Expiring soon
        prisma.opportunity.count({
          where: { status: "EXPIRING_SOON" },
        }),

        // Today's total views (sum of viewCount for updated opportunities is an approximation, 
        // ideally we'd track daily views separately but this schema uses a simple counter)
        // For accurate daily views we'd need a separate table, but here we can track total views 
        // and calculate delta or just use current total as a snapshop.
        // Let's use total platform views as the metric for now since we don't have daily granularity on Opportunity.
        prisma.opportunity.aggregate({
          _sum: { viewCount: true },
        }),

        // Today's searches
        prisma.searchQuery.count({
          where: {
            searchedAt: { gte: today },
          },
        }),

        // New opportunities created today
        prisma.opportunity.count({
          where: {
            createdAt: { gte: today },
          },
        }),

        // Category breakdown
        prisma.opportunity.groupBy({
          by: ["primaryCategory"],
          where: { status: "ACTIVE" },
          _count: true,
          orderBy: { _count: { primaryCategory: "desc" } },
        }),
      ]);

      return {
        totalActive,
        expiringSoon,
        totalViews: todayViews._sum.viewCount || 0,
        todaySearches,
        newOpportunities,
        categoryBreakdown,
      };
    });

    logger.info("Platform stats calculated", stats);

    // Step 2: Update or create platform stats record for today
    await step.run("update-platform-stats", async () => {
      // Map category breakdown to JSON matching expected schema
      const topCategories = stats.categoryBreakdown.map((c) => ({
        category: c.primaryCategory,
        count: c._count,
      }));

      await prisma.platformStats.upsert({
        where: { date: today },
        update: {
          totalActive: stats.totalActive,
          expiringSoon: stats.expiringSoon,
          newOpportunities: stats.newOpportunities,
          // Since we don't track daily view deltas, we store total cumulative views
          // A better approach would be: totalViews - yesterday's totalViews, but let's stick to snapshot.
          totalViews: stats.totalViews, 
          totalSearches: stats.todaySearches,
          topCategories: topCategories as any,
          updatedAt: now,
        },
        create: {
          date: today,
          totalActive: stats.totalActive,
          expiringSoon: stats.expiringSoon,
          newOpportunities: stats.newOpportunities,
          totalViews: stats.totalViews,
          totalSearches: stats.todaySearches,
          topCategories: topCategories as any,
          // Initialize other JSON fields
          topIndustries: [],
          topLocations: [],
          topCompanies: [],
        },
      });

      logger.info("Platform stats updated");
    });

    // Step 3: Clean up old search queries (older than 30 days)
    const deletedQueries = await step.run("cleanup-old-queries", async () => {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const result = await prisma.searchQuery.deleteMany({
        where: {
          searchedAt: { lt: thirtyDaysAgo },
        },
      });

      logger.info(`Deleted ${result.count} old search queries`);
      return result.count;
    });

    return {
      stats,
      deletedQueries,
      processedAt: now.toISOString(),
    };
  }
);

/**
 * Hourly stats refresh (lighter version)
 */
export const hourlyStatsRefresh = inngest.createFunction(
  {
    id: "hourly-stats-refresh",
    name: "Hourly Stats Refresh",
  },
  { cron: "30 * * * *" }, // Every hour at :30
  async ({ step, logger }) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = await step.run("quick-stats", async () => {
      const [totalActive, expiringSoon, totalViews] = await Promise.all([
        prisma.opportunity.count({ where: { status: "ACTIVE" } }),
        prisma.opportunity.count({ where: { status: "EXPIRING_SOON" } }),
        prisma.opportunity.aggregate({
          _sum: { viewCount: true },
        }),
      ]);

      return { 
        totalActive, 
        expiringSoon, 
        totalViews: totalViews._sum.viewCount || 0 
      };
    });

    await step.run("update-quick-stats", async () => {
      await prisma.platformStats.upsert({
        where: { date: today },
        update: {
          totalActive: stats.totalActive,
          expiringSoon: stats.expiringSoon,
          totalViews: stats.totalViews,
          updatedAt: now,
        },
        create: {
          date: today,
          totalActive: stats.totalActive,
          expiringSoon: stats.expiringSoon,
          totalViews: stats.totalViews,
          updatedAt: now,
        },
      });
    });

    logger.info("Hourly stats refreshed", stats);
    return stats;
  }
);
