
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("Missing GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

export interface UserContext {
  name?: string | null;
  bio?: string | null;
  skills: string[];
  location?: string | null;
  isLoggedIn?: boolean;
  profileImage?: string | null;
  goal?: { segment: string; summary: string; categories: string[] } | null;
}

export interface OpportunityContext {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  experienceLevel: string;
  isRemote: boolean;
  location?: string;
  slug?: string;
  deadline?: string;
  primaryCategory?: string;
  compensationType?: string;
  compensation?: string;
  matchReason?: string;
}

/**
 * Build the system prompt for OppsBot
 */
function buildSystemPrompt(
  userContext: UserContext,
  opportunities: OpportunityContext[],
  currentQuery: string
): string {
  // Assess profile completeness
  const missingFields: string[] = [];
  if (!userContext.bio) missingFields.push("bio");
  if (!userContext.skills || userContext.skills.length === 0) missingFields.push("skills");
  if (!userContext.location) missingFields.push("location");

  const profileComplete = missingFields.length === 0;
  const profileSection = userContext.isLoggedIn
    ? `USER PROFILE (Logged In):
Name: ${userContext.name || "Not set"}
Bio: ${userContext.bio || "Not provided"}
Skills: ${userContext.skills.join(", ") || "None listed"}
Location: ${userContext.location || "Unknown"}
Goal: ${userContext.goal ? `${userContext.goal.summary} (segment: ${userContext.goal.segment}, categories: ${userContext.goal.categories.join(", ")})` : "Not set yet — ask them what they're looking for!"}
Profile Complete: ${profileComplete ? "Yes" : `No — missing: ${missingFields.join(", ")}`}`
    : `USER PROFILE (Guest — not logged in):
The user is not signed in. If they ask about personalized features, suggest signing in at /auth/signin.`;

  return `You are "OppsBot", a helpful and encouraging career assistant for the OppsLab platform.
Your goal is to help users find opportunities (jobs, gigs, scholarships, grants) that match their profile.

${profileSection}

PLATFORM NAVIGATION URLS (use these when directing users):
- Update profile (name, bio, skills, interests): /dashboard/profile
- Account settings: /dashboard/settings
- Saved opportunities: /dashboard/saved
- Saved searches: /dashboard/searches
- Resume builder: /dashboard/resumes
- Applications tracker: /dashboard/applications
- Sign in: /auth/signin
- Browse opportunities: /opportunities
- Search: /search

RELEVANT OPPORTUNITIES FROM DATABASE:
${opportunities.length > 0 ? opportunities.map((opp, i) => `
[${i + 1}] ${opp.title} at ${opp.company}
   - Category: ${opp.primaryCategory || "N/A"}
   - Remote: ${opp.isRemote ? "Yes" : "No"} | Location: ${opp.location || "N/A"}
   - Level: ${opp.experienceLevel}
   - Skills: ${opp.skills?.join(", ") || "N/A"}
   - Compensation: ${opp.compensation || opp.compensationType || "Not specified"}
   - Deadline: ${opp.deadline || "Open"}
   - Page Link: /opportunities/${opp.slug || opp.id}
`).join("\n") : "No specific matches found in the database for this query."}

INSTRUCTIONS:
1. Answer the user's question naturally, warmly, and concisely.
2. If the user asks for opportunities or expresses ANY need (money, jobs, learning, etc.), ALWAYS recommend items from the RELEVANT OPPORTUNITIES list above. NEVER respond with only advice — always include at least one opportunity link.
3. ALWAYS include a clickable link for EVERY opportunity you mention. Format: [View Opportunity Title](/opportunities/slug). This is CRITICAL — users must be able to click through to the opportunity page directly.
4. When recommending, format each opportunity clearly:
   - **Title** at Company
   - Key details (compensation, remote, deadline)
   - 👉 [View this opportunity](/opportunities/slug)
5. Do NOT invent opportunities. Only use the ones provided in the context.
6. After listing opportunities, you can add brief advice. But opportunities WITH LINKS must always come first.
7. If the RELEVANT OPPORTUNITIES list is somehow empty, ALWAYS link to these category browse pages so the user can find opportunities themselves:
   - [Browse Tasks](/categories/tasks)
   - [Browse Jobs](/categories/jobs)
   - [Browse Gigs](/categories/gigs)
   - [Browse All Opportunities](/opportunities)
   - [Search for specific opportunities](/search)
8. Use markdown formatting for readability (bold titles, bullet lists).
9. Keep responses under 300 words unless the user asks for detail.
10. If the user's profile is incomplete, gently mention what's missing and link to [Update Profile](/dashboard/profile) to complete it. Better profiles = better recommendations.
11. If the user is not logged in and asks about personalized features, suggest signing in at [Sign In](/auth/signin).
12. When suggesting platform pages, always provide the relative URL as a markdown link.
13. For casual/urgent requests like "I need quick cash" or "what can I do right now?", prioritize TASK, GIG, and SURVEY category opportunities and emphasize immediate/fast options.
14. REMEMBER: You are NOT a generic chatbot. You are the gateway to real, actionable opportunities. Your #1 job is to connect users with clickable links to opportunities on this platform.

CURRENT QUERY: ${currentQuery}`;
}

/**
 * Generate a NON-streaming response (fallback).
 */
export async function generateChatResponse(
  history: ChatMessage[],
  userContext: UserContext,
  opportunities: OpportunityContext[],
  currentQuery: string
) {
  const systemPrompt = buildSystemPrompt(userContext, opportunities, currentQuery);

  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    generationConfig: {
      maxOutputTokens: 8192, // Increased from 1000 to prevent cut-off
    },
  });

  try {
    const result = await chat.sendMessage(systemPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Generate a STREAMING response from Gemini.
 * Returns a ReadableStream of text chunks.
 */
export async function generateChatResponseStream(
  history: ChatMessage[],
  userContext: UserContext,
  opportunities: OpportunityContext[],
  currentQuery: string
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt = buildSystemPrompt(userContext, opportunities, currentQuery);
  const encoder = new TextEncoder();

  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    generationConfig: {
      maxOutputTokens: 8192, // Increased from 1000 to prevent cut-off
    },
  });

  const result = await chat.sendMessageStream(systemPrompt);

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            // SSE format: data: <text>\n\n
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`));
          }
        }
        // Send opportunities metadata as final event
        if (opportunities.length > 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "opportunities", data: opportunities })}\n\n`)
          );
        }
        // Signal end of stream
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (error) {
        console.error("Gemini Stream Error:", error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", content: "Failed to generate response." })}\n\n`)
        );
        controller.close();
      }
    },
  });
}
