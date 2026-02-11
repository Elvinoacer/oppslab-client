// =============================================================================
// Zod Validation Schemas for API Requests
// =============================================================================

import { z } from "zod";

// =============================================================================
// Common Schemas
// =============================================================================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// =============================================================================
// Opportunity Schemas
// =============================================================================

// Category enum (matches Prisma)
export const CategoryEnum = z.enum([
  "SCHOLARSHIP",
  "GRANT",
  "FELLOWSHIP",
  "INTERNSHIP",
  "JOB",
  "COMPETITION",
  "CONFERENCE",
  "WORKSHOP",
  "COURSE",
  "ACCELERATOR",
  "INCUBATOR",
  "FUNDING",
  "MENTORSHIP",
  "VOLUNTEER",
  "RESEARCH",
  "AWARD",
  "OTHER",
]);

export const IndustryEnum = z.enum([
  "TECHNOLOGY",
  "HEALTHCARE",
  "FINANCE",
  "EDUCATION",
  "GOVERNMENT",
  "NONPROFIT",
  "MEDIA",
  "RETAIL",
  "MANUFACTURING",
  "ENERGY",
  "AGRICULTURE",
  "TRANSPORTATION",
  "REAL_ESTATE",
  "HOSPITALITY",
  "PROFESSIONAL_SERVICES",
  "OTHER",
]);

export const ExperienceLevelEnum = z.enum([
  "ENTRY",
  "JUNIOR",
  "MID",
  "SENIOR",
  "EXECUTIVE",
  "STUDENT",
  "ANY",
]);

export const WorkModeEnum = z.enum(["REMOTE", "HYBRID", "ONSITE"]);

export const CompensationTypeEnum = z.enum([
  "PAID",
  "UNPAID",
  "STIPEND",
  "GRANT",
  "VARIABLE",
]);

export const StatusEnum = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "ACTIVE",
  "EXPIRING_SOON",
  "EXPIRED",
  "ARCHIVED",
  "DELETED",
]);

// Filter schema for GET /api/v1/opportunities
export const OpportunityFiltersSchema = z.object({
  category: CategoryEnum.optional(),
  industry: IndustryEnum.optional(),
  roleType: z.string().optional(),
  experienceLevel: ExperienceLevelEnum.optional(),
  workMode: WorkModeEnum.optional(),
  isRemote: z.coerce.boolean().optional(),
  locationCity: z.string().optional(),
  locationCountry: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  skills: z.string().optional(), // comma-separated
  deadlineAfter: z.string().datetime().optional(),
  deadlineBefore: z.string().datetime().optional(),
  q: z.string().max(200).optional(),
}).merge(PaginationSchema).merge(SortSchema);

// Create opportunity schema
export const CreateOpportunitySchema = z.object({
  title: z.string().min(1).max(500),
  company: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  primaryCategory: CategoryEnum,
  industry: IndustryEnum.optional(),
  roleType: z.string().max(100).optional(),
  experienceLevel: ExperienceLevelEnum,
  workMode: WorkModeEnum.optional(),
  isRemote: z.boolean().default(false),
  locationCity: z.string().max(100).optional(),
  locationCountry: z.string().max(100).optional(),
  locationCoordinates: z.string().optional(),
  deadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  compensationType: CompensationTypeEnum.optional(),
  compensationMin: z.number().min(0).optional(),
  compensationMax: z.number().min(0).optional(),
  compensationCurrency: z.string().length(3).default("USD"),
  compensationPeriod: z.string().optional(),
  skillsRequired: z.array(z.string()).default([]),
  educationRequirements: z.array(z.string()).default([]),
  experienceRequired: z.string().optional(),
  languageRequirements: z.array(z.string()).default([]),
  applicationUrl: z.string().url().optional(),
  applicationEmail: z.string().email().optional(),
  applicationInstructions: z.string().optional(),
  sourcePlatform: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  originalMarkdown: z.string().optional(),
  status: StatusEnum.default("DRAFT"),
  keywords: z.array(z.string()).default([]),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  eligibilityCriteria: z.array(z.object({
    type: z.string(),
    description: z.string(),
    required: z.boolean().default(true),
  })).optional(),
  benefits: z.array(z.object({
    type: z.string(),
    description: z.string(),
    value: z.string().optional(),
  })).optional(),
  requiredMaterials: z.array(z.object({
    type: z.string(),
    description: z.string(),
    required: z.boolean().default(true),
  })).optional(),
  timelineEvents: z.array(z.object({
    eventType: z.string(),
    title: z.string(),
    eventDate: z.string().datetime().optional(),
    description: z.string().optional(),
  })).optional(),
  contacts: z.array(z.object({
    type: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  })).optional(),
});

// Update opportunity schema (all fields optional)
export const UpdateOpportunitySchema = CreateOpportunitySchema.partial();

// =============================================================================
// Search Schemas
// =============================================================================

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.object({
    category: z.union([CategoryEnum, z.array(CategoryEnum)]).optional(),
    industry: z.union([IndustryEnum, z.array(IndustryEnum)]).optional(),
    roleType: z.union([z.string(), z.array(z.string())]).optional(),
    experienceLevel: z.union([ExperienceLevelEnum, z.array(ExperienceLevelEnum)]).optional(),
    workMode: z.union([WorkModeEnum, z.array(WorkModeEnum)]).optional(),
    isRemote: z.boolean().optional(),
    locationCountry: z.union([z.string(), z.array(z.string())]).optional(),
    locationCity: z.string().optional(),
    deadlineAfter: z.string().datetime().optional(),
    deadlineBefore: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
  }).optional(),
  searchMode: z.enum(["text", "semantic", "hybrid"]).default("hybrid"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
});

// =============================================================================
// Admin Schemas
// =============================================================================

export const ParseRequestSchema = z.object({
  markdown: z.string().min(1),
  sourcePlatform: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  category: z.enum(["SKILL", "TECHNOLOGY", "BENEFIT", "PROGRAM", "INDUSTRY", "LOCATION", "ROLE", "OTHER"]),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
});

// =============================================================================
// Validation Helper
// =============================================================================

import { errorResponse, jsonResponse, StatusCodes } from "./response";

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      
      return {
        success: false,
        response: jsonResponse(
          errorResponse("VALIDATION_ERROR", "Invalid request body", { errors }),
          StatusCodes.BAD_REQUEST
        ),
      };
    }
    
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: jsonResponse(
        errorResponse("BAD_REQUEST", "Invalid JSON in request body"),
        StatusCodes.BAD_REQUEST
      ),
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: Response } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  const result = schema.safeParse(params);
  
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    
    return {
      success: false,
      response: jsonResponse(
        errorResponse("VALIDATION_ERROR", "Invalid query parameters", { errors }),
        StatusCodes.BAD_REQUEST
      ),
    };
  }
  
  return { success: true, data: result.data };
}
