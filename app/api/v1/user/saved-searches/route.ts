// =============================================================================
// /api/v1/user/saved-searches - User's saved searches
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
 * GET /api/v1/user/saved-searches - List user's saved searches
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to view saved searches"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return jsonResponse(successResponse({ data: savedSearches }));
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch saved searches"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/v1/user/saved-searches - Save a search
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to save searches"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { name, query, filters } = body;

    if (!name) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Search name is required"),
        StatusCodes.BAD_REQUEST
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        query,
        filters: filters || {},
      },
    });

    return jsonResponse(
      successResponse({ data: savedSearch }),
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error("Error saving search:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to save search"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
