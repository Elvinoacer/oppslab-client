// =============================================================================
// /api/v1/user/saved-opportunities - User's saved opportunities
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
  successResponse,
  errorResponse,
  createPagination,
  parsePagination,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

/**
 * GET /api/v1/user/saved-opportunities - List user's saved opportunities
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to view saved opportunities"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const [saved, totalCount] = await Promise.all([
      prisma.savedOpportunity.findMany({
        where: { userId: session.user.id },
        skip,
        take,
        orderBy: { savedAt: "desc" },
        include: {
          opportunity: {
            select: {
              id: true,
              slug: true,
              title: true,
              company: true,
              primaryCategory: true,
              deadline: true,
              compensationMin: true,
              compensationMax: true,
              compensationCurrency: true,
              isRemote: true,
              locationCity: true,
              locationCountry: true,
            }
          }
        },
      }),
      prisma.savedOpportunity.count({ where: { userId: session.user.id } }),
    ]);

    return jsonResponse(
      successResponse({
        data: saved,
        meta: createPagination(page, pageSize, totalCount),
      })
    );
  } catch (error) {
    console.error("Error fetching saved opportunities:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch saved opportunities"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/v1/user/saved-opportunities - Save an opportunity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to save opportunities"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { opportunityId, notes } = body;

    if (!opportunityId) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Opportunity ID is required"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Check if already saved
    const existing = await prisma.savedOpportunity.findFirst({
      where: {
        userId: session.user.id,
        opportunityId: opportunityId,
      },
    });

    if (existing) {
      return jsonResponse(
        successResponse({ data: existing }),
        StatusCodes.OK
      );
    }

    // Create new record
    const saved = await prisma.savedOpportunity.create({
      data: {
        userId: session.user.id,
        opportunityId,
        notes,
      },
    });

    return jsonResponse(
      successResponse({ data: saved }),
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error("Error saving opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to save opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
