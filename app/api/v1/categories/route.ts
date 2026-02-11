// =============================================================================
// GET /api/v1/categories - List categories with hierarchy
// =============================================================================

import { prisma } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

// Category with children for tree structure
type CategoryWithChildren = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  level: number;
  sortOrder: number;
  opportunityCount: number;
  children: CategoryWithChildren[];
};

export async function GET() {
  try {
    // Fetch all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        level: true,
        sortOrder: true,
        opportunityCount: true,
        parentId: true,
      },
    });

    // Build tree structure
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create all nodes
    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        level: cat.level,
        sortOrder: cat.sortOrder,
        opportunityCount: cat.opportunityCount,
        children: [],
      });
    }

    // Second pass: build tree
    for (const cat of categories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        rootCategories.push(node);
      }
    }

    return jsonResponse(successResponse(rootCategories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch categories"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
