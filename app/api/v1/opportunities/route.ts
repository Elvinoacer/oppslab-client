// =============================================================================
// GET /api/v1/opportunities - List opportunities with filtering
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
import {
  Prisma,
  OpportunityCategory,
  Industry,
  RoleType,
  ExperienceLevel,
  WorkMode,
} from "../../../../src/generated/prisma/client";
import { getCategoryCoverImage } from "@/lib/images";

// Allowed sort fields
const SORT_FIELDS = [
  "createdAt",
  "deadline",
  "title",
  "company",
  "viewCount",
  "publishedAt",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination
    const { page, pageSize, skip, take } = parsePagination(searchParams);
    
    // Parse sorting
    const { field: sortField, order: sortOrder } = parseSort(
      searchParams,
      SORT_FIELDS,
      "createdAt",
      "desc"
    );

    // Build where clause
    const where: Prisma.OpportunityWhereInput = {
      status: "ACTIVE",
      deletedAt: null,
    };

    // Category filter
    const category = searchParams.get("category");
    if (category) {
      if (Object.values(OpportunityCategory).includes(category as OpportunityCategory)) {
        where.primaryCategory = category as OpportunityCategory;
      } else {
        return jsonResponse(successResponse({ data: [], meta: createPagination(page, pageSize, 0) }));
      }
    }

    // Industry filter
    const industry = searchParams.get("industry");
    if (industry) {
      if (Object.values(Industry).includes(industry as Industry)) {
        where.industry = industry as Industry;
      } else {
        return jsonResponse(successResponse({ data: [], meta: createPagination(page, pageSize, 0) }));
      }
    }

    // Role type filter
    const roleType = searchParams.get("roleType");
    if (roleType) {
      if (Object.values(RoleType).includes(roleType as RoleType)) {
        where.roleType = roleType as RoleType;
      } else {
        return jsonResponse(successResponse({ data: [], meta: createPagination(page, pageSize, 0) }));
      }
    }

    // Experience level filter
    const experienceLevel = searchParams.get("experienceLevel");
    if (experienceLevel) {
      if (Object.values(ExperienceLevel).includes(experienceLevel as ExperienceLevel)) {
        where.experienceLevel = experienceLevel as ExperienceLevel;
      } else {
        return jsonResponse(successResponse({ data: [], meta: createPagination(page, pageSize, 0) }));
      }
    }

    // Work mode filter
    const workMode = searchParams.get("workMode");
    if (workMode) {
      if (Object.values(WorkMode).includes(workMode as WorkMode)) {
        where.workMode = workMode as WorkMode;
      } else {
        return jsonResponse(successResponse({ data: [], meta: createPagination(page, pageSize, 0) }));
      }
    }

    // Remote filter
    const isRemote = searchParams.get("isRemote");
    if (isRemote !== null) {
      where.isRemote = isRemote === "true";
    }

    // Location filters
    const locationCountry = searchParams.get("locationCountry");
    if (locationCountry) {
      where.locationCountry = locationCountry;
    }

    const locationCity = searchParams.get("locationCity");
    if (locationCity) {
      where.locationCity = { contains: locationCity, mode: "insensitive" };
    }

    // Date filters
    const deadlineAfter = searchParams.get("deadlineAfter");
    if (deadlineAfter) {
      where.deadline = { ...where.deadline as object, gte: new Date(deadlineAfter) };
    }

    const deadlineBefore = searchParams.get("deadlineBefore");
    if (deadlineBefore) {
      where.deadline = { ...where.deadline as object, lte: new Date(deadlineBefore) };
    }

    // Tags filter (comma-separated)
    const tags = searchParams.get("tags");
    if (tags) {
      const tagSlugs = tags.split(",").map((t) => t.trim());
      where.tags = {
        some: {
          tag: {
            slug: { in: tagSlugs },
          },
        },
      };
    }

    // Skills filter (comma-separated)
    const skills = searchParams.get("skills");
    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim());
      where.skillsRequired = { hasSome: skillList };
    }

    // Basic text search (q parameter)
    const q = searchParams.get("q");
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Exclude applied opportunities (Phase 1)
    const excludeApplied = searchParams.get("excludeApplied") === "true";
    if (excludeApplied) {
      const { auth } = await import("@/auth");
      const session = await auth();
      if (session?.user?.id) {
        where.savedBy = {
          none: {
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
              ],
            },
          },
        };
      }
    }

    // Personalization Logic
    const personalized = searchParams.get("personalized") === "true";
    let userSkills: string[] = [];
    let matchScores: Record<string, number> = {};

    if (personalized) {
      const { auth } = await import("@/auth");
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { skills: true },
        });
        if (user?.skills && user.skills.length > 0) {
          userSkills = user.skills;
          // Filter to opportunities that have at least one matching skill
          // Only apply this strictly if no other skill filters are present to avoid conflict
          if (!where.skillsRequired) {
            where.skillsRequired = { hasSome: userSkills };
          }
        }
      }
    }

    // For personalization, we might need to fetch more items to sort them by relevance
    // If personalized, we fetch 'take' * 5 candidates to rank, passing the top results
    const fetchTake = personalized && userSkills.length > 0 ? take * 5 : take;

    // Execute queries in parallel
    const [opportunities, totalCount] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: fetchTake,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          slug: true,
          title: true,
          company: true,
          shortDescription: true,
          coverImage: true,
          primaryCategory: true,
          industry: true,
          roleType: true,
          experienceLevel: true,
          workMode: true,
          isRemote: true,
          locationCity: true,
          locationCountry: true,
          deadline: true,
          compensationType: true,
          compensationMin: true,
          compensationMax: true,
          compensationCurrency: true,
          compensationPeriod: true,
          skillsRequired: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
            take: 3, // Limit tags for valid opportunities
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    // Processing Results
    // We map to 'any' temporarily to bypass weird Prisma inference issues if they persist, 
    // but ideally we rely on the select type. 
    // The previous error suggested 'opportunities' was inferred as the Full Model which is odd.
    let processedOpportunities = (opportunities as any[]).map((opp) => ({
      ...opp,
      tags: opp.tags.map((t: any) => t.tag), // Flatten tags
      coverImage: opp.coverImage || getCategoryCoverImage(opp.primaryCategory, opp.id),
      matchScore: 0, // Default Match Score
    }));

    // Calculate Match Scores if Personalized
    if (personalized && userSkills.length > 0) {
      processedOpportunities = processedOpportunities.map((opp) => {
        const oppSkills: string[] = opp.skillsRequired || [];
        // Jaccard Index: Intersection / Union
        const intersection = oppSkills.filter((s) => userSkills.includes(s));
        const union = new Set([...oppSkills, ...userSkills]);
        
        let score = 0;
        if (union.size > 0) {
           score = Math.round((intersection.length / union.size) * 100);
        }
        
        return { ...opp, matchScore: score };
      });

      // Sort by Match Score Descending
      processedOpportunities.sort((a, b) => b.matchScore - a.matchScore);
      
      // Slice to original page size since we fetched more
      processedOpportunities = processedOpportunities.slice(0, take);
    }

    return jsonResponse(
      successResponse({
        data: processedOpportunities,
        meta: createPagination(page, pageSize, totalCount),
      }),
      StatusCodes.OK,
      {
        "Cache-Control": personalized 
          ? "private, max-age=0, no-cache" // Don't cache personalized results publicly
          : "public, s-maxage=60, stale-while-revalidate=300",
      }
    );
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to fetch opportunities"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
