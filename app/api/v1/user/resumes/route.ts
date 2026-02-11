// =============================================================================
// /api/v1/user/resumes - Resume list & creation
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
 * GET /api/v1/user/resumes - List all user resumes
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to view your resumes"),
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verify user exists in DB (catches stale sessions after DB resets)
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Session invalid or user not found. Please log out and back in."),
        StatusCodes.UNAUTHORIZED
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        opportunity: {
          select: { id: true, title: true, company: true },
        },
      },
    });

    return jsonResponse(successResponse(resumes));
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch resumes"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/v1/user/resumes - Create a new resume
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to create a resume"),
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verify user exists in DB
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Session invalid or user not found. Please log out and back in."),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { title, template, data, opportunityId } = body;

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: title || "Untitled Resume",
        template: template || "modern",
        data: data || {
          personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" },
          summary: "",
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: [],
        },
        opportunityId: opportunityId || null,
      },
      include: {
        opportunity: {
          select: { id: true, title: true, company: true },
        },
      },
    });

    return jsonResponse(successResponse(resume), StatusCodes.CREATED);
  } catch (error) {
    console.error("Error creating resume:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to create resume"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
