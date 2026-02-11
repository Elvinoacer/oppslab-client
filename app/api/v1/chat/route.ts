
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import {
  errorResponse,
  jsonResponse,
  StatusCodes,
} from "@/lib/api";
import { generateQueryEmbedding } from "@/lib/pinecone/embeddings";
import { getOpportunitiesIndex } from "@/lib/pinecone/client";
import { generateChatResponseStream, type ChatMessage } from "@/lib/ai/client";

/**
 * POST /api/v1/chat - Streaming AI Chat Interface
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Messages array is required"),
        StatusCodes.BAD_REQUEST
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // Create a TransformStream for the response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start processing in the background
    (async () => {
      try {
        // 1. Get User Context
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "status", content: "Analyzing your profile..." })}\n\n`));
        
        let userContext = {
          skills: [] as string[],
          name: "Guest",
          bio: "",
          location: "",
          isLoggedIn: false,
          profileImage: null as string | null,
          goal: null as { segment: string; summary: string; categories: string[] } | null,
        };

        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, bio: true, skills: true, location: true, image: true, preferences: true },
          });
          if (user) {
            const prefs = (user.preferences as Record<string, any>) || {};
            userContext = {
              skills: user.skills,
              name: user.name || "User",
              bio: user.bio || "",
              location: user.location || "",
              isLoggedIn: true,
              profileImage: user.image || null,
              goal: prefs.goal || null,
            };
          }
        }

        // 2. RAG Retrieval
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "status", content: "Searching for opportunities..." })}\n\n`));
        
        const searchContext = `${userQuery} ${userContext.skills.join(" ")}`;
        let relevantOpportunities: any[] = [];

        try {
          const embedding = await generateQueryEmbedding(searchContext);
          const index = getOpportunitiesIndex();
          
          const searchResponse = await index.query({
            vector: embedding,
            topK: 8,
            includeMetadata: true,
          });

          const opportunityIds = searchResponse.matches
            .filter((match) => (match.score || 0) > 0.45)
            .map((match) => match.id);

          if (opportunityIds.length > 0) {
            const opportunities = await prisma.opportunity.findMany({
              where: { id: { in: opportunityIds } },
              select: {
                id: true,
                slug: true,
                title: true,
                company: true,
                shortDescription: true,
                skillsRequired: true,
                experienceLevel: true,
                primaryCategory: true,
                compensationType: true,
                compensationMin: true,
                compensationMax: true,
                compensationCurrency: true,
                isRemote: true,
                locationCity: true,
                locationCountry: true,
                deadline: true,
              },
            });

            relevantOpportunities = opportunities.map((op) => ({
              id: op.id,
              slug: op.slug,
              title: op.title,
              company: op.company,
              description: op.shortDescription || "",
              skills: op.skillsRequired,
              experienceLevel: op.experienceLevel,
              primaryCategory: op.primaryCategory,
              compensationType: op.compensationType,
              compensation: op.compensationMin && op.compensationMax
                ? `${op.compensationCurrency || ""} ${op.compensationMin} - ${op.compensationMax}`
                : op.compensationMin
                ? `From ${op.compensationCurrency || ""} ${op.compensationMin}`
                : "Not specified",
              isRemote: op.isRemote,
              location: [op.locationCity, op.locationCountry].filter(Boolean).join(", "),
              deadline: op.deadline ? op.deadline.toISOString().split("T")[0] : undefined,
            }));
          }
        } catch (error) {
          console.error("Vector Search Error:", error);
        }

        // 3. Database Fallback
        if (relevantOpportunities.length < 3) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "status", content: "Checking recent listings..." })}\n\n`));
          
          try {
            const fallbackOpps = await prisma.opportunity.findMany({
              where: {
                status: "ACTIVE",
                ...(relevantOpportunities.length > 0
                  ? { id: { notIn: relevantOpportunities.map((o: any) => o.id) } }
                  : {}),
              },
              orderBy: { createdAt: "desc" },
              take: 5 - relevantOpportunities.length,
              select: {
                id: true,
                slug: true,
                title: true,
                company: true,
                shortDescription: true,
                skillsRequired: true,
                experienceLevel: true,
                primaryCategory: true,
                compensationType: true,
                compensationMin: true,
                compensationMax: true,
                compensationCurrency: true,
                isRemote: true,
                locationCity: true,
                locationCountry: true,
                deadline: true,
              },
            });

            const mapped = fallbackOpps.map((op) => ({
              id: op.id,
              slug: op.slug,
              title: op.title,
              company: op.company,
              description: op.shortDescription || "",
              skills: op.skillsRequired,
              experienceLevel: op.experienceLevel,
              primaryCategory: op.primaryCategory,
              compensationType: op.compensationType,
              compensation: op.compensationMin && op.compensationMax
                ? `${op.compensationCurrency || ""} ${op.compensationMin} - ${op.compensationMax}`
                : op.compensationMin
                ? `From ${op.compensationCurrency || ""} ${op.compensationMin}`
                : "Not specified",
              isRemote: op.isRemote,
              location: [op.locationCity, op.locationCountry].filter(Boolean).join(", "),
              deadline: op.deadline ? op.deadline.toISOString().split("T")[0] : undefined,
            }));

            relevantOpportunities = [...relevantOpportunities, ...mapped];
          } catch (fallbackError) {
            console.error("Fallback DB Query Error:", fallbackError);
          }
        }

        // 4. Stream AI Response
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "status", content: "Formulating response..." })}\n\n`));
        
        const history: ChatMessage[] = messages.slice(0, -1).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: msg.content,
        }));

        const aiStream = await generateChatResponseStream(
          history,
          userContext,
          relevantOpportunities,
          userQuery
        );

        const reader = aiStream.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }

        await writer.close();
      } catch (error) {
        console.error("Stream Processing Error:", error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: "error", content: "An error occurred while processing your request." })}\n\n`));
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return jsonResponse(
      errorResponse("INTERNAL_ERROR", "Failed to process chat request"),
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

