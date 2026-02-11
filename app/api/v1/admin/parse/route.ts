// =============================================================================
// POST /api/v1/admin/parse - Parse markdown opportunity with AI
// =============================================================================

import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyAdminAuth } from "@/lib/api/auth";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";
import { getCategoryCoverImage } from "@/lib/images";
import { prisma } from "@/lib/prisma";

// Types for parsed opportunity data
type ParsedOpportunity = {
  title: string;
  company: string;
  description: string;
  shortDescription: string;
  primaryCategory: string;
  industry?: string;
  roleType?: string;
  experienceLevel: string;
  workMode?: string;
  isRemote: boolean;
  locationCity?: string;
  locationCountry?: string;
  deadline?: string;
  startDate?: string;
  compensationType?: string;
  compensationMin?: number;
  compensationMax?: number;
  compensationCurrency?: string;
  skillsRequired: string[];
  educationRequirements: string[];
  experienceRequired?: string;
  keywords: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  applicationInstructions?: string;
  eligibilityCriteria: Array<{ type: string; description: string; required: boolean }>;
  benefits: Array<{ type: string; description: string; value?: string }>;
  requiredMaterials: Array<{ type: string; description: string; required: boolean }>;
  timelineEvents: Array<{ eventType: string; title: string; date?: string; description?: string }>;
  contacts: Array<{ type: string; name?: string; email?: string; phone?: string }>;
};

type ParseResponse = {
  extractedData: ParsedOpportunity;
  suggestions: string[];
  quality: {
    score: number;
    completeness: number;
    issues: string[];
  };
  rawResponse?: string;
};

// Using separate import inside handler to avoid build time issues if needed,
// or clean up later. For now removing the old getGenAI helper to use the new SDK directly.

