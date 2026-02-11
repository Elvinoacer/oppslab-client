// =============================================================================
// Admin Authentication Middleware
// Simple auth check for admin API routes
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse, jsonResponse, StatusCodes } from "@/lib/api";
import { auth } from "@/auth";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

/**
 * Verify admin authentication from request headers
 * Returns user if authenticated, null otherwise
 * 
 * In production, this would verify JWT/session tokens.
 * For now, uses a simple API key approach.
 */
export async function verifyAdminAuth(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  // Check for API key in header
  const apiKey = request.headers.get("x-api-key");
  const authHeader = request.headers.get("authorization");
  
  // Option 1: API Key authentication
  if (apiKey) {
    const validApiKey = process.env.ADMIN_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      return null;
    }
    
    // Return admin user for API key auth
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true, name: true, role: true },
    });
    
    return adminUser;
  }
  
  // Option 2: NextAuth Session (JWT or Database)
  try {
    const session = await auth(); 
    
    if (session?.user?.role === "ADMIN") {
      // Ensure user exists in DB to prevent foreign key issues later
      const userId = session.user.id || "unknown-admin";
      
      try {
        const dbUser = await prisma.user.upsert({
          where: { id: userId },
          update: {
            email: session.user.email || undefined,
            name: session.user.name || undefined,
          },
          create: {
            id: userId,
            email: session.user.email || "admin@opportunities.app",
            name: session.user.name || "System Admin",
            role: "ADMIN",
          },
          select: { id: true, email: true, name: true, role: true },
        });
        
        return dbUser as AuthenticatedUser;
      } catch (dbError) {
        console.error("[AUTH DEBUG] Failed to upsert admin user:", dbError);
        // Fallback to session user to avoid blocking
        return {
          id: userId,
          email: session.user.email || "unknown",
          name: session.user.name || null,
          role: "ADMIN"
        };
      }
    }
  } catch (error) {
    console.error("NextAuth check failed:", error);
  }

  // Option 3: Bearer token (Manual fallback, e.g. for testing)
  if (authHeader?.startsWith("Bearer ")) {
     // ... potentially keep this if you have external services using tokens
  }
  
  return null;
}

/**
 * Higher-order function to protect admin routes
 */
export function withAdminAuth<T>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: T[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T[]): Promise<Response> => {
    const user = await verifyAdminAuth(request);
    
    if (!user) {
      return jsonResponse(
        errorResponse("UNAUTHORIZED", "Admin authentication required"),
        StatusCodes.UNAUTHORIZED
      );
    }
    
    return handler(request, user, ...args);
  };
}
