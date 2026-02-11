// =============================================================================
// API Error Handling Middleware
// Consistent error handling across all API routes
// =============================================================================

import { NextRequest } from "next/server";
import { errorResponse, jsonResponse, StatusCodes } from "./response";

/**
 * Wrap API handler with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error("API Error:", error);
      
      // Handle known error types
      if (error instanceof ApiError) {
        return jsonResponse(
          errorResponse(error.code, error.message, error.details),
          error.statusCode
        );
      }
      
      // Handle Prisma errors
      if (isPrismaError(error)) {
        return handlePrismaError(error);
      }
      
      // Handle validation errors
      if (isZodError(error)) {
        return jsonResponse(
          errorResponse("VALIDATION_ERROR", "Invalid request data", {
            errors: error.errors,
          }),
          StatusCodes.BAD_REQUEST
        );
      }
      
      // Generic error
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      return jsonResponse(
        errorResponse("INTERNAL_ERROR", message),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  };
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public code: "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "RATE_LIMITED" | "INTERNAL_ERROR",
    message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
  
  static badRequest(message: string, details?: Record<string, unknown>) {
    return new ApiError("BAD_REQUEST", message, StatusCodes.BAD_REQUEST, details);
  }
  
  static unauthorized(message = "Authentication required") {
    return new ApiError("UNAUTHORIZED", message, StatusCodes.UNAUTHORIZED);
  }
  
  static forbidden(message = "Access denied") {
    return new ApiError("FORBIDDEN", message, StatusCodes.FORBIDDEN);
  }
  
  static notFound(message = "Resource not found") {
    return new ApiError("NOT_FOUND", message, StatusCodes.NOT_FOUND);
  }
  
  static validationError(message: string, details?: Record<string, unknown>) {
    return new ApiError("VALIDATION_ERROR", message, StatusCodes.BAD_REQUEST, details);
  }
}

/**
 * Check if error is a Prisma error
 */
function isPrismaError(error: unknown): error is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code.startsWith("P")
  );
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: { code: string; meta?: Record<string, unknown> }): Response {
  switch (error.code) {
    case "P2002": // Unique constraint violation
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "A record with this value already exists", {
          fields: error.meta?.target,
        }),
        StatusCodes.BAD_REQUEST
      );
      
    case "P2025": // Record not found
      return jsonResponse(
        errorResponse("NOT_FOUND", "Record not found"),
        StatusCodes.NOT_FOUND
      );
      
    case "P2003": // Foreign key constraint violation
      return jsonResponse(
        errorResponse("VALIDATION_ERROR", "Related record not found", {
          field: error.meta?.field_name,
        }),
        StatusCodes.BAD_REQUEST
      );
      
    default:
      return jsonResponse(
        errorResponse("INTERNAL_ERROR", "Database error occurred"),
        StatusCodes.INTERNAL_SERVER_ERROR
      );
  }
}

/**
 * Check if error is a Zod validation error
 */
function isZodError(error: unknown): error is { errors: Array<{ path: string[]; message: string }> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown }).errors)
  );
}
