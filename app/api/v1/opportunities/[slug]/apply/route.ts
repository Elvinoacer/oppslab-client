import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonResponse, successResponse, errorResponse, StatusCodes } from "@/lib/api";
import { ApplicationStatus } from "../../../../../../src/generated/prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // Params are promises in Next.js 15+ (check version, 16 is used)
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(errorResponse("UNAUTHORIZED", "Please sign in to apply"), StatusCodes.UNAUTHORIZED);
    }

    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, feedback } = body;

    // We need to resolve the ID from the slug
    const opportunity = await prisma.opportunity.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!opportunity) {
      return jsonResponse(errorResponse("NOT_FOUND", "Opportunity not found"), StatusCodes.NOT_FOUND);
    }

    const opportunityId = opportunity.id;

    // Default status to APPLIED if not provided
    const newStatus = status as ApplicationStatus || "APPLIED";

    const savedOpportunity = await prisma.savedOpportunity.upsert({
      where: {
        userId_opportunityId: {
          userId: session.user.id,
          opportunityId: opportunityId
        }
      },
      create: {
        userId: session.user.id,
        opportunityId: opportunityId,
        status: newStatus,
        feedback: feedback,
        statusUpdatedAt: new Date()
      },
      update: {
        status: newStatus,
        feedback: feedback !== undefined ? feedback : undefined,
        statusUpdatedAt: new Date()
      }
    });

    return jsonResponse(successResponse({ data: savedOpportunity }), StatusCodes.OK);

  } catch (error) {
    console.error("Error marking as applied:", error);
    return jsonResponse(errorResponse("INTERNAL_ERROR", "Failed to update application status"), StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
