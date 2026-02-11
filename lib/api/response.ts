// =============================================================================
// API Response Types and Utilities
// Consistent response format for all API endpoints
// =============================================================================

// Standard API response wrapper
export type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: ApiMeta;
} | {
  success: false;
  error: ApiError;
};

// Pagination metadata
export type ApiMeta = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

// Error structure
export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

// Common error codes
export const ErrorCodes = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

// HTTP status code mapping
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: keyof typeof ErrorCodes,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Create pagination metadata
 */
export function createPagination(
  page: number,
  pageSize: number,
  totalCount: number
): ApiMeta {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    page,
    pageSize,
    totalPages,
    totalCount,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Parse pagination params from URL
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page: number; pageSize: number } = { page: 1, pageSize: 20 }
): { page: number; pageSize: number; skip: number; take: number } {
  const page = Math.max(1, parseInt(searchParams.get("page") || String(defaults.page), 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || String(defaults.pageSize), 10)));
  
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Parse sort params from URL
 */
export function parseSort(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField: string = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): { field: string; order: "asc" | "desc" } {
  const sortBy = searchParams.get("sortBy") || defaultField;
  const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" || defaultOrder;
  
  return {
    field: allowedFields.includes(sortBy) ? sortBy : defaultField,
    order: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : defaultOrder,
  };
}

/**
 * Create Next.js Response with proper headers
 */
export function jsonResponse<T>(
  data: ApiResponse<T>,
  status: number = StatusCodes.OK,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}
