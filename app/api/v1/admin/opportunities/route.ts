// =============================================================================
// Admin Opportunities API
// POST - Create opportunity
// GET - List all opportunities (including drafts)
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminAuth } from "@/lib/api/auth";
import { upsertOpportunityVector } from "@/lib/pinecone";
import { triggerSocketEvent } from "@/lib/socket-server";
import {
  successResponse,
  errorResponse,
  createPagination,
  parsePagination,
  parseSort,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";
import { Prisma } from "../../../../../src/generated/prisma/client";

// Helper to generate slug
function generateSlug(title: string, company: string): string {
  const base = `${title}-${company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  
  const timestamp = Date.now().toString(36);
  return `${base}-${timestamp}`;
}

// GET - List all opportunities for admin (including drafts)
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
    const { page, pageSize, skip, take } = parsePagination(searchParams);
    const { field: sortField, order: sortOrder } = parseSort(
      searchParams,
      ["createdAt", "updatedAt", "title", "deadline", "status"],
      "createdAt",
      "desc"
    );

    // Build filters
    const where: Prisma.OpportunityWhereInput = {
      deletedAt: null,
    };

    const status = searchParams.get("status");
    if (status) {
      where.status = status as Prisma.OpportunityWhereInput["status"];
    }

    const q = searchParams.get("q");
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ];
    }

    const [opportunities, totalCount] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          slug: true,
          title: true,
          company: true,
          primaryCategory: true,
          status: true,
          deadline: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          curatedBy: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return jsonResponse(
      successResponse(opportunities, createPagination(page, pageSize, totalCount))
    );
  } catch (error) {
    console.error("Error listing opportunities:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to list opportunities"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

// POST - Create new opportunity
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

    // Required fields validation
    const requiredFields = ["title", "company", "description", "primaryCategory", "experienceLevel"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return jsonResponse(
          errorResponse("VALIDATION_ERROR", `${field} is required`),
          StatusCodes.BAD_REQUEST
        );
      }
    }

    // Generate slug
    const slug = body.slug || generateSlug(body.title, body.company);

    // Check for duplicate slug
    const existing = await prisma.opportunity.findUnique({ where: { slug } });
    if (existing) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "An opportunity with this slug already exists"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Find the category in the DB to establish relationship
    const dbCategory = await prisma.category.findUnique({
      where: { slug: body.primaryCategory }
    });

    // Safe date parsing helper
    const parseDate = (val: any) => {
      if (!val || val === "Rolling") return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Create opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        slug,
        originalMarkdown: body.originalMarkdown || body.description,
        title: body.title,
        company: body.company,
        description: body.description,
        shortDescription: body.shortDescription || body.description.slice(0, 200),
        primaryCategory: body.primaryCategory,
        industry: body.industry,
        roleType: body.roleType,
        experienceLevel: body.experienceLevel,
        workMode: body.workMode,
        isRemote: body.isRemote ?? false,
        locationCity: body.locationCity,
        locationCountry: body.locationCountry,
        locationCoordinates: body.locationCoordinates,
        coverImage: body.imageUrl || body.coverImage,
        deadline: parseDate(body.deadline),
        startDate: parseDate(body.startDate),
        endDate: parseDate(body.endDate),
        compensationType: body.compensationType,
        compensationMin: body.compensationMin,
        compensationMax: body.compensationMax,
        compensationCurrency: body.compensationCurrency || "USD",
        compensationPeriod: body.compensationPeriod,
        skillsRequired: body.skillsRequired || [],
        educationRequirements: body.educationRequirements || [],
        experienceRequired: body.experienceRequired,
        languageRequirements: body.languageRequirements || [],
        applicationUrl: body.applicationUrl,
        applicationEmail: body.applicationEmail,
        applicationInstructions: body.applicationInstructions,
        sourcePlatform: body.sourcePlatform,
        sourceUrl: body.sourceUrl,
        status: body.status || "DRAFT",
        publishedAt: body.status === "ACTIVE" ? new Date() : null,
        curatedById: user.id,
        keywords: body.keywords || [],
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        // Create related records
        categories: dbCategory ? {
          create: {
            categoryId: dbCategory.id,
            isPrimary: true
          }
        } : undefined,
        eligibilityCriteria: body.eligibilityCriteria?.length ? {
          create: body.eligibilityCriteria,
        } : undefined,
        benefits: body.benefits?.length ? {
          create: body.benefits,
        } : undefined,
        requiredMaterials: body.requiredMaterials?.length ? {
          create: body.requiredMaterials,
        } : undefined,
        timelineEvents: body.timelineEvents?.length ? {
          create: body.timelineEvents.map((e: { eventDate?: string; eventType: string; title: string; description?: string }) => ({
            ...e,
            eventDate: e.eventDate ? new Date(e.eventDate) : null,
          })),
        } : undefined,
        contacts: body.contacts?.length ? {
          create: body.contacts,
        } : undefined,
      },
      include: {
        eligibilityCriteria: true,
        benefits: true,
        requiredMaterials: true,
        timelineEvents: true,
        contacts: true,
      },
    });

    // Index in Pinecone if published
    if (opportunity.status === "ACTIVE") {
      upsertOpportunityVector({
        id: opportunity.id,
        slug: opportunity.slug,
        title: opportunity.title,
        company: opportunity.company,
        description: opportunity.description,
        shortDescription: opportunity.shortDescription,
        primaryCategory: opportunity.primaryCategory,
        industry: opportunity.industry,
        roleType: opportunity.roleType,
        experienceLevel: opportunity.experienceLevel,
        workMode: opportunity.workMode,
        isRemote: opportunity.isRemote,
        skillsRequired: opportunity.skillsRequired,
        locationCity: opportunity.locationCity,
        locationCountry: opportunity.locationCountry,
        deadline: opportunity.deadline,
        status: opportunity.status,
        compensationType: opportunity.compensationType,
      }).catch((err) => console.error("Failed to index in Pinecone:", err));
      
      // Trigger socket event for real-time updates
      triggerSocketEvent("opportunities", "opportunity.created", {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        slug: opportunity.slug,
        primaryCategory: opportunity.primaryCategory,
      }).catch((err) => console.error("Failed to trigger socket event:", err));
    }

    return jsonResponse(successResponse(opportunity), StatusCodes.CREATED);
  } catch (error) {
    console.error("Error creating opportunity:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to create opportunity"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
