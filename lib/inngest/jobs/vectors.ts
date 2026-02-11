// =============================================================================
// Scheduled Job: Vector Embedding Sync
// Syncs stale vector embeddings with Pinecone
// =============================================================================

import { inngest } from "../client";
import { prisma } from "@/lib/db";
import { upsertOpportunityVector, deleteOpportunityVector } from "@/lib/pinecone/operations";

/**
 * Hourly job to sync vector embeddings
 * Processes opportunities with stale or missing embeddings
 */
export const vectorEmbeddingSync = inngest.createFunction(
  {
    id: "vector-embedding-sync",
    name: "Vector Embedding Sync",
    throttle: {
      limit: 1,
      period: "5m", // Max once per 5 minutes
    },
  },
  { cron: "0 * * * *" }, // Every hour at :00
  async ({ step, logger }) => {
    const batchSize = 50;
    let processed = 0;
    let errors = 0;

    // Step 1: Find opportunities needing vector sync
    const opportunities = await step.run("find-stale-vectors", async () => {
      return prisma.opportunity.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { vectorEmbedding: { is: null } },
            { vectorEmbedding: { needsUpdate: true } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          company: true,
          description: true,
          shortDescription: true,
          skillsRequired: true,
          primaryCategory: true,
          industry: true,
          roleType: true,
          experienceLevel: true,
          workMode: true,
          locationCity: true,
          locationCountry: true,
          isRemote: true,
          deadline: true,
          status: true,
          compensationType: true,
        },
        take: batchSize,
        orderBy: { updatedAt: "desc" },
      });
    });

    logger.info(`Found ${opportunities.length} opportunities needing vector sync`);

    // Step 2: Process each opportunity
    for (const opp of opportunities) {
      try {
        await step.run(`sync-vector-${opp.id}`, async () => {
          // Prepare data for upsert
          const oppData = {
            id: opp.id,
            slug: opp.slug,
            title: opp.title,
            company: opp.company,
            description: opp.description,
            shortDescription: opp.shortDescription,
            primaryCategory: opp.primaryCategory,
            industry: opp.industry,
            roleType: opp.roleType,
            experienceLevel: opp.experienceLevel,
            workMode: opp.workMode ? opp.workMode.toString() : undefined,
            isRemote: opp.isRemote,
            skillsRequired: opp.skillsRequired,
            locationCity: opp.locationCity,
            locationCountry: opp.locationCountry,
            deadline: opp.deadline ? new Date(opp.deadline) : null,
            status: opp.status,
            compensationType: opp.compensationType,
          };

          // Upsert to Pinecone (handles embedding generation internally)
          await upsertOpportunityVector(oppData);

          // Update VectorEmbedding status in DB
          await prisma.vectorEmbedding.upsert({
            where: { opportunityId: opp.id },
            create: {
              opportunityId: opp.id,
              pineconeId: opp.id,
              needsUpdate: false,
              embeddingModel: "gemini-embedding-001",
            },
            update: {
              needsUpdate: false,
              lastUpdatedAt: new Date(),
            },
          });

          processed++;
          logger.info(`Synced vector for ${opp.id}`);
        });
      } catch (error) {
        errors++;
        logger.error(`Failed to sync vector for ${opp.id}:`, { error });
      }
    }

    // Step 3: Clean up deleted opportunities
    // This part assumes we want to key off the VectorEmbedding table now
    const deleted = await step.run("cleanup-deleted", async () => {
      // Find VectorEmbeddings where the opportunity doesn't exist or is deleted
      // Note: Relation is cascade delete, so if opportunity is hard deleted, embedding is gone.
      // But we soft delete opportunities (status=DELETED or deletedAt set).
      
      const deletedStart = await prisma.opportunity.findMany({
          where: {
              status: "DELETED",
              vectorEmbedding: { isNot: null }
          },
          select: { id: true, vectorEmbedding: { select: { pineconeId: true } } },
          take: 100
      });

      for (const opp of deletedStart) {
        if (opp.vectorEmbedding?.pineconeId) {
          await deleteOpportunityVector(opp.vectorEmbedding.pineconeId);
          // We can delete the VectorEmbedding record purely to keep DB clean, 
          // or just leave it since the opportunity is soft-deleted.
          // Let's delete the metadata record to mark it as gone from vector store.
          await prisma.vectorEmbedding.delete({
              where: { opportunityId: opp.id }
          });
        }
      }

      return deletedStart.length;
    });

    return {
      processed,
      errors,
      deletedCleaned: deleted,
      processedAt: new Date().toISOString(),
    };
  }
);

/**
 * Event-driven vector sync (on opportunity create/update)
 */
export const syncOpportunityVector = inngest.createFunction(
  {
    id: "sync-opportunity-vector",
    name: "Sync Opportunity Vector",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.opportunityId",
    },
  },
  [
    { event: "opportunity/created" },
    { event: "opportunity/updated" },
    { event: "opportunity/published" },
  ],
  async ({ event, step, logger }) => {
    const { opportunityId } = event.data;

    // Fetch opportunity
    const opportunity = await step.run("fetch-opportunity", async () => {
      return prisma.opportunity.findUnique({
        where: { id: opportunityId },
        select: {
          id: true,
          slug: true,
          title: true,
          company: true,
          description: true,
          shortDescription: true,
          skillsRequired: true,
          primaryCategory: true,
          industry: true,
          roleType: true,
          experienceLevel: true,
          workMode: true,
          locationCity: true,
          locationCountry: true,
          isRemote: true,
          deadline: true,
          status: true,
          compensationType: true,
        },
      });
    });

    if (!opportunity || opportunity.status !== "ACTIVE") {
      logger.info(`Skipping vector sync for ${opportunityId} - not active`);
      // If it was previously active and now isn't, we should maybe remove it from vector store?
      // For now, simpler to just skip upsert.
      return { skipped: true };
    }

    // Upsert to Pinecone
    await step.run("upsert-vector", async () => {
       const oppData = {
            id: opportunity.id,
            slug: opportunity.slug,
            title: opportunity.title,
            company: opportunity.company,
            description: opportunity.description,
            shortDescription: opportunity.shortDescription,
            primaryCategory: opportunity.primaryCategory,
            industry: opportunity.industry,
            roleType: opportunity.roleType,
            experienceLevel: opportunity.experienceLevel,
            workMode: opportunity.workMode ? opportunity.workMode.toString() : undefined,
            isRemote: opportunity.isRemote,
            skillsRequired: opportunity.skillsRequired,
            locationCity: opportunity.locationCity,
            locationCountry: opportunity.locationCountry,
            deadline: opportunity.deadline ? new Date(opportunity.deadline) : null,
            status: opportunity.status,
            compensationType: opportunity.compensationType,
          };
      
      await upsertOpportunityVector(oppData);

      // Update DB status
      await prisma.vectorEmbedding.upsert({
        where: { opportunityId: opportunity.id },
        create: {
          opportunityId: opportunity.id,
          pineconeId: opportunity.id,
          needsUpdate: false,
          embeddingModel: "gemini-embedding-001",
        },
        update: {
          needsUpdate: false,
          lastUpdatedAt: new Date(),
        },
      });

      logger.info(`Vector synced for ${opportunityId}`);
    });

    return { synced: true, opportunityId };
  }
);
