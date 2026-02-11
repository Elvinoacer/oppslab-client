// =============================================================================
// Admin Opportunity by ID API
// PUT - Update opportunity
// DELETE - Soft delete opportunity
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/api/auth";
import { upsertOpportunityVector, deleteOpportunityVector } from "@/lib/pinecone";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET - Get single opportunity for editing
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        eligibilityCriteria: true,
        benefits: true,
        requiredMaterials: true,
        timelineEvents: { orderBy: { eventDate: "asc" } },
        contacts: true,
        curatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!opportunity) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Opportunity not found"),
        StatusCodes.NOT_FOUND
      );
    }

    return jsonResponse(successResponse(opportunity));
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// PUT - Update opportunity
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if opportunity exists
    const existing = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Opportunity not found"),
        StatusCodes.NOT_FOUND
      );
    }

    // Handle status change
    const statusChanged = body.status && body.status !== existing.status;
    const isPublishing = statusChanged && body.status === "ACTIVE";
    const isUnpublishing = statusChanged && existing.status === "ACTIVE" && body.status !== "ACTIVE";

    // Update opportunity
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        title: body.title,
        company: body.company,
        description: body.description,
        shortDescription: body.shortDescription,
        coverImage: body.coverImage,
        primaryCategory: body.primaryCategory,
        industry: body.industry,
        roleType: body.roleType,
        experienceLevel: body.experienceLevel,
        workMode: body.workMode,
        isRemote: body.isRemote,
        locationCity: body.locationCity,
        locationCountry: body.locationCountry,
        locationCoordinates: body.locationCoordinates,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        compensationType: body.compensationType,
        compensationMin: body.compensationMin,
        compensationMax: body.compensationMax,
        compensationCurrency: body.compensationCurrency,
        compensationPeriod: body.compensationPeriod,
        skillsRequired: body.skillsRequired,
        educationRequirements: body.educationRequirements,
        experienceRequired: body.experienceRequired,
        languageRequirements: body.languageRequirements,
        applicationUrl: body.applicationUrl,
        applicationEmail: body.applicationEmail,
        applicationInstructions: body.applicationInstructions,
        sourcePlatform: body.sourcePlatform,
        sourceUrl: body.sourceUrl,
        status: body.status,
        publishedAt: isPublishing ? new Date() : undefined,
        keywords: body.keywords,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
      },
      include: {
        eligibilityCriteria: true,
        benefits: true,
        requiredMaterials: true,
        timelineEvents: true,
        contacts: true,
      },
    });

    // Update related records if provided
    if (body.eligibilityCriteria) {
      await prisma.eligibilityCriteria.deleteMany({ where: { opportunityId: id } });
      if (body.eligibilityCriteria.length) {
        await prisma.eligibilityCriteria.createMany({
          data: body.eligibilityCriteria.map((c: { type: string; description: string; required: boolean }) => ({
            ...c,
            opportunityId: id,
          })),
        });
      }
    }

    if (body.benefits) {
      await prisma.benefit.deleteMany({ where: { opportunityId: id } });
      if (body.benefits.length) {
        await prisma.benefit.createMany({
          data: body.benefits.map((b: { type: string; description: string; value?: string }) => ({
            ...b,
            opportunityId: id,
          })),
        });
      }
    }

    // Handle Pinecone indexing
    if (opportunity.status === "ACTIVE") {
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
      }).catch((err) => console.error("Failed to update Pinecone:", err));
    } else if (isUnpublishing) {
      deleteOpportunityVector(id).catch((err) => console.error("Failed to delete from Pinecone:", err));
    }

    return jsonResponse(successResponse(opportunity));
  } catch (error) {
    console.error("Error updating opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to update opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// DELETE - Soft delete opportunity
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!opportunity) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Opportunity not found"),
        StatusCodes.NOT_FOUND
      );
    }

    // Soft delete
    await prisma.opportunity.update({
      where: { id },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
      },
    });

    // Remove from Pinecone
    if (opportunity.status === "ACTIVE") {
      deleteOpportunityVector(id).catch((err) => console.error("Failed to delete from Pinecone:", err));
    }

    return jsonResponse(successResponse({ deleted: true }));
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to delete opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
