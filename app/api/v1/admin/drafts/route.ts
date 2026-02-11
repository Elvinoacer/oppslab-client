// =============================================================================
// GET /api/v1/admin/drafts - List all draft opportunities
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/api/auth";
import {
  successResponse,
  errorResponse,
  createPagination,
  parsePagination,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where = {
      status: "DRAFT" as const,
      deletedAt: null,
    };

    const [drafts, totalCount] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          company: true,
          primaryCategory: true,
          deadline: true,
          createdAt: true,
          updatedAt: true,
          curatedBy: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return jsonResponse(
      successResponse(drafts, createPagination(page, pageSize, totalCount))
    );
  } catch (error) {
    console.error("Error listing drafts:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to list drafts"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
