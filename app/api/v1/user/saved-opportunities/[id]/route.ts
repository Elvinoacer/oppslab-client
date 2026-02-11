// =============================================================================
// /api/v1/user/saved-opportunities/[id] - Manage single saved opportunity
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

/**
 * PUT /api/v1/user/saved-opportunities/[id] - Update notes/status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to manage saved opportunities"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { notes, applicationStatus } = body;

    // Verify ownership
    const existing = await prisma.savedOpportunity.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Saved opportunity not found"),
        StatusCodes.NOT_FOUND
      );
    }

    // Map frontend status to Prisma enum if needed
    let prismaStatus = undefined;
    if (applicationStatus) {
      // Very basic mapping for now, should ideally be robust
      const mapping: Record<string, string> = {
        "NOT_STARTED": "SAVED",
        "IN_PROGRESS": "APPLYING",
        "APPLIED": "APPLIED",
        "REJECTED": "REJECTED",
        "ACCEPTED": "ACCEPTED"
      };
      prismaStatus = mapping[applicationStatus] || applicationStatus;
    }

    const updated = await prisma.savedOpportunity.update({
      where: { id },
      data: {
        notes: notes !== undefined ? notes : undefined,
        status: prismaStatus as any,
      },
    });

    return jsonResponse(successResponse({ data: updated }));
  } catch (error) {
    console.error("Error updating saved opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to update saved opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * DELETE /api/v1/user/saved-opportunities/[id] - Remove bookmark
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to manage saved opportunities"),
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verify ownership
    const existing = await prisma.savedOpportunity.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Saved opportunity not found"),
        StatusCodes.NOT_FOUND
      );
    }

    await prisma.savedOpportunity.delete({
      where: { id },
    });

    return jsonResponse(successResponse({ data: { deleted: true } }));
  } catch (error) {
    console.error("Error deleting saved opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to delete saved opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
