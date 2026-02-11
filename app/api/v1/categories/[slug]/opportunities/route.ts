// =============================================================================
// GET /api/v1/categories/[slug]/opportunities - Get opportunities by category
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  createPagination,
  parsePagination,
  parseSort,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

const SORT_FIELDS = ["createdAt", "deadline", "title", "company", "viewCount"];

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Find category
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!category) {
      return jsonResponse(
        errorResponse("NOT_FOUND", `Category "${slug}" not found`),
        StatusCodes.NOT_FOUND
      );
    }

    // Parse pagination and sorting
    const { page, pageSize, skip, take } = parsePagination(searchParams);
    const { field: sortField, order: sortOrder } = parseSort(searchParams, SORT_FIELDS);

    // Get all child category IDs for recursive search
    const categoryIds = [category.id];
    if (searchParams.get("includeChildren") === "true") {
      const getAllChildIds = async (parentId: string): Promise<string[]> => {
        const children = await prisma.category.findMany({
          where: { parentId, isActive: true },
          select: { id: true },
        });
        const childIds = children.map((c) => c.id);
        const grandchildIds = await Promise.all(childIds.map(getAllChildIds));
        return [...childIds, ...grandchildIds.flat()];
      };
      categoryIds.push(...(await getAllChildIds(category.id)));
    }

    // Build where clause
    const where = {
      status: "ACTIVE" as const,
      deletedAt: null,
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    };

    // Execute queries
    const [opportunities, totalCount] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          slug: true,
          title: true,
          company: true,
          shortDescription: true,
          primaryCategory: true,
          industry: true,
          isRemote: true,
          locationCity: true,
          locationCountry: true,
          deadline: true,
          compensationType: true,
          compensationMin: true,
          compensationMax: true,
          compensationCurrency: true,
          viewCount: true,
          createdAt: true,
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return jsonResponse(
      successResponse({
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          subcategories: category.children,
        },
        opportunities,
        meta: createPagination(page, pageSize, totalCount),
      })
    );
  } catch (error) {
    console.error("Error fetching category opportunities:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch category opportunities"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