function getParsePrompt(categoriesStr: string, today: string) {
  return `You are an expert at parsing opportunity listings (jobs, scholarships, grants, internships, fellowships, etc.) from markdown or text content.

**OBJECTIVE:** Extract HIGH-QUALITY opportunity data.
**CRITICAL:** Every opportunity MUST have a **Direct Application Link** and a **Deadline** (if available). 
**TODAY'S DATE:** ${today}

Given the following content from a listing, extract structured data in JSON format. Be thorough and extract all available information.

Categories must be one of: ${categoriesStr}

Industries must be one of: TECHNOLOGY, HEALTHCARE, FINANCE, EDUCATION, GOVERNMENT, NONPROFIT, CONSULTING, MEDIA, ENTERTAINMENT, RETAIL, MANUFACTURING, ENERGY, AGRICULTURE, TRANSPORTATION, LOGISTICS, REAL_ESTATE, HOSPITALITY, TOURISM, LEGAL, CONSTRUCTION, AUTOMOTIVE, TELECOMMUNICATIONS, AEROSPACE, BIOTECHNOLOGY, PHARMACEUTICAL, FASHION, FOOD_BEVERAGE, SPORTS, GAMING, OTHER

Experience levels must be one of: ENTRY_LEVEL, MID_LEVEL, SENIOR, EXECUTIVE, STUDENT, ANY

Output ONLY valid JSON matching this schema:
{
  "extractedData": {
    "title": "string (required - Clear and specific)",
    "company": "string (required - Who is offering it?)",
    "description": "string (required - COMPREHENSIVE summary including core mission, responsibilities, and eligibility. Detail over brevity.)",
    "shortDescription": "string (required - 1-2 sentence summary)",
    "primaryCategory": "string (required - from categories list provided: ${categoriesStr})",
    "industry": "string (optional - from industries list)",
    "roleType": "string (optional)",
    "experienceLevel": "string (required - from experience levels)",
    "workMode": "string (optional - REMOTE, HYBRID, ONSITE, FLEXIBLE)",
    "isRemote": boolean,
    "locationCity": "string (Extract City if mentioned, e.g. 'Nairobi', 'New York')",
    "locationCountry": "string (Extract Country if mentioned, e.g. 'Kenya', 'USA')",
    "deadline": "YYYY-MM-DD string (CRITICAL: Extract strict YYYY-MM-DD date. If 'next Friday', calculate it relative to ${today}. If 'Rolling', use 'Rolling'. If not found, leave null. DEADLINE MUST NOT BE IN THE PAST.)",
    "startDate": "ISO date string (optional)",
    "compensationType": "SALARY, HOURLY, STIPEND, PRIZE, EQUITY, UNPAID, NEGOTIABLE, NOT_SPECIFIED (optional, default NOT_SPECIFIED)",
    "compensationMin": number (optional),
    "compensationMax": number (optional),
    "compensationCurrency": "USD, KES, etc (optional)",
    "skillsRequired": ["array of skills (MANDATORY - extracted from requirements)"],
    "educationRequirements": ["array of education levels"],
    "experienceRequired": "string description (optional - e.g. 5+ years React experience)",
    "keywords": ["relevant keywords"],
    "applicationUrl": "string (DIRECT link to apply. DO NOT link to generic home page. MANDATORY.)",
    "imageUrl": "string (DIRECT URL to opportunity image or Company Logo. Prefer specific opportunity images if available.)",
    "applicationEmail": "string (optional)",
    "applicationInstructions": "string (optional)",
    "eligibilityCriteria": [{"type": "string", "description": "string", "required": boolean}],
    "benefits": [{"type": "string", "description": "string", "value": "optional string"}],
    "requiredMaterials": [{"type": "string", "description": "string", "required": boolean}],
    "timelineEvents": [{"eventType": "string", "title": "string", "date": "ISO date", "description": "string"}],
    "contacts": [{"type": "string", "name": "string", "email": "string", "phone": "string"}]
  },
  "suggestions": ["array of suggestions to improve the listing"],
  "quality": {
    "score": number (0-100),
    "completeness": number (0-100, percentage of fields filled),
    "issues": ["array of issues found"]
  }
}

Content to parse:
`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { markdown, sourcePlatform, sourceUrl } = body;

    if (!markdown || typeof markdown !== "string") {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "markdown field is required"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Fetch categories from DB
    const dbCategories = await prisma.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: "asc" }
    });

    const categoriesStr = dbCategories.length > 0 
      ? dbCategories.map(c => c.slug).join(", ")
      : "FREELANCE, CONTRACT, INTERNSHIP, FULL_TIME, PART_TIME, TUTORING, CONSULTING, VIRTUAL_ASSISTANT, TRANSCRIPTION, TRANSLATION, COACHING, DROPSHIPPING, PRINT_ON_DEMAND, DIGITAL_PRODUCT, RESELLING, HANDMADE, CONTENT_MONETIZATION, SPONSORSHIP, NEWSLETTER, COURSE, PODCASTING, MEMBERSHIP, WEBSITE_FLIPPING, DOMAIN_FLIPPING, REAL_ESTATE_DIGITAL, TRADING_CRYPTO, TRADING_STOCK, INVESTMENT, USER_TESTING, DATA_LABELING, BUG_BOUNTY, AI_TRAINING, MYSTERY_SHOPPING, SCHOLARSHIP, GRANT, FELLOWSHIP, RESEARCH, VOLUNTEER, COMPETITION, PROGRAM, APPRENTICESHIP, GIG, SIDE_HUSTLE, SURVEY, AFFILIATE, AMBASSADOR, OTHER";

    // Add context about source if provided
    let contextPrefix = "";
    if (sourcePlatform || sourceUrl) {
      contextPrefix = `Source: ${sourcePlatform || "Unknown"}\nURL: ${sourceUrl || "Not provided"}\n\n`;
    }

    const today = new Date().toISOString().split('T')[0];

    // Call Gemini API (New SDK)
    const { GoogleGenAI } = await import("@google/genai");
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY });

    // Config for Gemini 3 Flash
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getParsePrompt(categoriesStr, today) + contextPrefix + markdown,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: {
          includeThoughts: false,
        }
      }
    });
    const responseText = result.text || "";
    // Parse JSON response
    let parsed: ParseResponse;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // ... existing catch block ...
    }

    // Assign cover image based on category
    // @ts-ignore - parsed is definitely assigned if no error thrown above
    if (parsed && parsed.extractedData && parsed.extractedData.primaryCategory) {
      // @ts-ignore - appending un-typed field for now, will be saved to DB
      parsed.extractedData.coverImage = getCategoryCoverImage(parsed.extractedData.primaryCategory, parsed.extractedData.title);
    }

    // Add source metadata
    const response: ParseResponse & { source?: { platform?: string; url?: string } } = {
      ...parsed!,
      source: sourcePlatform || sourceUrl ? { platform: sourcePlatform, url: sourceUrl } : undefined,
    };

    return jsonResponse(successResponse(response));
  } catch (error) {
    console.error("Parse error:", error);
    return jsonResponse(
      errorResponse(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Failed to parse content"
      ),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
