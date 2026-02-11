// =============================================================================
// Admin Categories API
// GET - List all categories (for admin management)
// POST - Create new category
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/api/auth";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET - List all categories for admin
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { children: true } },
      },
    });

    return jsonResponse(successResponse(categories));
  } catch (error) {
    console.error("Error listing categories:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to list categories"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();

    if (!body.name) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "name is required"),
        StatusCodes.BAD_REQUEST
      );
    }

    const slug = body.slug || generateSlug(body.name);

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "A category with this slug already exists"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Calculate level based on parent
    let level = 0;
    if (body.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: body.parentId },
        select: { level: true },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    // Get max sort order for this level/parent
    const maxSortOrder = await prisma.category.aggregate({
      where: { parentId: body.parentId || null },
      _max: { sortOrder: true },
    });

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        icon: body.icon,
        color: body.color,
        imageUrl: body.imageUrl,
        level,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
        isActive: body.isActive ?? true,
        parentId: body.parentId,
      },
    });

    return jsonResponse(successResponse(category), StatusCodes.CREATED);
  } catch (error) {
    console.error("Error creating category:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to create category"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
