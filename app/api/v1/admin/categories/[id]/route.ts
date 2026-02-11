// =============================================================================
// Admin Category by ID API
// GET - Get single category
// PUT - Update category
// DELETE - Delete category
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

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET - Get single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
      },
    });

    if (!category) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Category not found"),
        StatusCodes.NOT_FOUND
      );
    }

    return jsonResponse(successResponse(category));
  } catch (error) {
    console.error("Error fetching category:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch category"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Category not found"),
        StatusCodes.NOT_FOUND
      );
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        color: body.color,
        imageUrl: body.imageUrl,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
        parentId: body.parentId === "" ? null : body.parentId,
      },
    });

    return jsonResponse(successResponse(category));
  } catch (error) {
    console.error("Error updating category:", error);
    
    // Handle unique constraint violation for slug
    if ((error as any).code === 'P2002') {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "A category with this slug already exists"),
        StatusCodes.BAD_REQUEST
      );
    }

    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to update category"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;

    // Check if category has children or opportunities
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            children: true,
            opportunities: true,
          }
        }
      }
    });

    if (!category) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Category not found"),
        StatusCodes.NOT_FOUND
      );
    }

    if (category._count.children > 0) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Cannot delete category with subcategories"),
        StatusCodes.BAD_REQUEST
      );
    }

    if (category._count.opportunities > 0) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Cannot delete category with assigned opportunities"),
        StatusCodes.BAD_REQUEST
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return jsonResponse(successResponse({ success: true }));
  } catch (error) {
    console.error("Error deleting category:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to delete category"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
