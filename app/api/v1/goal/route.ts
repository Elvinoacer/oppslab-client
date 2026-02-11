// =============================================================================
// Goal Classification API — POST /api/v1/goal
// =============================================================================
// Uses Gemini to classify a user's free-text goal into a segment + categories.
// Saves the result in User.preferences.goal for logged-in users.
// =============================================================================

import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonResponse, errorResponse, successResponse, StatusCodes } from "@/lib/api";

const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

// Pre-defined persona mappings (fast path — no AI call needed)
const PERSONA_PRESETS: Record<string, GoalClassification> = {
  "quick-money": {
    segment: "unskilled",
    categories: ["TASK", "GIG", "SIDE_HUSTLE", "SURVEY", "DATA_LABELING", "USER_TESTING", "MYSTERY_SHOPPING", "TRANSCRIPTION", "VIRTUAL_ASSISTANT"],
    searchQuery: "quick easy tasks gig work",
    summary: "Quick ways to earn money with tasks and gig work",
  },
  "student": {
    segment: "student",
    categories: ["SCHOLARSHIP", "GRANT", "INTERNSHIP", "FELLOWSHIP", "RESEARCH", "COMPETITION", "VOLUNTEER", "PROGRAM", "APPRENTICESHIP"],
    searchQuery: "scholarships internships student opportunities",
    summary: "Scholarships, internships, and academic opportunities",
  },
  "professional": {
    segment: "professional",
    categories: ["FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE", "JOB", "CONSULTING", "COACHING"],
    searchQuery: "remote jobs professional career",
    summary: "Professional jobs, contracts, and career opportunities",
  },
  "entrepreneur": {
    segment: "entrepreneur",
    categories: ["GRANT", "FUNDING", "COMPETITION", "ACCELERATOR", "PROGRAM", "MENTORSHIP", "INVESTMENT"],
    searchQuery: "startup funding business grants",
    summary: "Funding, grants, and resources for entrepreneurs",
  },
};

interface GoalClassification {
  segment: string;
  categories: string[];
  searchQuery: string;
  summary: string;
}

async function classifyGoalWithAI(goalText: string): Promise<GoalClassification> {
  const prompt = `You are a goal classifier for OppsLab, a platform that helps people find opportunities.

Given the user's goal, classify them into ONE segment and return the most relevant opportunity categories.

SEGMENTS:
- "unskilled": People looking for quick money, side hustles, tasks, no special skills needed
- "student": Students looking for scholarships, internships, academic programs, learning
- "professional": Experienced people looking for jobs, contracts, freelance work
- "entrepreneur": People looking to start/grow businesses, get funding, attend accelerators

AVAILABLE CATEGORIES:
TASK, GIG, SIDE_HUSTLE, SURVEY, DATA_LABELING, USER_TESTING, MYSTERY_SHOPPING,
INTERNSHIP, FULL_TIME, PART_TIME, CONTRACT, FREELANCE, JOB,
SCHOLARSHIP, GRANT, FELLOWSHIP, RESEARCH, VOLUNTEER, COMPETITION, PROGRAM, APPRENTICESHIP,
FUNDING, ACCELERATOR, MENTORSHIP, INVESTMENT,
TUTORING, CONSULTING, COACHING, VIRTUAL_ASSISTANT, TRANSCRIPTION, TRANSLATION,
DROPSHIPPING, PRINT_ON_DEMAND, DIGITAL_PRODUCT, RESELLING, HANDMADE,
CONTENT_MONETIZATION, SPONSORSHIP, NEWSLETTER, COURSE, PODCASTING, MEMBERSHIP,
WEBSITE_FLIPPING, DOMAIN_FLIPPING, REAL_ESTATE_DIGITAL, TRADING_CRYPTO, TRADING_STOCK,
BUG_BOUNTY, AI_TRAINING, AMBASSADOR, AFFILIATE, CONFERENCE, WORKSHOP

USER'S GOAL: "${goalText}"

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "segment": "unskilled|student|professional|entrepreneur",
  "categories": ["TOP_5_MOST_RELEVANT_CATEGORIES"],
  "searchQuery": "a short search query to find matching opportunities",
  "summary": "a one-sentence friendly summary of what we'll help them find"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip any accidental markdown fences
    const clean = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(clean) as GoalClassification;

    // Validate
    if (!parsed.segment || !parsed.categories?.length) {
      throw new Error("Invalid AI response structure");
    }
    return parsed;
  } catch (error) {
    console.error("Goal classification AI error:", error);
    // Fallback to a generic classification
    return {
      segment: "student",
      categories: ["SCHOLARSHIP", "INTERNSHIP", "JOB", "GRANT", "TASK"],
      searchQuery: goalText,
      summary: "Opportunities matching your interests",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, persona } = body as { goal?: string; persona?: string };

    if (!goal && !persona) {
      return jsonResponse(
        errorResponse("BAD_REQUEST", "Provide a 'goal' (text) or 'persona' (preset key)"),
        StatusCodes.BAD_REQUEST
      );
    }

    let classification: GoalClassification;

    // Fast path: use preset if persona matches
    if (persona && PERSONA_PRESETS[persona]) {
      classification = PERSONA_PRESETS[persona];
    } else if (goal) {
      classification = await classifyGoalWithAI(goal);
    } else {
      return jsonResponse(
        errorResponse("BAD_REQUEST", "Invalid goal input"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Save to user preferences if logged in
    const session = await auth();
    if (session?.user?.id) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { preferences: true },
        });

        const currentPrefs = (existingUser?.preferences as Record<string, unknown>) || {};
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            preferences: {
              ...currentPrefs,
              goal: {
                ...classification,
                rawInput: goal || persona,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        });
      } catch (dbError) {
        console.error("Failed to save goal to user preferences:", dbError);
        // Non-fatal — continue returning the classification
      }
    }

    return jsonResponse(
      successResponse(classification)
    );
  } catch (error) {
    console.error("Goal API Error:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to process goal"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
