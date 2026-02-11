// =============================================================================
// POST /api/v1/admin/parse-batch - Parse multiple opportunities with AI
// =============================================================================

import { NextRequest } from "next/server";
// Gemini model configuration
// Using separate import inside handler to avoid build time issues if needed, 
// or clean up later. For now removing the old getGenAI helper to use the new SDK directly.
import { verifyAdminAuth } from "@/lib/api/auth";
import {
  successResponse,
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";

// Re-use types from single parse if possible, or redefine for batch
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

type BatchParseResponse = {
  opportunities: ParsedOpportunity[];
  quality: {
    count: number;
    issues: string[];
  };
};

function getBatchParsePrompt(categoriesStr: string, today: string) {
  return `You are an expert at parsing MULTIPLE opportunity listings from a single text.

**OBJECTIVE:** Extract a list of HIGH-QUALITY, structured opportunities.
**CRITICAL:** Every opportunity MUST have a **Direct Application Link** and a **Deadline** (if available).
**TODAY'S DATE:** ${today}

Given the following content, extract a LIST of structured opportunities. Use the same schema for each item.

Categories must be one of: ${categoriesStr}

Experience levels: ENTRY_LEVEL, MID_LEVEL, SENIOR, EXECUTIVE, STUDENT, ANY

Output ONLY valid JSON matching this schema:
{
  "opportunities": [
    {
      "title": "string (required - Clear and specific)",
      "company": "string (required - Who is offering it?)",
      "description": "string (required - COMPREHENSIVE summary including core mission, responsibilities, and eligibility. Detail over brevity.)",
      "shortDescription": "string (required - 1-2 sentence summary)",
      "primaryCategory": "string (required - MUST be one of the slugs provided below: ${categoriesStr})",
      "experienceLevel": "string (required - MUST be one of: ENTRY_LEVEL, MID_LEVEL, SENIOR, EXECUTIVE, STUDENT, ANY)",
      "isRemote": boolean,
      "locationCity": "string (Extract City if mentioned, e.g. 'Nairobi', 'New York')",
      "locationCountry": "string (Extract Country if mentioned, e.g. 'Kenya', 'USA')",
      "compensationType": "SALARY, HOURLY, STIPEND, PRIZE, EQUITY, UNPAID, NEGOTIABLE, NOT_SPECIFIED (optional, default NOT_SPECIFIED)",
      "compensationMin": number (optional),
      "compensationMax": number (optional),
      "compensationCurrency": "USD, KES, etc (optional)",
      "deadline": "YYYY-MM-DD string (CRITICAL: Extract strict YYYY-MM-DD date. If 'next Friday', calculate it relative to ${today}. If 'Rolling', use 'Rolling'. If not found, leave null. DEADLINE MUST NOT BE IN THE PAST.)",
      "skillsRequired": ["array of skills (MANDATORY - extracted from requirements)"],
      "applicationUrl": "string (DIRECT link to apply. DO NOT link to generic home page. MANDATORY.)",
      "imageUrl": "string (DIRECT URL to opportunity image or Company Logo)",
      "sourceUrl": "string (optional)"
    }
  ],
  "quality": {
    "count": number,
    "issues": ["array of general issues if any"]
  }
}

Content to parse:
`;
}

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
    const { markdown } = body;

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

    const today = new Date().toISOString().split('T')[0];

    // Call Gemini API (New SDK)
    const { GoogleGenAI } = await import("@google/genai");
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY });
    
    // Config for Gemini 3 Flash
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: getBatchParsePrompt(categoriesStr, today) + markdown,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: {
          includeThoughts: false, // We just want the JSON output
        }
      }
    });

    const responseText = result.text || "";
    
    let parsed: BatchParseResponse;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return jsonResponse(successResponse(parsed));
  } catch (error) {
    console.error("Batch parse error:", error);
    return jsonResponse(
      errorResponse(
        "INTERNAL_ERROR",
        error instanceof Error ? error.message : "Failed to parse content"
      ),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
