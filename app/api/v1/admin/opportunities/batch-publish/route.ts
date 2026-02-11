// =============================================================================
// POST /api/v1/admin/opportunities/batch-publish - Publish all drafts
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/api/auth";
import { upsertOpportunityVectorsBatch } from "@/lib/pinecone";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    // Get all drafts
    const drafts = await prisma.opportunity.findMany({
      where: { status: "DRAFT" },
    });

    if (drafts.length === 0) {
      return jsonResponse(successResponse({ count: 0, message: "No drafts found to publish" }));
    }

    // Update all drafts to ACTIVE in a single transaction
    const now = new Date();
    await prisma.opportunity.updateMany({
      where: { status: "DRAFT" },
      data: {
        status: "ACTIVE",
        publishedAt: now,
      },
    });

    // Get the updated records for indexing (Prisma updateMany doesn't return records)
    const published = await prisma.opportunity.findMany({
      where: {
        id: { in: drafts.map(d => d.id) }
      }
    });

    // Batch index in Pinecone
    upsertOpportunityVectorsBatch(published.map(opp => ({
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
      workMode: opp.workMode,
      isRemote: opp.isRemote,
      skillsRequired: opp.skillsRequired,
      locationCity: opp.locationCity,
      locationCountry: opp.locationCountry,
      deadline: opp.deadline,
      status: "ACTIVE",
      compensationType: opp.compensationType,
    }))).catch((err) => console.error("Failed to batch index in Pinecone:", err));

    return jsonResponse(successResponse({
      count: published.length,
      message: `Successfully published ${published.length} opportunities`,
    }));
  } catch (error) {
    console.error("Error batch publishing opportunities:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to batch publish opportunities"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
