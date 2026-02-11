// =============================================================================
// User-Specific Query Hooks
// TanStack Query hooks for authenticated user data
// =============================================================================

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet, buildQueryString } from "./api-client";
import type { OpportunityListItem, PaginatedResponse } from "./types";

// =============================================================================
// User Query Keys
// =============================================================================

export const userQueryKeys = {
  // Saved opportunities (bookmarks)
  savedOpportunities: {
    all: ["saved-opportunities"] as const,
    list: (filters?: { status?: string; page?: number }) =>
      [...userQueryKeys.savedOpportunities.all, "list", filters] as const,
  },
  // Saved searches
  savedSearches: {
    all: ["saved-searches"] as const,
    list: () => [...userQueryKeys.savedSearches.all, "list"] as const,
  },
  // User preferences
  preferences: {
    all: ["user", "preferences"] as const,
  },
  // User profile
  profile: {
    all: ["user", "profile"] as const,
  },
};

// =============================================================================
// Types
// =============================================================================

export type SavedOpportunity = {
  id: string;
  opportunityId: string;
  opportunity: OpportunityListItem;
  notes?: string;
  applicationStatus?: "NOT_STARTED" | "IN_PROGRESS" | "APPLIED" | "REJECTED" | "ACCEPTED";
  appliedAt?: string;
  createdAt: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  filters: Record<string, unknown>;
  notifyOnNew: boolean;
  createdAt: string;
  lastRunAt?: string;
};

export type UserPreferences = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  preferredCategories: string[];
  preferredIndustries: string[];
  preferredLocations: string[];
  preferredWorkMode: string[];
};

// =============================================================================
// Stale Times
// =============================================================================

const USER_STALE_TIMES = {
  savedOpportunities: 30 * 1000, // 30 seconds
  savedSearches: 5 * 60 * 1000, // 5 minutes
  preferences: 10 * 60 * 1000, // 10 minutes
};

// =============================================================================
// User Query Hooks
// =============================================================================

/**
 * Get user's saved opportunities (bookmarks)
 */
export function useSavedOpportunities(options?: {
  status?: string;
  page?: number;
  enabled?: boolean;
}) {
  const { status, page = 1, enabled = true } = options || {};

  return useQuery({
    queryKey: userQueryKeys.savedOpportunities.list({ status, page }),
    queryFn: async ({ signal }) => {
      const queryString = buildQueryString({ status, page });
      return apiGet<PaginatedResponse<SavedOpportunity>>(
        `/user/saved-opportunities${queryString}`,
        signal
      );
    },
    staleTime: USER_STALE_TIMES.savedOpportunities,
    enabled,
  });
}

/**
 * Get user's saved searches
 */
export function useSavedSearches(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userQueryKeys.savedSearches.list(),
    queryFn: async ({ signal }) => {
      return apiGet<SavedSearch[]>("/user/saved-searches", signal);
    },
    staleTime: USER_STALE_TIMES.savedSearches,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get user preferences
 */
export function useUserPreferences(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userQueryKeys.preferences.all,
    queryFn: async ({ signal }) => {
      return apiGet<UserPreferences>("/user/preferences", signal);
    },
    staleTime: USER_STALE_TIMES.preferences,
    enabled: options?.enabled ?? true,
  });
}
