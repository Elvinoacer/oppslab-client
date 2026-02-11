// =============================================================================
// POST /api/v1/search - Advanced search with hybrid capabilities
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { searchOpportunities as vectorSearch } from "@/lib/pinecone";
import {
  successResponse,
  errorResponse,
  createPagination,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";
import { Prisma } from "../../../../src/generated/prisma/client";

// Search request body type
type SearchRequest = {
  query: string;
  filters?: {
    category?: string | string[];
    industry?: string | string[];
    roleType?: string | string[];
    experienceLevel?: string | string[];
    workMode?: string | string[];
    isRemote?: boolean;
    locationCountry?: string | string[];
    locationCity?: string;
    deadlineAfter?: string;
    deadlineBefore?: string;
    tags?: string[];
    skills?: string[];
  };
  searchMode?: "text" | "semantic" | "hybrid";
  page?: number;
  pageSize?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SearchRequest;
    
    let {
      query,
      filters = {},
      searchMode = "hybrid",
      page = 1,
      pageSize = 20,
    } = body;

    if (!query || query.trim().length === 0) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Query is required"),
        StatusCodes.BAD_REQUEST
      );
    }

    const skip = (page - 1) * pageSize;
    const take = Math.min(pageSize, 50);

    // Build Prisma where clause for filters
    const buildWhereClause = (): Prisma.OpportunityWhereInput => {
      const where: Prisma.OpportunityWhereInput = {
        status: "ACTIVE",
        deletedAt: null,
      };

      if (filters.category) {
        where.primaryCategory = Array.isArray(filters.category)
          ? { in: filters.category as any }
          : filters.category as any;
      }

      if (filters.industry) {
        where.industry = Array.isArray(filters.industry)
          ? { in: filters.industry as any }
          : filters.industry as any;
      }

      if (filters.roleType) {
        where.roleType = Array.isArray(filters.roleType)
          ? { in: filters.roleType as any }
          : filters.roleType as any;
      }

      if (filters.experienceLevel) {
        where.experienceLevel = Array.isArray(filters.experienceLevel)
          ? { in: filters.experienceLevel as any }
          : filters.experienceLevel as any;
      }

      if (filters.workMode) {
        where.workMode = Array.isArray(filters.workMode)
          ? { in: filters.workMode as any }
          : filters.workMode as any;
      }

      if (filters.isRemote !== undefined) {
        where.isRemote = filters.isRemote;
      }

      if (filters.locationCountry) {
        where.locationCountry = Array.isArray(filters.locationCountry)
          ? { in: filters.locationCountry }
          : filters.locationCountry;
      }

      if (filters.locationCity) {
        where.locationCity = { contains: filters.locationCity, mode: "insensitive" };
      }

      if (filters.deadlineAfter) {
        where.deadline = { ...where.deadline as object, gte: new Date(filters.deadlineAfter) };
      }

      if (filters.deadlineBefore) {
        where.deadline = { ...where.deadline as object, lte: new Date(filters.deadlineBefore) };
      }

      if (filters.tags?.length) {
        where.tags = {
          some: {
            tag: { slug: { in: filters.tags } },
          },
        };
      }

      if (filters.skills?.length) {
        where.skillsRequired = { hasSome: filters.skills };
      }

      return where;
    };

    let results: { id: string; score?: number }[] = [];
    let totalCount = 0;

    // Execute search based on mode
    if (searchMode === "semantic" || searchMode === "hybrid") {
      // Vector search
      try {
        const vectorResults = await vectorSearch(query, {
          topK: take * 2, // Get more for hybrid merging
          filter: filters.category
            ? { primaryCategory: Array.isArray(filters.category) ? { $in: filters.category } : filters.category }
            : undefined,
        });
        
        results = vectorResults.map((r) => ({ id: r.id, score: r.score }));
        totalCount = vectorResults.length;
      } catch (err) {
        console.warn("Vector search unavailable, using text search fallback.");
        // Fallback to text search if vector search fails
        searchMode = "text"; 
      }
    }

    if (searchMode === "text" || searchMode === "hybrid") {
      // Database text search
      const where = buildWhereClause();
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
      ];

      const textResults = await prisma.opportunity.findMany({
        where,
        select: { id: true },
        take: take * 2,
      });

      if (searchMode === "hybrid") {
        // Merge results: combine scores, deduplicate
        const idScoreMap = new Map(results.map((r) => [r.id, r.score || 0.5]));
        
        for (const tr of textResults) {
          if (idScoreMap.has(tr.id)) {
            // Boost score for items found in both
            idScoreMap.set(tr.id, (idScoreMap.get(tr.id) || 0) + 0.3);
          } else {
            idScoreMap.set(tr.id, 0.4);
          }
        }

        results = Array.from(idScoreMap.entries())
          .map(([id, score]) => ({ id, score }))
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        
        totalCount = results.length;
      } else {
        results = textResults.map((r) => ({ id: r.id }));
        totalCount = await prisma.opportunity.count({ where });
      }
    }

    // Get paginated IDs
    const paginatedIds = results.slice(skip, skip + take).map((r) => r.id);

    // Fetch full opportunity data
    const opportunities = await prisma.opportunity.findMany({
      where: { id: { in: paginatedIds } },
      select: {
        id: true,
        slug: true,
        title: true,
        company: true,
        shortDescription: true,
        description: true,
        primaryCategory: true,
        industry: true,
        roleType: true,
        experienceLevel: true,
        isRemote: true,
        locationCity: true,
        locationCountry: true,
        deadline: true,
        compensationType: true,
        compensationMin: true,
        compensationMax: true,
        compensationCurrency: true,
        skillsRequired: true,
        createdAt: true,
        tags: {
          select: {
            tag: {
              select: { name: true, slug: true, color: true },
            },
          },
        },
      },
    });

    // Reorder by score and add highlight snippets
    const scoreMap = new Map(results.map((r) => [r.id, r.score || 0]));
    const orderedResults = paginatedIds
      .map((id) => {
        const opp = opportunities.find((o) => o.id === id);
        if (!opp) return null;
        
        // Simple highlight: find query in description
        const queryLower = query.toLowerCase();
        const descLower = opp.description.toLowerCase();
        const matchIndex = descLower.indexOf(queryLower);
        let highlight = "";
        
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(opp.description.length, matchIndex + query.length + 100);
          highlight = (start > 0 ? "..." : "") +
            opp.description.slice(start, end).replace(
              new RegExp(`(${query})`, "gi"),
              "<mark>$1</mark>"
            ) +
            (end < opp.description.length ? "..." : "");
        }

        return {
          ...opp,
          tags: opp.tags.map((t) => t.tag),
          relevanceScore: scoreMap.get(id) || 0,
          highlight,
        };
      })
      .filter(Boolean);

    // Log search for analytics (fire and forget)
    prisma.searchQuery.create({
      data: {
        query,
        filters: filters as Prisma.JsonObject,
        resultsCount: totalCount,
      },
    }).catch((err) => console.error("Failed to log search:", err));

    return jsonResponse(
      successResponse({
        results: orderedResults,
        searchMode,
        query,
        meta: createPagination(page, take, totalCount),
      })
    );
  } catch (error) {
    console.error("Search error:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Search failed"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
