// =============================================================================
// GET /api/v1/admin/vector-stats - Pinecone Vector Statistics
// =============================================================================

import { auth } from "@/auth";
import { getIndexStats, clearOpportunitiesNamespace } from "@/lib/pinecone/operations";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";

export async function GET() {
  try {
    const session = await auth();

    // Protected route: Require ADMIN role
    if (!session || session.user?.role !== "ADMIN") {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin access required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    // Fetch stats from Pinecone
    const stats = await getIndexStats();

    return jsonResponse(successResponse(stats), StatusCodes.OK);
  } catch (error) {
    console.error("Error fetching Pinecone stats:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch vector statistics"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    // Protected route: Require ADMIN role
    if (!session || session.user?.role !== "ADMIN") {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin access required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    // Clear vectors from Pinecone
    await clearOpportunitiesNamespace();

    return jsonResponse(
      successResponse({ message: "Vector index cleared successfully" }),
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error clearing Pinecone index:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to clear vector index"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
