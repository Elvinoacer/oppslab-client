// =============================================================================
// Scheduled Job: Expiration Management
// Runs daily to mark expired opportunities and send notifications
// =============================================================================

import { inngest } from "../client";
import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Daily job to check and update expired opportunities
 * Runs every day at 1:00 AM UTC
 */
export const expirationManagement = inngest.createFunction(
  {
    id: "expiration-management",
    name: "Expiration Management",
  },
  { cron: "0 1 * * *" }, // 1:00 AM UTC daily
  async ({ step, logger }) => {
    const now = new Date();

    // Step 1: Find and mark expired opportunities
    const expired = await step.run("mark-expired", async () => {
      const result = await prisma.opportunity.updateMany({
        where: {
          status: { in: ["ACTIVE", "EXPIRING_SOON"] },
          deadline: { lt: now },
        },
        data: {
          status: "EXPIRED",
        },
      });

      logger.info(`Marked ${result.count} opportunities as EXPIRED`);
      return result.count;
    });

    // Step 2: Find opportunities expiring soon (next 7 days)
    const expiringSoon = await step.run("mark-expiring-soon", async () => {
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const result = await prisma.opportunity.updateMany({
        where: {
          status: "ACTIVE",
          deadline: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
        data: {
          status: "EXPIRING_SOON",
        },
      });

      logger.info(`Marked ${result.count} opportunities as EXPIRING_SOON`);
      return result.count;
    });

    // Step 3: Trigger cache revalidation
    await step.run("revalidate-cache", async () => {
      revalidateTag("opportunities", { expire: 0 });
      revalidatePath("/opportunities");
      revalidatePath("/");
      logger.info("Cache revalidated");
    });

    // Step 4: Record in history
    await step.run("record-history", async () => {
      // Get IDs of recently expired opportunities
      const recentlyExpired = await prisma.opportunity.findMany({
        where: {
          status: "EXPIRED",
          updatedAt: { gte: new Date(now.getTime() - 60 * 1000) }, // Last minute
        },
        select: { id: true },
      });

      // Create history entries
      if (recentlyExpired.length > 0) {
        await prisma.opportunityHistory.createMany({
          data: recentlyExpired.map((opp) => ({
            opportunityId: opp.id,
            changeType: "STATUS_CHANGED",
            fieldName: "status",
            oldValue: { status: "ACTIVE" },
            newValue: { status: "EXPIRED" },
            // changedById is strictly for User ID, so we leave it null for system actions
            // or we could add a note in fullSnapshot if needed
            fullSnapshot: { action: "system:expiration-job" },
          })),
        });
      }
    });

    return {
      expired,
      expiringSoon,
      processedAt: now.toISOString(),
    };
  }
);

/**
 * Scheduled publishing job
 * Runs every 15 minutes to check for scheduled opportunities
 */
export const scheduledPublishing = inngest.createFunction(
  {
    id: "scheduled-publishing",
    name: "Scheduled Publishing",
  },
  { cron: "*/15 * * * *" }, // Every 15 minutes
  async ({ step, logger }) => {
    const now = new Date();

    // Find and publish scheduled opportunities
    const published = await step.run("publish-scheduled", async () => {
      // TODO: Implement scheduled publishing once scheduledPublishAt is added to schema
      return [];
      /*
      // Find opportunities scheduled for now or earlier
      const scheduled = await prisma.opportunity.findMany({
        where: {
          status: "SCHEDULED",
          scheduledPublishAt: { lte: now },
        },
        select: { id: true, slug: true, title: true },
      });

      if (scheduled.length === 0) {
        return [];
      }

      // Update status to ACTIVE
      await prisma.opportunity.updateMany({
        where: {
          id: { in: scheduled.map((o) => o.id) },
        },
        data: {
          status: "ACTIVE",
          publishedAt: now,
        },
      });

      logger.info(`Published ${scheduled.length} scheduled opportunities`);
      return scheduled;
      */
    });

    // Trigger cache revalidation if any published
    if (published.length > 0) {
      await step.run("revalidate-cache", async () => {
        revalidateTag("opportunities", { expire: 0 });
        revalidatePath("/opportunities");
        revalidatePath("/");
      });
    }

    return {
      published: published.length,
      opportunities: published,
      processedAt: now.toISOString(),
    };
  }
);
