// =============================================================================
// /api/v1/user/resumes/[id] - Single resume operations
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/user/resumes/[id] - Get a single resume
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
      include: {
        opportunity: {
          select: { id: true, title: true, company: true, description: true, skillsRequired: true, experienceLevel: true },
        },
      },
    });

    if (!resume) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Resume not found"),
        StatusCodes.NOT_FOUND
      );
    }

    return jsonResponse(successResponse(resume));
  } catch (error) {
    console.error("Error fetching resume:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch resume"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PUT /api/v1/user/resumes/[id] - Update a resume
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, template, data } = body;

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Resume not found"),
        StatusCodes.NOT_FOUND
      );
    }

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        template: template !== undefined ? template : undefined,
        data: data !== undefined ? data : undefined,
      },
      include: {
        opportunity: {
          select: { id: true, title: true, company: true },
        },
      },
    });

    return jsonResponse(successResponse(updatedResume));
  } catch (error) {
    console.error("Error updating resume:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to update resume"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * DELETE /api/v1/user/resumes/[id] - Delete a resume
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const { id } = await params;
    const existing = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "Resume not found"),
        StatusCodes.NOT_FOUND
      );
    }

    await prisma.resume.delete({ where: { id } });
    return jsonResponse(successResponse({ deleted: true }));
  } catch (error) {
    console.error("Error deleting resume:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to delete resume"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
