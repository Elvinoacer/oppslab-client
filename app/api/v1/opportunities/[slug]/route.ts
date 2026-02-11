// =============================================================================
// GET /api/v1/opportunities/[slug] - Get single opportunity
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    // Fetch opportunity with all related data
    const opportunity = await prisma.opportunity.findUnique({
      where: { 
        slug,
        deletedAt: null,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        eligibilityCriteria: true,
        benefits: true,
        requiredMaterials: true,
        timelineEvents: {
          orderBy: { eventDate: "asc" },
        },
        contacts: true,
        curatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!opportunity) {
      return jsonResponse(
        errorResponse("NOT_FOUND", `Opportunity with slug "${slug}" not found`),
        StatusCodes.NOT_FOUND
      );
    }

    // Check if opportunity is accessible
    if (opportunity.status !== "ACTIVE" && opportunity.status !== "EXPIRING_SOON") {
      return jsonResponse(
        errorResponse("NOT_FOUND", "This opportunity is not currently available"),
        StatusCodes.NOT_FOUND
      );
    }

    // Increment view count asynchronously (fire and forget)
    prisma.opportunity.update({
      where: { id: opportunity.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    }).catch((err) => console.error("Failed to update view count:", err));

    // Fetch related opportunities (same category + location)
    const relatedOpportunities = await prisma.opportunity.findMany({
      where: {
        id: { not: opportunity.id },
        status: "ACTIVE",
        deletedAt: null,
        OR: [
          { primaryCategory: opportunity.primaryCategory },
          { locationCountry: opportunity.locationCountry },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        company: true,
        shortDescription: true,
        primaryCategory: true,
        locationCity: true,
        locationCountry: true,
        deadline: true,
        isRemote: true,
      },
    });

    // Check user status (saved/applied)
    let userStatus = null;
    const { auth } = await import("@/auth");
    const session = await auth();
    
    if (session?.user?.id) {
      const savedOpp = await prisma.savedOpportunity.findUnique({
        where: {
          userId_opportunityId: {
            userId: session.user.id,
            opportunityId: opportunity.id,
          },
        },
        select: {
          status: true,
          feedback: true,
        },
      });
      userStatus = savedOpp;
    }

    // Transform tags and categories structure
    const transformedOpportunity = {
      ...opportunity,
      tags: opportunity.tags.map((t) => t.tag),
      categories: opportunity.categories.map((c) => ({
        ...c.category,
        isPrimary: c.isPrimary,
      })),
      related: relatedOpportunities,
      // User specific data
      applicationStatus: userStatus?.status || null,
      userFeedback: userStatus?.feedback || null,
      isSaved: !!userStatus,
    };

    return jsonResponse(successResponse(transformedOpportunity));
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
