// =============================================================================
// /api/v1/user/saved-searches/[id] - Manage single saved search
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
 * PUT /api/v1/user/saved-searches/[id] - Update saved search
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
        errorResponse("UNAUTHORIZED", "Please log in to manage saved searches"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { name, isActive, alertFrequency } = body;

    // Verify ownership
    const existing = await prisma.savedSearch.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Saved search not found"),
        StatusCodes.NOT_FOUND
      );
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        alertFrequency: alertFrequency !== undefined ? alertFrequency : undefined,
      },
    });

    return jsonResponse(successResponse({ data: updated }));
  } catch (error) {
    console.error("Error updating saved search:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to update saved search"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * DELETE /api/v1/user/saved-searches/[id] - Remove saved search
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
        errorResponse("UNAUTHORIZED", "Please log in to manage saved searches"),
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verify ownership
    const existing = await prisma.savedSearch.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Saved search not found"),
        StatusCodes.NOT_FOUND
      );
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return jsonResponse(successResponse({ data: { deleted: true } }));
  } catch (error) {
    console.error("Error deleting saved search:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to delete saved search"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
