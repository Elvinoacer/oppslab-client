// =============================================================================
// POST /api/v1/admin/opportunities/[id]/publish - Publish an opportunity
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/api/auth";
import { upsertOpportunityVector } from "@/lib/pinecone";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;

    // Get opportunity
    const existing = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true, status: true, title: true },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Opportunity not found"),
        StatusCodes.NOT_FOUND
      );
    }

    if (existing.status === "ACTIVE") {
      return jsonResponse(
        errorResponse("BAD_REQUEST", "Opportunity is already published"),
        StatusCodes.BAD_REQUEST
      );
    }

    if (existing.status === "DELETED") {
      return jsonResponse(
        errorResponse("BAD_REQUEST", "Cannot publish a deleted opportunity"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Publish
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        status: "ACTIVE",
        publishedAt: new Date(),
      },
    });

    // Index in Pinecone
    upsertOpportunityVector({
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
      workMode: opportunity.workMode,
      isRemote: opportunity.isRemote,
      skillsRequired: opportunity.skillsRequired,
      locationCity: opportunity.locationCity,
      locationCountry: opportunity.locationCountry,
      deadline: opportunity.deadline,
      status: opportunity.status,
      compensationType: opportunity.compensationType,
    }).catch((err) => console.error("Failed to index in Pinecone:", err));

    return jsonResponse(successResponse({
      id: opportunity.id,
      status: opportunity.status,
      publishedAt: opportunity.publishedAt,
    }));
  } catch (error) {
    console.error("Error publishing opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to publish opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
