// =============================================================================
// /api/v1/user/resumes/ai-generate - AI-powered resume content generation
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
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

interface RichProfile {
  headline?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa: string;
    highlights: string[];
  }>;
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    highlights: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url: string;
    highlights: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
}

/**
 * POST /api/v1/user/resumes/ai-generate - Generate resume content with AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Please log in"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();
    const { opportunityId } = body;

    // Fetch user with profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        bio: true,
        location: true,
        skills: true,
        richProfile: true,
      },
    });

    if (!user) {
      return jsonResponse(
        errorResponse("NOT_FOUND", "User not found"),
        StatusCodes.NOT_FOUND
      );
    }

    // Check if user has a rich profile
    const richProfile = user.richProfile as RichProfile | null;
    const hasProfile = richProfile && (
      (richProfile.experience && richProfile.experience.length > 0) ||
      (richProfile.education && richProfile.education.length > 0) ||
      (richProfile.projects && richProfile.projects.length > 0)
    );

    if (!hasProfile) {
      return jsonResponse(
        successResponse({
          success: false,
          needsProfile: true,
          message:
            "To help the AI create a great resume for you, please fill out your profile first. Add your education, work experience, and projects so the AI knows you better!",
        })
      );
    }

    // Fetch opportunity context if provided
    let opportunityContext = "";
    if (opportunityId) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
        select: {
          title: true,
          company: true,
          description: true,
          skillsRequired: true,
          experienceLevel: true,
          primaryCategory: true,
        },
      });

      if (opportunity) {
        opportunityContext = `
TARGET OPPORTUNITY:
- Title: ${opportunity.title}
- Company: ${opportunity.company}
- Description: ${opportunity.description?.substring(0, 1000)}
- Required Skills: ${opportunity.skillsRequired?.join(", ") || "Not specified"}
- Experience Level: ${opportunity.experienceLevel || "Not specified"}
- Category: ${opportunity.primaryCategory}

IMPORTANT: Tailor the resume content to highlight relevant experience, skills, and projects for this specific role.
`;
      }
    }

    // Build the AI prompt
    const prompt = `You are a professional resume writer. Generate a polished, professional resume based on the user's profile data.

USER PROFILE:
- Name: ${user.name || "Not provided"}
- Email: ${user.email}
- Location: ${user.location || "Not provided"}
- Bio: ${user.bio || "Not provided"}
- Skills: ${user.skills?.join(", ") || "Not listed"}
- Phone: ${richProfile?.phone || "Not provided"}
- Website: ${richProfile?.website || ""}
- LinkedIn: ${richProfile?.linkedin || ""}
- GitHub: ${richProfile?.github || ""}

EDUCATION:
${JSON.stringify(richProfile?.education || [], null, 2)}

WORK EXPERIENCE:
${JSON.stringify(richProfile?.experience || [], null, 2)}

PROJECTS:
${JSON.stringify(richProfile?.projects || [], null, 2)}

CERTIFICATIONS:
${JSON.stringify(richProfile?.certifications || [], null, 2)}

LANGUAGES:
${JSON.stringify(richProfile?.languages || [], null, 2)}

${opportunityContext}

INSTRUCTIONS:
1. Generate a compelling professional summary (2-3 sentences)
2. Enhance experience descriptions with strong action verbs and quantifiable achievements
3. Make project descriptions concise but impactful
4. List skills in order of relevance${opportunityId ? " to the target opportunity" : ""}
5. Keep all content truthful to what the user provided - do NOT invent experience or skills

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "personalInfo": {
    "fullName": "${user.name || ""}",
    "email": "${user.email}",
    "phone": "${richProfile?.phone || ""}",
    "location": "${user.location || ""}",
    "website": "${richProfile?.website || ""}",
    "linkedin": "${richProfile?.linkedin || ""}",
    "github": "${richProfile?.github || ""}"
  },
  "summary": "A compelling 2-3 sentence professional summary",
  "experience": [
    {
      "company": "Company Name",
      "position": "Position Title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "current": false,
      "description": "Brief role description",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "Degree",
      "field": "Field of Study",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "",
      "highlights": []
    }
  ],
  "skills": ["Skill1", "Skill2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1"],
      "url": "",
      "highlights": ["Impact 1"]
    }
  ],
  "certifications": [],
  "languages": []
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse AI response - strip markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    const resumeData = JSON.parse(cleanedResponse);

    return jsonResponse(
      successResponse({
        success: true,
        data: resumeData,
      })
    );
  } catch (error) {
    console.error("Error generating AI resume:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to generate resume content. Please try again."),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
