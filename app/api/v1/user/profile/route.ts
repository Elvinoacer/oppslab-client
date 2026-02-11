// =============================================================================
// /api/v1/user/profile - User profile management
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
 * PUT /api/v1/user/profile - Update user profile information
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to update your profile"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { name, bio, location, richProfile } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        bio: bio !== undefined ? bio : undefined,
        location: location !== undefined ? location : undefined,
        richProfile: richProfile !== undefined ? richProfile : undefined,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        location: true,
        email: true,
        skills: true,
        richProfile: true,
      }
    });

    return jsonResponse(successResponse(updatedUser));
  } catch (error) {
    console.error("Error updating user profile:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to update user profile"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * GET /api/v1/user/profile - Get user profile information
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in to view your profile"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        bio: true,
        location: true,
        email: true,
        skills: true,
        richProfile: true,
      }
    });

    if (!user) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "User not found"),
        StatusCodes.NOT_FOUND
      );
    }

    return jsonResponse(successResponse(user));
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch user profile"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
