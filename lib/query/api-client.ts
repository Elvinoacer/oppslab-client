// =============================================================================
// API Client for TanStack Query
// Centralized fetch utilities with error handling
// =============================================================================

import type { ApiResponse } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

/**
 * Fetch options with defaults
 */
export type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * API Error class
 */
export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Generic API fetch function
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, signal } = options;

  const url = endpoint.startsWith("/api")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new ApiClientError(
      data.error.code || "UNKNOWN_ERROR",
      data.error.message || "An error occurred",
      response.status,
      data.error.details
    );
  }

  if (!response.ok) {
    throw new ApiClientError(
      "HTTP_ERROR",
      `HTTP error ${response.status}`,
      response.status
    );
  }

  return data.data;
}

/**
 * GET request helper
 */
export function apiGet<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET", signal });
}

/**
 * POST request helper
 */
export function apiPost<T>(
  endpoint: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "POST", body, signal });
}

/**
 * PUT request helper
 */
export function apiPut<T>(
  endpoint: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "PUT", body, signal });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE", signal });
}

/**
 * Build query string from params object
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | string[] | undefined>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      searchParams.set(key, value.join(","));
    } else {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
