// =============================================================================
// GET /api/v1/tags - List all tags with usage counts
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "../../../../src/generated/prisma/client";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query params
    const category = searchParams.get("category");
    const minUsage = parseInt(searchParams.get("minUsage") || "0", 10);
    const sortBy = searchParams.get("sortBy") || "usageCount"; // usageCount | name | createdAt
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "100", 10));

    // Build where clause
    const where: Prisma.TagWhereInput = {};
    
    if (category) {
      where.category = category as any;
    }
    
    if (minUsage > 0) {
      where.usageCount = { gte: minUsage };
    }

    // Validate sortBy
    const validSortFields = ["usageCount", "name", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "usageCount";

    // Fetch tags
    const tags = await prisma.tag.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        usageCount: true,
        color: true,
        icon: true,
      },
    });

    // Group by category if requested
    const groupByCategory = searchParams.get("groupBy") === "category";
    
    if (groupByCategory) {
      const grouped = tags.reduce((acc, tag) => {
        const cat = tag.category;
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(tag);
        return acc;
      }, {} as Record<string, typeof tags>);
      
      return jsonResponse(successResponse(grouped));
    }

    return jsonResponse(successResponse(tags));
  } catch (error) {
    console.error("Error fetching tags:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch tags"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
