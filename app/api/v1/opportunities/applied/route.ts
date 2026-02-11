import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jsonResponse, successResponse, errorResponse, StatusCodes } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(errorResponse("UNAUTHORIZED", "Please sign in to view applications"), StatusCodes.UNAUTHORIZED);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const [applications, totalCount] = await Promise.all([
      prisma.savedOpportunity.findMany({
        where: {
          userId: session.user.id,
          status: {
            in: [
              "APPLYING",
              "APPLIED",
              "PHONE_SCREEN",
              "INTERVIEWING",
              "ASSESSMENT",
              "FINAL_ROUND",
              "OFFER_RECEIVED",
              "ACCEPTED",
              "REJECTED",
              "WITHDRAWN",
            ]
          }
        },
        include: {
          opportunity: {
            select: {
              id: true,
              slug: true,
              title: true,
              company: true,
              coverImage: true,
              primaryCategory: true,
              deadline: true,
              locationCity: true,
              locationCountry: true,
              isRemote: true,
              compensationMin: true,
              compensationMax: true,
              compensationCurrency: true,
              experienceLevel: true,
              createdAt: true,
              publishedAt: true,
              skillsRequired: true,
              viewCount: true,
              tags: {
                select: {
                  tag: true
                }
              }
            }
          }
        },
        orderBy: {
          statusUpdatedAt: "desc"
        },
        skip,
        take: pageSize,
      }),
      prisma.savedOpportunity.count({
        where: {
          userId: session.user.id,
          status: {
            in: [
              "APPLYING",
              "APPLIED",
              "PHONE_SCREEN",
              "INTERVIEWING",
              "ASSESSMENT",
              "FINAL_ROUND",
              "OFFER_RECEIVED",
              "ACCEPTED",
              "REJECTED",
              "WITHDRAWN",
            ]
          }
        }
      })
    ]);

    const { createPagination } = await import("@/lib/api");
    return jsonResponse(successResponse({ 
      data: applications,
      meta: createPagination(page, pageSize, totalCount)
    }), StatusCodes.OK);

  } catch (error) {
    console.error("Error fetching applications:", error);
    return jsonResponse(errorResponse("INTERNAL_ERROR", "Failed to fetch applications"), StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
