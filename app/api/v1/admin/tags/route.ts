// =============================================================================
// Admin Tags API
// GET - List all tags (for admin management)
// POST - Create new tag
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
import { TagCategory } from "../../../../../src/generated/prisma/enums";

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET - List all tags for admin
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
    const category = searchParams.get("category");

    const where = category ? { category: category as TagCategory } : {};

    const tags = await prisma.tag.findMany({
      where,
      orderBy: [{ category: "asc" }, { usageCount: "desc" }, { name: "asc" }],
    });

    return jsonResponse(successResponse(tags));
  } catch (error) {
    console.error("Error listing tags:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to list tags"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// POST - Create new tag
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

    if (!body.name || !body.category) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "name and category are required"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate category enum
    const validCategories = ["SKILL", "TECHNOLOGY", "BENEFIT", "PROGRAM", "INDUSTRY", "LOCATION", "ROLE", "OTHER"];
    if (!validCategories.includes(body.category)) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", `category must be one of: ${validCategories.join(", ")}`),
        StatusCodes.BAD_REQUEST
      );
    }

    const slug = body.slug || generateSlug(body.name);

    // Check for duplicate slug
    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "A tag with this slug already exists"),
        StatusCodes.BAD_REQUEST
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: body.name,
        slug,
        category: body.category,
        description: body.description,
        color: body.color,
        icon: body.icon,
      },
    });

    return jsonResponse(successResponse(tag), StatusCodes.CREATED);
  } catch (error) {
    console.error("Error creating tag:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to create tag"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
